import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy,
    ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { TimersService, Timer } from '../../core/timers.service';
import { EventBusService } from '../../core/event-bus.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'wm-widget',
    templateUrl: './widget.component.html',
    styleUrls: ['./widget.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetComponent implements OnInit, OnDestroy {

    protected _config = {};
    @Input() set config(newConfig: any) {
        this._config = this.parseConfig(newConfig);
    }
    get config() {
        return this._config;
    }

    infoItems = [];
    @Input('info') set info(newInfo) {
        newInfo = newInfo || {};
        this.infoItems = Object.keys(newInfo).map(key => {
            return [key, newInfo[key]];
        });
    }

    @Output('start') startEmmiter = new EventEmitter(true);
    @Output('stop') stopEmmiter = new EventEmitter(true);
    @Output('timer') timerEmmiter = new EventEmitter(true);
    @Output('refresh') refreshEmmiter = new EventEmitter(true);

    _timer: Timer;
    set timer(newTimer: Timer) {
        this.stop();
        this._timer = newTimer;
    }
    get timer() {
        return this._timer;
    }
    timerSubscription: Subscription;
    timersSubscription: Subscription;
    eventsSubscription: Subscription;


    constructor(protected timers: TimersService,
                protected changeDetector: ChangeDetectorRef,
                protected eventBus: EventBusService) { }

    ngOnInit() {
        const initiallyStarted = this.config.started;
        this.timersSubscription = this.timers.timers$.subscribe(newTimers => {
            if (newTimers.indexOf(this.timer) < 0) {
                this.timer = undefined;
            }
        });
        if (Number.isInteger(this.config.initialTimer)) {
            try {
                this.timer = this.timers.getTimers()[this.config.initialTimer];
            } catch {}
        }
        if (initiallyStarted) {
            this.start();
        }
        this.eventsSubscription = this.eventBus.getEvents(0, 'global_startstop')
            .subscribe(this.handle_global_startstop.bind(this));
    }

    ngOnDestroy() {
        this.makeStop();
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
        if (this.timersSubscription) {
            this.timersSubscription.unsubscribe();
        }
    }

    onClickStart() {
        if (this.config.started) {
            this.stop();
        } else {
            this.start();
        }
    }

    onClickRefresh() {
        this.stop();
        this.refreshEmmiter.emit();
    }

    start() {
        if (!this.config.started) {
            if (this.makeStart()) {
                this.config.started = true;
                this.startEmmiter.emit();
            }
        }
    }

    stop() {
        if (this.config.started) {
            this.makeStop();
            this.config.started = false;
            this.stopEmmiter.emit();
        }
    }

    protected makeStart() {
        if (this._timer) {
            this.makeStop();
            this.timerSubscription = this._timer.subscribe(
                () => {
                    this.timerEmmiter.emit();
                    this.changeDetector.detectChanges();
                },
                err => {
                    this.changeDetector.detectChanges();
                },
                () => {
                    this.stop();
                    this._timer = undefined;
                    this.changeDetector.detectChanges();
                });
            return true;
        }
        return false;
    }

    protected makeStop() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = undefined;
        }
        return true;
    }

    protected parseConfig(config: any) {
        config = config || {};
        const defaults = {
            title: '',
            startEnabled: true,
            started: false,
            refreshEnabled: true,
            optionsEnabled: true,
            optionsOpen: false,
            queriesEnabled: true,
            queriesOpen: false,
            initialTimer: null
        }
        Object.keys(defaults).forEach(key => {
            config[key] = config.hasOwnProperty(key) ? config[key] : defaults[key];
        });
        return config;
    }

    protected handle_global_startstop(event) {
        if (event.payload === 'start') {
            this.start();
        } else if (event.payload === 'stop') {
            this.stop();
        }
        this.changeDetector.detectChanges();
    }

}
