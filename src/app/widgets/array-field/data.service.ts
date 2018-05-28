import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const MAX_QUERY_SIZE = 2000;
export const MAX_QUERY_SIZE_FOR_NEWEST = 200;

interface Parameters {
    database: string;
    index: string;
    documentType?: string;
    timestampField?: string;
    field: string;
    nestedPath?: string;
    terms?: { string: any };
}


@Injectable()
export class DataService {

    constructor(protected db: DatabaseService) { }

    queryNewest(params: Parameters, size) {
        let query = this.makeQueryTemplate(params);
        query[1]['size'] = size
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this.db.multiSearch(
            this.db.stringifyToNDJSON(query), params.database)
            .pipe(
                map(resp => [resp, params.nestedPath]),
                map(this.extractResponseFields.bind(this))
            ) as Observable<Array<any>>;
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
        return this.db.multiSearch(
            this.db.stringifyToNDJSON(query), params.database)
            .pipe(
                map(resp => [resp, params.nestedPath]),
                map(this.extractResponseFields.bind(this))
            ) as Observable<Array<any>>;
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
        return this.db.multiSearch(
            this.db.stringifyToNDJSON(query), params.database)
            .pipe(
                map(resp => [resp, params.nestedPath]),
                map(this.extractResponseFields.bind(this))
            ) as Observable<Array<any>>;
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

    protected extractResponseFields(responseWithNestedPath): Array<any> {
        let response = responseWithNestedPath[0];
        const nestedPath = responseWithNestedPath[1];
        response = response['responses'][0]['hits']['hits'].reverse()
            .map(hit => hit['_source']);
        if (nestedPath) {
            response = response.map(hit => hit[nestedPath]);
        }
        return response;
    }

}
