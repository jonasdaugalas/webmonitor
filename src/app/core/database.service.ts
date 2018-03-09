import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DatabaseService {

    dbURL = 'http://srv-s2d16-22-01.cms:9200';

    constructor(protected http: HttpClient) {

    }

    query(url, body={}) {
        return this.http.post(this.dbURL + '/' + url, body);
    }
}
