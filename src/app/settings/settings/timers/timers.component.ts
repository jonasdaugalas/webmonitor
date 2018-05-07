import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TimersService, Timer } from 'app/core/timers.service';

@Component({
    templateUrl: './timers.component.html',
    styleUrls: ['./timers.component.css']
})
export class TimersComponent implements OnInit, OnDestroy {

    protected timerUpdateSubs: Subscription;
    intervalInput = 8;
    timers = [];

    constructor(protected timersService: TimersService) { }

    ngOnInit() {
        this.timerUpdateSubs = this.timersService.timers$.subscribe(timers => {
            this.updateTimers(timers);
        });
    }

    ngOnDestroy() {
        this.timerUpdateSubs.unsubscribe();
    }

    updateTimers(timers) {
        if (!timers) {
            timers = this.timersService.getTimers();
        }
        this.timers = timers.map(timer => {
            return {
                interval: timer.interval.toFixed(1),
                observerCount: timer.getObserverCount(),
                timer: timer
            };
        });
    }

    remove(timer) {
        this.timersService.remove(timer.timer);
    }

    removeAll() {
        this.timersService.removeAll();
    }

    create(interval) {
        if (interval < 0.5) {
            return;
        }
        this.timersService.create(interval);
    }
}
