import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

type CacheType = {string: [ReplaySubject<any>, number]};

export class QueryCache {

    protected cache: CacheType = {} as CacheType;

    constructor(protected timeToLive: number) {
        if (!Number.isFinite(timeToLive) || timeToLive <= 0) {
            throw new Error('QueryCache timeToLive must be positive number');
        }
    }

    ask(key: string, queryRequest: Observable<any>) {
        if (this.cache[key]) {
            return this.cache[key][0];
        }
        const rSubject = queryRequest.pipe(shareReplay());
        const timerID = setTimeout(() => {
            clearTimeout(this.cache[key][1]);
            delete this.cache[key];
        }, this.timeToLive);
        this.cache[key] = [rSubject, timerID];
        return rSubject;
    }

    clear() {
        Object.keys(this.cache).forEach(key => {
            clearTimeout(this.cache[key][1]);
            delete this.cache[key];
        });
    }
}
