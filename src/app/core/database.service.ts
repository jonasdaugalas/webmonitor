import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as config from 'app/config';

@Injectable()
export class DatabaseService {

    defaultDB = config.DATA_SOURCES.es_daq_realtime.endpoint;

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
            return;
        }
        return this.http.post(dbUrl + '/' + url, body);
    }
}
