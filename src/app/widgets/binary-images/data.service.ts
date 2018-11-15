import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const MAX_QUERY_SIZE = 200;

export interface Parameters {
    database: string;
    index: string;
    useDocumentType?: boolean,
    timestampField?: string;
    typeField: string | undefined,
    types: Array<string>,
    fields: Array<string>;
    nestedPath?: string;
    singleTerms?: { string: any };
    multiTerms?: { string: Array<any> };
}

@Injectable({
    providedIn: 'root'
})
export class DataService {

    constructor(protected db: DatabaseService) {}

    protected _query(queryStr, params, aggregated=false) {
        const queryObs = this.db.multiSearch(queryStr, params.db)
            .pipe(
                map(this.extractImages.bind(this))
            );
        return queryObs as Observable<Array<any>>;
    }

    query(params: Parameters) {
        let query = this.makeQueryTemplate(params);
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    queryRange(params: Parameters, field: string, min, max) {
        let query = this.makeQueryTemplate(params);
        const range = {};
        range[field] = {"gte": min, "lte": max};
        query[1]['query']['bool']['filter'].push({"range": range});
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this._query(this.db.stringifyToNDJSON(query), params);
    }

    makeQueryTemplate(params: Parameters) {
        const header = {
            index: params.index,
        };
        const body = {
            "_source": this.parseQueryFields(params),
            "size": MAX_QUERY_SIZE,
            "query": {
                "bool": {
                    "filter": []
                }
            }
        };
        if (params.timestampField) {
            body['sort'] = {};
            body['sort'][params.timestampField] = 'desc';
        }
        if (params.singleTerms) {
            Object.keys(params.singleTerms).forEach(k => {
                const term = {};
                term[k] = params.singleTerms[k];
                body['query']['bool']['filter'].push({'term': term});
            });
        }
        if (params.multiTerms) {
            Object.keys(params.multiTerms).forEach(k => {
                this.pushMultiTerms(body, k, params.multiTerms[k]);
            });
        }
        if (params.types && params.types.length > 0) {
            if (params.useDocumentType) {
                header['type'] = params.types
            } else if (params.typeField) {
                this.pushMultiTerms(body, params.typeField, params.types);
            }
        }
        return [header, body];
    }

    parseQueryFields(params: Parameters) {
        if (params.timestampField) {
            return [params.timestampField].concat(params.fields);
        } else {
            return params.fields;
        }
    }

    protected pushMultiTerms(queryBody, key, value) {
        const terms = {};
        terms[key] = value;
        queryBody['query']['bool']['filter'].push({'terms': terms});
    }

    protected extractImages(response) : Array<any>{
        return response['responses'][0]['hits']['hits'].map(hit => {
            if (!hit['_source'].hasOwnProperty('type')) {
                return Object.assign(hit['_source'], {'type': hit['_type']});
            }
            return hit['_source'];
        });
    }



}
