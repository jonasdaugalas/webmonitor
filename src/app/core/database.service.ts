import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as config from 'app/config';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/throw';

@Injectable()
export class DatabaseService {

    defaultDB = config.DATA_SOURCES.daq_ES2.endpoint;

    constructor(protected http: HttpClient) {

    }

    parseDatabase(selector: string) {
        if (selector.startsWith('http')) {
            return selector;
        }
        if (config.DATA_SOURCES.hasOwnProperty(selector)) {
            return config.DATA_SOURCES[selector]['endpoint'];
        }
        if (selector.toLowerCase() === 'default') {
            return this.defaultDB;
        }
        return null;
    }

    query(url, body={}, db=this.defaultDB) {
        const dbUrl = this.parseDatabase(db);
        if (!dbUrl) {
            return Observable.throw(new Error('Wrong DB: ' + db));
        }
        return this.http.post(dbUrl + '/' + url, body);
    }

    queryNDJson(url, body='', db=this.defaultDB) {
        const headers = new HttpHeaders({'Content-Type':'application/x-ndjson'});
        const dbUrl = this.parseDatabase(db);
        if (!dbUrl) {
            return Observable.throw(new Error('Wrong DB: ' + db));
        }
        return this.http.post(dbUrl + '/' + url, body, {headers: headers});
    }

    multiSearch(body, db=this.defaultDB) {
        return this.queryNDJson('_msearch', body, db);
    }

    stringifyToNDJSON(values) {
        let result = '';
        values.forEach(v => {
            result += JSON.stringify(v) + '\n';
        });
        return result;
    }

    transformQueryWithNestedPath(query, nestedPath) {
        if (!nestedPath) {
            return query;
        }
        if (query.hasOwnProperty('_source')) {
            query['_source'] = query['_source'].map(v => nestedPath + '.' + v);
        }
        if (query.hasOwnProperty('sort')) {
            const transformSortLevel = (singleSortLevel) => {
                const transformed = {};
                Object.keys(singleSortLevel).forEach(k => {
                    if (typeof singleSortLevel[k] === 'string') {
                        singleSortLevel[k] = {
                            'nested_path': nestedPath,
                            'order': singleSortLevel[k]
                        };
                    } else {
                        singleSortLevel[k]['nested_path'] = nestedPath;
                    }
                    transformed[nestedPath + '.' + k] = singleSortLevel[k];
                });
                return transformed;
            };
            if (Array.isArray(query['sort'])) {
                query['sort'] = query['sort'].map(transformSortLevel);
            } else {
                query['sort'] = transformSortLevel(query['sort']);
            }
        }
        if (query.hasOwnProperty('query')) {
            const filters = query['query']['bool']['filter'];
            const newFilters = filters.map(f => {
                const filterName = Object.keys(f)[0];
                const fieldName = Object.keys(f[filterName])[0];
                const newFilter = {};
                newFilter[filterName] = {};
                newFilter[filterName][nestedPath + '.' + fieldName] = f[filterName][fieldName];
                return newFilter;
            });
            query['query']['bool']['filter'] = newFilters;
        }
        return query;
    }
}
