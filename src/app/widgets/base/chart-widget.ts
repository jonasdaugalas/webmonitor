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
    tsToDate = ChartUtils.parseStringTimestamp;
    tsToChartTimestamp = (ts) => ts;
    tsToMilliseconds = (ts) => this.tsToDate(ts).getTime();

    constructor(protected eventBus: EventBusService) {}

    ngOnDestroy() {
        console.log('in Base ngOnDestroy', this.config);
        if (this.resizeEventSubs) {
            this.resizeEventSubs.unsubscribe();
        }
        if (this.queryEventSubs) {
            this.queryEventSubs.unsubscribe();
        }
    }

    ngOnInit(defaults?: Object) {
        const wr = this.setupWrapper();
        const wi = this.setupWidget(defaults);
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

    setupWidget(defaults?: Object) {
        const wi = this.config['widget'] = this.config['widget'] || {};
        if (defaults) {
            Object.keys(defaults).forEach(key => {
                if (!wi.hasOwnProperty(key)) {
                    wi[key] = defaults[key];
                }
            });
        }
        if (wi['timestampUNIX']) {
            this.tsToDate = ChartUtils.parseUNIXTimestamp;
            this.tsToChartTimestamp = (ts) => this.tsToDate(ts).toISOString();
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

    disableInteraction() {
        this.chartConfig['staticPlot'] = true;
        this.chartLayout['plot_bgcolor'] = 'whitesmoke';
        Plotly.react(this.plot.nativeElement, this.chartData, this.chartLayout, this.chartConfig);
    }

    enableInteraction() {
        this.chartConfig['staticPlot'] = false;
        this.chartLayout['plot_bgcolor'] = undefined;
        Plotly.react(this.plot.nativeElement, this.chartData, this.chartLayout, this.chartConfig);
    }

    updateFieldSeparators(relayout=false, aggregated=false) {
        const wi = this.config['widget'];
        if (!wi['fieldChangeSeparators']) {
            return;
        }
        if (wi['fieldChangeSeparators']['enabled']) {
            const s = ChartUtils.makeSeparatorLines(
                this.chartData,
                wi['fieldChangeSeparators']['fields'],
                aggregated);
            this.plot.nativeElement['layout']['shapes'] = s['shapes'];
            this.plot.nativeElement['layout']['annotations'] = s['annotations'];
        } else {
            this.plot.nativeElement['layout']['shapes'] = [];
            this.plot.nativeElement['layout']['annotations'] = [];
        }
        if (relayout) {
            Plotly.relayout(this.plot.nativeElement, this.chartLayout)
        }
    }



}
