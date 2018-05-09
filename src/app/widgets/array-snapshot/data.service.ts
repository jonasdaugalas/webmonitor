import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import 'rxjs/add/operator/map';


interface FieldParameter {
    name: string;
    seriesName?: string;
    color?: string;
}

interface Parameters {
    database: string;
    index: string;
    documentType?: string;
    timestampField?: string;
    fields: Array<FieldParameter>;
    terms?: { string: any };
}


@Injectable()
export class DataService {

    constructor(protected db: DatabaseService) {

    }

    queryNewest(params: Parameters) {
        let queries = this.makeQuery(params);
        console.log(this.toNDJSON(queries));
        return this.db.multiSearch(this.toNDJSON(queries), params.database)
            .map(this.extractResponseFields.bind(this));
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
        });
        return fields;
    }

    protected extractResponseFields(response) {
        return response['responses'][0]['hits']['hits']
            .map(hit => hit['_source']);
    }

}
