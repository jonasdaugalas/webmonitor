import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryCache } from 'app/shared/query-cache/query-cache';

export const MAX_QUERY_SIZE = 1000;
export const MAX_QUERY_SIZE_FOR_NEWEST = 100;

interface Parameters {
    database: string;
    index: string;
    documentType?: string;
    timestampField?: string;
    field: string;
    series: Array<number>;
    extraFields: Array<string>;
    nestedPath?: string;
    terms?: { string: any };
    fillField?: string;
    runField?: string;
}


@Injectable()
export class DataService {

    queryCache = new QueryCache(1000);

    constructor(protected db: DatabaseService) {}

    queryExtremesByTerm(params, term) {
        let query = this.makeExtremesQuery(params);
        query[1]['query']['bool']['filter'].push({"term": term});
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this.db.multiSearch(this.db.stringifyToNDJSON(query), params.db)
            .pipe(map(this.extractExtremes));
    }

    protected _query(queryStr, params, aggregated=false) {
        let extractResponse;
        if (aggregated) {
            extractResponse = (response) => this.extractAggregatedResponseFields(response, params);
        } else {
            extractResponse = (response) => this.extractResponseFields(response, params);
        }
        const queryObs = this.db.multiSearch(queryStr, params.db)
            .pipe(
                map(extractResponse)
            );
        return this.queryCache.ask(
            aggregated + params.database + queryStr, queryObs
        ) as Observable<Array<any>>;
    }

    queryRangeAggregated(params: Parameters, min, max, aggregation='avg', buckets=1800) {
        if (params.nestedPath) {
            return Observable.throwError('Cannot do aggregation queries with nestedPath');
        }
        let query = this.makeAggregationQuery(params, min, max, aggregation, buckets);
        return this._query(this.db.stringifyToNDJSON(query), params, true);
    }

    makeAggregationQuery(params, min, max, aggregation='avg', buckets=1800) {
        const header = {
            index: params.index,
            type: params.documentType
        };
        const interval = Math.ceil(
            ((new Date(max)).getTime() - (new Date(min)).getTime()) / buckets
        );
        const body = {
            'size':0,
            'query':{
                'bool':{'filter':[]}
            },
            'aggs':{
                'points':{
                    'date_histogram':{
                        'field': params.timestampField,
                        'interval': String(interval) + 'ms',
                        'extended_bounds':{
                            'min': min,
                            'max':max
                        }
                    },
                    'aggs': {}
                }
            }
        };
        body['query']['bool']['filter'].push({
            'range':{'timestamp':{'gte': min, 'lte': max}}
        });
        if (params.extraFields.length > 0) {
            body['aggs']['points']['aggs']['_extra'] = {'top_hits': {'size': 1}};
            body['aggs']['points']['aggs']['_extra']['top_hits']['_source'] = {
                'include': params.extraFields
            };
        }
        params.series.forEach(s => {
            const agg = {};
            agg[aggregation] = {'script': "_source." + params.field + '[' + s + ']'};
            body['aggs']['points']['aggs'][':' + s] = agg;
        });
        if (params.terms) {
            Object.keys(params.terms).forEach(k => {
                const term = {};
                term[k] = params.terms[k];
                body['query']['bool']['filter'].push({'term': term});
            });
        }
        return [header, body];
    }

