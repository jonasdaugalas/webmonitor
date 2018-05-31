import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { map } from 'rxjs/operators';

export const MAX_QUERY_SIZE = 10000;
export const MAX_QUERY_SIZE_FOR_NEWEST = 200;

interface FieldParameter {
    name: string;
    seriesName?: string;
    color?: string;
    yAxis?: number;
}

interface SourceParameter {
    index: string;
    fields: Array<FieldParameter>;
    documentType?: string;
    timestampField?: string;
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
        let queries = [];
        params.sources.forEach(source => {
            const query = this.makeSingleSourceQuery(source);
            query[1]['size'] = size;
            queries = queries.concat(query);
        });
        return this.db.multiSearch(this.toNDJSON(queries), params.database)
            .map(this.extractResponseFields.bind(this));
    }

    queryRange(params: Parameters, min, max) {
        let queries = [];
        params.sources.forEach(source => {
            const query = this.makeSingleSourceQuery(source);
            query[1]['size'] = MAX_QUERY_SIZE;
            const range = {};
            range[source.timestampField] = {
                "gte": min,
                "lte": max
            }
            query[1]['query']['bool']['filter'].push({"range": range});
            queries = queries.concat(query);
        });
        return this.db.multiSearch(this.toNDJSON(queries), params.database)
            .map(this.extractResponseFields.bind(this));
    }

    queryNewestSince(params: Parameters, perSourceMin) {
        let queries = [];
        params.sources.forEach((source, i) => {
            const query = this.makeSingleSourceQuery(source);
            query[1]['size'] = MAX_QUERY_SIZE_FOR_NEWEST;
            const range = {};
            range[source.timestampField] = {
                "gte": perSourceMin[i]
            }
            query[1]['query']['bool']['filter'].push({"range": range});
            queries = queries.concat(query);
        });
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

    protected makeSingleSourceQuery(source: SourceParameter) {
        const header = {
            index: source.index,
            type: source.documentType
        };
        const body = {
            "_source": this.parseQueryFields(source),
            "sort": {},
            "query": {
                "bool": {
                    "filter": []
                }
            }
        };
        body['sort'][source.timestampField] = "desc";
        if (source.terms) {
            Object.keys(source.terms).forEach(k => {
                const term = {};
                term[k] = source.terms[k];
                body['query']['bool']['filter'].push({"term": term});
            });
        }
        return [header, body];
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
            .map(r => r['hits']['hits'].reverse())
            .map(hits => hits.map(hit => hit['_source']));
    }

}
