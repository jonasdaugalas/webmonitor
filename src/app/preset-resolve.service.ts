import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PresetResolveService {

    constructor(protected http: HttpClient) {

    }

    resolve(path: string) {
        return this.http.get(path);
    }
}
