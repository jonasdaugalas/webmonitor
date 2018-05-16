import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { map } from 'rxjs/operators';

export const MAX_QUERY_SIZE = 2000;
export const MAX_QUERY_SIZE_FOR_NEWEST = 200;

interface Parameters {
    database: string;
    index: string;
    documentType?: string;
    timestampField?: string;
    field: string;
    terms?: { string: any };
}


@Injectable()
export class DataService {

    constructor(protected db: DatabaseService) { }



    queryNewest(params: Parameters, size) {
        let query = this.makeQueryTemplate(params);
        query[1]['size'] = size
        return this.db.multiSearch(
            this.db.stringifyToNDJSON(query), params.database)
            .map(this.extractResponseFields.bind(this));
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
        return this.db.multiSearch(
            this.db.stringifyToNDJSON(query), params.database)
            .map(this.extractResponseFields.bind(this));
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

    protected extractResponseFields(response) {
        return response['responses'][0]['hits']['hits'].reverse()
            .map(hit => hit['_source']);
    }

}
