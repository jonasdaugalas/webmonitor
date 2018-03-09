import { Component, OnInit } from '@angular/core';
import { TimersService, Timer } from '../../../core/timers.service';

@Component({
    templateUrl: './timers.component.html',
    styleUrls: ['./timers.component.css']
})
export class TimersComponent implements OnInit {

    timers = [];

    constructor(protected timersService: TimersService) { }

    ngOnInit() {
        this.updateTimers();
    }

    updateTimers() {
        this.timers = this.timersService.getTimers().map(timer => {
            return {
                interval: timer.interval.toFixed(1),
                observerCount: timer.getObserverCount(),
                timer: timer
            };
        });
    }

    remove(timer) {
        this.timersService.remove(timer.timer);
        this.updateTimers();
    }

    removeAll() {
        this.timersService.removeAll();
        this.updateTimers();
    }

    create(interval) {
        this.timersService.create(interval);
        this.updateTimers();
    }

}