    queryTerm(params, term) {
        let query = this.makeQueryTemplate(params);
        query[1]['query']['bool']['filter'].push({"term": term});
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    queryNewest(params: Parameters, size) {
        let query = this.makeQueryTemplate(params);
        query[1]['size'] = size > MAX_QUERY_SIZE ? MAX_QUERY_SIZE : size;
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    queryRange(params: Parameters, min, max) {
        let query = this.makeQueryTemplate(params);
        const range = {};
        range[params.timestampField] = {
            "gte": min,
            "lte": max
        }
        query[1]['query']['bool']['filter'].push({"range": range});
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    queryNewestSince(params: Parameters, since, includeEqual=true) {
        let query = this.makeQueryTemplate(params);
        query[1]['size'] = MAX_QUERY_SIZE_FOR_NEWEST;
        const range = {};
        if (includeEqual) {
            range[params.timestampField] = {"gte": since}
        } else {
            range[params.timestampField] = {"gt": since}
        }
        query[1]['query']['bool']['filter'].push({"range": range});
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    queryBasicX(params: Parameters, xField, min?, max?, size=MAX_QUERY_SIZE) {
        let query = this.makeQueryTemplate(params, xField);
        query[1]['sort'] = {}
        query[1]['sort'][xField] = 'desc';
        query[1]['size'] = size > MAX_QUERY_SIZE ? MAX_QUERY_SIZE : size;
        if (typeof min != 'undefined' || typeof max != 'undefined') {
            const range = {};
            range[xField] = {"gte": min, "lte": max};
            query[1]['query']['bool']['filter'].push({"range": range});
        }
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    protected makeExtremesQuery(params: Parameters) {
        const header = {
            index: params.index,
            type: params.documentType
        };
        const body = {
            "size": 0,
            "query": {
                "bool": {
                    "filter": []
                }
            },
            'aggs':{
                'min_ts':{
                    'min':{
                        'field': params.timestampField
                    }
                },
                'max_ts':{
                    'max':{
                        'field': params.timestampField
                    }
                }
            }
        };
        if (params.terms) {
            Object.keys(params.terms).forEach(k => {
                const term = {};
                term[k] = params.terms[k];
                body['query']['bool']['filter'].push({'term': term});
            });
        }
        return [header, body];
    }

    protected makeQueryTemplate(params: Parameters, xField=undefined) {
        const header = {
            index: params.index,
            type: params.documentType
        };
        const body = {
            "_source": this.parseQueryFields(params, xField),
            "sort": {},
            "size": MAX_QUERY_SIZE,
            "query": {
                "bool": {
                    "filter": []
                }
            }
        };
        if (xField) {
            body['sort'][xField] = 'desc';
        } else {
            body['sort'][params.timestampField] = 'desc';
        }
        if (params.terms) {
            Object.keys(params.terms).forEach(k => {
                const term = {};
                term[k] = params.terms[k];
                body['query']['bool']['filter'].push({'term': term});
            });
        }
        return [header, body];
    }

    protected parseQueryFields(params: Parameters, xField=undefined) {
        const fields = [params.field];
        xField ? fields.push(xField) : fields.push(params.timestampField);
        if (params.extraFields.length > 0) {
            return fields.concat(params.extraFields);
        }
        return fields;
    }

    protected extractResponseFields(response, params): Array<any> {
        response = response['responses'][0]['hits']['hits'].reverse()
            .map(hit => hit['_source']);
        if (params.nestedPath) {
            response = response.map(hit => hit[params.nestedPath]);
        }
        return response;
    }

    protected extractAggregatedResponseFields(response, params): Array<any> {
        const buckets = response['responses'][0]['aggregations']['points']['buckets'];
        const result = [];
        buckets.forEach(bucket => {
            const point = {};
            const fieldVal = [];
            point[params.timestampField] = bucket['key_as_string'];
            params.series.forEach(s => {
                fieldVal[s] = bucket[':' + s]['value'];
            });
            point[params.field] = fieldVal;
            if (params.extraFields.length > 0 ) {
                const hit = bucket['_extra']['hits']['hits'][0];
                params.extraFields.forEach(f => {
                    point[f] = hit ? hit['_source'][f] : undefined;
                });
            }
            result.push(point);
        });
        return result;
    }

    protected extractExtremes(response) {
        const aggs = response['responses'][0]['aggregations'];
        const min = aggs['min_ts'];
        const max = aggs['max_ts'];
        return {
            min: min,
            max: max
        }
    }
}
