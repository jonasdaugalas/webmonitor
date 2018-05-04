import {
    Component, OnInit, Input, Output, OnDestroy, EventEmitter
} from '@angular/core';
import { Timer, TimersService } from '../../../core/timers.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'wm-widget-general-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

    @Input('config') config;

    _selectedTimer: Timer;
    @Output('timerChange') selectedTimerChange = new EventEmitter<Timer>();
    @Input('timer') set timer(newTimer) {
        this._selectedTimer = newTimer;
    }

    set selectedTimer(newTimer: Timer) {
        this._selectedTimer = newTimer;
        this.selectedTimerChange.emit(newTimer);
    }
    get selectedTimer(): Timer {
        return this._selectedTimer;
    }

    timers = <Array<Timer>>[];

    protected timersSubscription: Subscription;

    constructor(protected timersService: TimersService) {
    }

    ngOnInit() {
        this.timersSubscription = this.timersService.timers$.subscribe(timers => {
            this.timers = timers;
        });
    }

    ngOnDestroy() {
        this.timersSubscription.unsubscribe();
    }

}
