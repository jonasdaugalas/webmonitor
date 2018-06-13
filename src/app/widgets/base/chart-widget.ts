import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { map } from 'rxjs/operators';
import { Subscription, merge } from 'rxjs';
declare var Plotly: any;

export abstract class ChartWidget implements OnInit, OnDestroy, AfterViewInit {
    @Input('config') config;
    @ViewChild('plot') protected plot: ElementRef;
    @ViewChild('widgetWrapper') protected widgetWrapper: WidgetComponent;
    resizeEventSubs: Subscription;
    queryEventSubs: Subscription;
    reflow: () => void;
    chartData = [];
    chartLayout;
    chartConfig = ChartUtils.getDefaultConfig();
    requiredWidgetParameters = [];

    constructor(protected eventBus: EventBusService,
                requiredWidgetParams?: Array<string>) {

        if (requiredWidgetParams) {
            this.requiredWidgetParameters = requiredWidgetParams;
        }
        console.log('in Base constructor', this.requiredWidgetParameters);
    }

    ngOnDestroy() {
        console.log('in Base ngOnDestroy');
        if (this.resizeEventSubs) {
            this.resizeEventSubs.unsubscribe();
        }
        if (this.queryEventSubs) {
            this.queryEventSubs.unsubscribe();
        }
    }

    ngOnInit() {
        console.log('in Base ngOnInit', this.eventBus);
        const wr = this.setupWrapper();
        const wi = this.setupWidget();
        this.chartLayout = ChartUtils.configureDefaultLayout(wi);
    }

    setupWrapper() {
        return this.config['wrapper'] = Object.assign({
            controlsEnabled: true,
            optionsEnabled: true,
            queriesEnabled: true,
            startEnabled: true,
            refreshEnabled: true
        }, this.config['wrapper'] || {});
    }

    setupWidget() {
        const wi = this.config['widget'] = this.config['widget'] || {};
        if (this.parameterRequired('refreshSize')) {
            wi['refreshSize'] = wi['refreshSize'] || 100;
        }
        if (wi.hasOwnProperty('queryChannel')) {
            const ch = wi['queryChannel'];
            this.queryEventSubs = merge(
                this.eventBus.getEvents(ch, 'time_range_query'),
                this.eventBus.getEvents(ch, 'fill_run_ls_query')
            ).subscribe(this.queryFromEvent.bind(this));
        }
        return wi;
    }

    abstract queryFromEvent(event);

    ngAfterViewInit() {
        console.log('in Base ngAfterViewInit');
        Plotly.plot(
            this.plot.nativeElement, this.chartData,
            this.chartLayout, this.chartConfig);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.resizeEventSubs = ChartUtils.subscribeReflow(this.eventBus, this.reflow);
        this.reflow();
    }

    autorange() {
        const mod = ChartUtils.setAutorange(this.plot.nativeElement['layout']);
        Plotly.relayout(this.plot.nativeElement, mod);
    }

    private parameterRequired(param: string) {
        return this.requiredWidgetParameters.indexOf(param) > -1;
    }

}
