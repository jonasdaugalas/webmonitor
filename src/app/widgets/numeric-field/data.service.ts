import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';

interface FieldParameter {
    name: string;
    seriesName?: string;
    color?: string;
}

interface SourceParameter {
    index: string;
    timestampField?: string;
    fields: Array<FieldParameter>;
    terms?: { string: any };
}

interface Parameters {
    database: string;
    sources: Array<SourceParameter>;
}

@Injectable()
export class DataService {

    constructor(protected db: DatabaseService) {

    }

    queryNewest(params: Parameters, size) {
        console.log(params, size, this.db);
        let fullBody = '';
        params.sources.forEach(source => {
            const header = {
                index: source.index
            };
            const body = {
                "_source": this.parseQueryFields(source),
                "size": size,
                "sort": {}
            };
            body['sort'][source.timestampField] = "desc";
            fullBody += JSON.stringify(header) + '\n'
                + JSON.stringify(body) + '\n';
        });
        return this.db.multiSearch(fullBody, params.database)
            .map(this.extractResponseFields.bind(this));
    }

    protected parseQueryFields(source: SourceParameter) {
        const fields = [source.timestampField || 'timestamp'];
        source.fields.forEach(f => {
            fields.push(f.name);
        });
        return fields;
    }

    protected extractResponseFields(response) {
        return response['responses']
            .map(r => r['hits']['hits'])
            .map(hits => hits.map(hit => hit['_source']));
    }

}
