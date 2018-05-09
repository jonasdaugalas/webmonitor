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
}
