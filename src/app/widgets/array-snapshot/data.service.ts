import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { map } from 'rxjs/operators';


interface FieldParameter {
    name: string;
    seriesName?: string;
    mask?: string;
    color?: string;
}

interface Parameters {
    database: string;
    index: string;
    documentType?: string;
    timestampField?: string;
    fields: Array<FieldParameter>;
    terms?: { string: any };
    runField?: string;
    lsField?: string;
}


@Injectable()
export class DataService {

    constructor(protected db: DatabaseService) {

    }

    queryTerms(params: Parameters, terms) {
        let query = this.makeQuery(params);
        terms.forEach(t => {
            query[1]['query']['bool']['filter'].push({"term": t});
        });
        return this.db.multiSearch(this.toNDJSON(query), params.database)
            .pipe(
                map(this.extractResponseFields.bind(this))
            );
    }

    queryNewest(params: Parameters) {
        let query = this.makeQuery(params);
        return this.db.multiSearch(this.toNDJSON(query), params.database)
            .pipe(
                map(this.extractResponseFields.bind(this))
            );
    }

    protected toNDJSON(values) {
        let result = '';
        values.forEach(v => {
            result += JSON.stringify(v) + '\n';
        });
        return result;
    }

    protected makeQuery(params: Parameters) {
        const header = {
            "index": params.index,
            "type": params.documentType
        };
        const body = {
            "_source": this.parseQueryFields(params),
            "size": 1,
            "sort": {},
            "query": {
                "bool": {
                    "filter": []
                }
            }
        };
        body['sort'][params.timestampField || 'timestamp'] = 'desc';
        if (params.terms) {
            Object.keys(params.terms).forEach(k => {
                const term = {};
                term[k] = params.terms[k];
                body['query']['bool']['filter'].push({"term": term});
            });
        }
        return [header, body];
    }

    protected parseQueryFields(params: Parameters) {
        const fields = [params.timestampField || 'timestamp'];
        params.fields.forEach(f => {
            fields.push(f.name);
            if (f.mask) {
                fields.push(f.mask);
            }
        });
        return fields;
    }

    protected extractResponseFields(response) {
        return response['responses'][0]['hits']['hits']
            .map(hit => hit['_source']);
    }

}
