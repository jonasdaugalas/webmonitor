import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryCache } from 'app/shared/query-cache/query-cache';

export const MAX_QUERY_SIZE = 2000;
export const MAX_QUERY_SIZE_FOR_NEWEST = 200;

interface Parameters {
    database: string;
    index: string;
    documentType?: string;
    timestampField?: string;
    field: string;
    fieldLength?: number;
    nestedPath?: string;
    terms?: { string: any };
}


@Injectable()
export class DataService {

    queryCache = new QueryCache(1000);

    constructor(protected db: DatabaseService) {}

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
        let query = this.makeAggregationQuery(params, min, max, aggregation, buckets);
        if (params.nestedPath) {
            throw Error('Cannot do aggregation queries with nestedPath');
        }
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
                    'aggs':{}
                }
            }
        };
        body['query']['bool']['filter'].push({
            'range':{'timestamp':{'gte': min, 'lte': max}}
        });
        for (let i = 0; i < params.fieldLength; ++i) {
            const agg = {};
            agg[aggregation] = {'script': "_source." + params.field + '[' + i + ']'};
            body['aggs']['points']['aggs'][params.field + ':' + i] = agg;
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

    queryNewest(params: Parameters, size) {
        let query = this.makeQueryTemplate(params);
        query[1]['size'] = size
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    queryRange(params: Parameters, min, max) {
        let query = this.makeQueryTemplate(params);
        query[1]['size'] = MAX_QUERY_SIZE;
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

    protected makeQueryTemplate(params: Parameters) {
        const header = {
            index: params.index,
            type: params.documentType
        };
        const body = {
            "_source": this.parseQueryFields(params),
            "sort": {},
            "query": {
                "bool": {
                    "filter": []
                }
            }
        };
        body['sort'][params.timestampField] = 'desc';
        if (params.terms) {
            Object.keys(params.terms).forEach(k => {
                const term = {};
                term[k] = params.terms[k];
                body['query']['bool']['filter'].push({'term': term});
            });
        }
        return [header, body];
    }

    protected parseQueryFields(params: Parameters) {
        return [params.timestampField || 'timestamp', params.field];
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
            for (let i = 0; i < params.fieldLength; ++i) {
                fieldVal.push(bucket[params.field + ':' + i]['value']);
            }
            point[params.field] = fieldVal;
            result.push(point);
        });
        return result;
    }

}
