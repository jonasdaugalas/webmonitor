import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/share';
import { interval } from 'rxjs/observable/interval';
import { Subscription } from 'rxjs/Subscription';

export interface Timer {
    interval: number;
    subscribe(onNext, onError, onComplete): Subscription;
    getObserverCount(): number;
}


class SubjectTimer implements Timer {

    interval: number;
    subscription: Subscription;
    intervalSubject$: Subject<number>;

    constructor(seconds: number) {
        this.interval = seconds = Number(seconds);
        this.intervalSubject$ = new Subject();
        const interval$ = interval(seconds*1000);
        this.subscription = interval$.share().subscribe(this.intervalSubject$);
    }

    public subscribe(onNext, onError?, onComplete?): Subscription {
        return this.intervalSubject$.subscribe(onNext, onError, onComplete);
    }

    public getObserverCount(): number {
        return this.intervalSubject$.observers.length;
    }

    public cleanup() {
        this.intervalSubject$.complete();
        this.subscription.unsubscribe();
    }

}


@Injectable()
export class TimersService {

    protected timers: Array<SubjectTimer> = [];
    public timers$ = new BehaviorSubject<Array<Timer>>([]);

    getTimers(): Array<Timer> {
        return this.timers.slice(); // shallow copy
    }

    create(seconds) {
        const timer = new SubjectTimer(seconds);
        this.timers.push(timer);
        this.timers$.next(this.getTimers());
        return timer;
    }

    remove(timer) {
        const index = this.timers.indexOf(timer);
        if (index >= 0) {
            this.timers.splice(index, 1)[0].cleanup();
        }
        this.timers$.next(this.getTimers());
    }

    removeAll() {
        while(this.timers.length > 0) {
            this.timers.splice(0, 1)[0].cleanup();
        }
        this.timers$.next(this.getTimers());
    }

}
