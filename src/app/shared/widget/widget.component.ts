import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy,
    ChangeDetectorRef, OnDestroy, ComponentFactoryResolver, ViewContainerRef,
    Type
} from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TimersService, Timer } from '../../core/timers.service';
import { EventBusService } from '../../core/event-bus.service';
import { Subscription, Subject } from 'rxjs';

@Component({
    selector: 'wm-widget',
    templateUrl: './widget.component.html',
    styleUrls: ['./widget.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetComponent implements OnInit, OnDestroy {

    public extraOptions: FormlyFieldConfig[] = null;
    public extraOptionsModel = {};
    public extraOptionsModelChange = new Subject();

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
        this.changeDetector.detectChanges();
    }
    get timer() {
        return this._timer;
    }
    timerSubscription: Subscription;
    timersSubscription: Subscription;
    eventsSubscription: Subscription;
    labels: Array<{id: number, text: string}> = [];
    logs: Array<{level: string, text: string}> = [];


    constructor(protected timers: TimersService,
                protected changeDetector: ChangeDetectorRef,
                protected eventBus: EventBusService) { }

    ngOnInit() {
        const initiallyStarted = this.config.started;
        this.timersSubscription = this.timers.timers$.subscribe(newTimers => {
            if (this.timer && newTimers.indexOf(this.timer) < 0) {
                this.timer = undefined;
            }
            this.changeDetector.detectChanges();
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
        this.changeDetector.detectChanges();
    }

    stop() {
        if (this.config.started) {
            this.makeStop();
            this.config.started = false;
            this.stopEmmiter.emit();
        }
        this.changeDetector.detectChanges();
    }

    addLabel(text: string) {
        const newLabel = {id: (new Date()).getTime(), text: text};
        this.labels.push(newLabel);
        return newLabel;
    }

    removeLabel(label: any) {
        const index = this.labels.indexOf(label);
        if (index >= 0) {
            this.labels.splice(index, 1);
        }
    }

    log(text, level='info', timeout?) {
        const logEvent = {
            text: text,
            level: level
        }
        if (!timeout) {
            if (level === 'info') {
                timeout = 2000;
            } else if (level === 'warning') {
                timeout = 3500;
            } else {
                timeout = 5000;
            }
        }
        this.logs.push(logEvent);
        setTimeout(() => {
            const index = this.logs.indexOf(logEvent);
            if (index > -1) {
                this.logs.splice(index, 1);
            }
            this.changeDetector.detectChanges();
        }, timeout);
        this.changeDetector.detectChanges();
    }

    clearLogs() {
        this.logs.length = 0;
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

    loadComponent(
        component: Type<any>,
        componentFactoryResolver: ComponentFactoryResolver,
        container: ViewContainerRef,
        data?: {}) {

        let componentFactory = componentFactoryResolver.resolveComponentFactory(component);
        container.clear();
        let componentRef = container.createComponent(componentFactory);
        Object.keys(data).forEach(k => {
            componentRef.instance[k] = data[k];
        });
  }

}
