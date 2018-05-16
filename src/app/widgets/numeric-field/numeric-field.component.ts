import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
declare var Plotly: any;

@Component({
    selector: 'wm-numeric-field-widget',
    templateUrl: './numeric-field.component.html',
    styleUrls: ['./numeric-field.component.css']
})
export class NumericFieldComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input('config') config;
    @ViewChild('plot') protected plot: ElementRef;
    @ViewChild('widgetWrapper') protected widgetWrapper: WidgetComponent;
    resizeEventSubs: Subscription;
    reflow: () => void;
    chartData = [];
    chartLayout = ChartUtils.getDefaultLayout();
    chartConfig = ChartUtils.getDefaultConfig();
    queryParams;
    series = [];

    constructor(
        protected db: DatabaseService,
        protected eventBus: EventBusService,
        protected dataService: DataService) {
    }

    ngOnDestroy() {
        this.resizeEventSubs.unsubscribe();
    }

    ngOnInit() {
        const wr = this.config['wrapper'] = Object.assign({
            controlsEnabled: true,
            optionsEnabled: true,
            queriesEnabled: true,
            startEnabled: true,
            refreshEnabled: true
        }, this.config['wrapper'] || {});
        const wi = this.config['widget'] = this.config['widget'] || {};
        wi['refreshSize'] = wi['refreshSize'] || 100;
        if (!this.db.parseDatabase(wi['database'])) {
            wi['database'] = 'default';
        }
        this.queryParams = {
            database: wi['database'],
            sources: wi['sources']
        };
    }

    ngAfterViewInit() {
        Plotly.plot(this.plot.nativeElement,
                    this.chartData, this.chartLayout, this.chartConfig);
        this.configureLayout(this.config['widget']);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.resizeEventSubs = ChartUtils.subscribeReflow(this.eventBus, this.reflow);
        this.reflow();
        if (!this.config['wrapper']['started']) {
            this.refresh();
        }
    }

    configureLayout(widget) {
        const update = {
            xaxis: {
                title: "Date UTC",
                type: "date"
            },
            yaxis: {
                title: widget['yAxisTitle'],
            },
            legend: ChartUtils.getLegendConfig(widget['legend'])
        }
        Plotly.relayout(this.plot.nativeElement, update);
    }

    onRefreshEvent() {
        this.refresh();
    }

    onStartEvent() {
        this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
    }

    refresh(size?) {
        size = size || this.config['widget']['refreshSize'];
        const obs = this.dataService.queryNewest(this.queryParams, size)
            .map(this.setData.bind(this))
            .share();
        obs.subscribe();
        return obs;
    }

    setData(newData) {
        this.chartData.length = 0;
        this.series.length = 0;
        this.queryParams.sources.forEach((s, i) => {
            const seriesOfCurrentSource = [];
            s.fields.forEach(f => {
                const newSeries = {
                    x: newData[i].map(hit => hit[s.timestampField]),
                    y: newData[i].map(hit => hit[f.name]),
                    name: f.seriesName || f.name,
                    type: 'scatter',
                    line: { width: 1}
                };
                seriesOfCurrentSource.push(newSeries);
                this.chartData.push(newSeries);
            });
            this.series.push(seriesOfCurrentSource);
        });
        Plotly.redraw(this.plot.nativeElement, this.chartData);
        this.autorange();
    }

    queryRange(range) {
        this.widgetWrapper.stop();
        const obs = this.dataService.queryRange(
            this.queryParams, range['strFrom'], range['strTo'])
            .map(this.setData.bind(this))
            .share();
        obs.subscribe();
        return obs;
    }

    updateLive() {
        if (this.series.length < 1) {
            this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
            return;
        }
        const lastXPerSource = this.getLastXPerSource();
        this.dataService.queryNewestSince(this.queryParams, lastXPerSource)
            .subscribe(resp => {
                this.queryParams.sources.forEach((source, i) => {
                    const hits = resp[i].filter(hit => hit[source.timestampField] !== lastXPerSource[i]);
                    if (hits.length < 1) {
                        return;
                    }
                    source.fields.forEach((field, j) => {
                        const series = this.series[i][j];
                        series.x = series.x.concat(hits.map(hit => hit[source.timestampField]));
                        series.y = series.y.concat(hits.map(hit => hit[field.name]));
                        this.dropPointsOutsideLiveWindow(series);
                    });
                });
                this.setXZoomToLiveWindow();
                Plotly.redraw(this.plot.nativeElement, this.chartData);
            });
    }

    getLastXPerSource() {
        return this.series.map(s => {
            const x = s[0].x;
            return x[x.length -1];
        })
    }

    dropPointsOutsideLiveWindow(series) {
        const lastX = new Date(series.x[series.x.length -1]);
        const liveWindow = this.config['widget']['liveWindow'];
        while(lastX.getTime() - (new Date(series.x[0])).getTime() > liveWindow) {
            series.x.shift();
            series.y.shift();
        }
    }

    setXZoomToLiveWindow(lastPerSource?) {
        if (!lastPerSource) {
            lastPerSource = this.getLastXPerSource();
        }
        const max = Math.max.apply(null, lastPerSource.map(x => (new Date(x)).getTime()));
        if (!Number.isInteger(max)) {
            return;
        }
        const min = max - this.config['widget']['liveWindow'];
        const xaxis = this.plot.nativeElement['layout']['xaxis'];
        const newRange = [
            (new Date(min)).toISOString(),
            (new Date(max)).toISOString()];
        xaxis['range'] = newRange;
        xaxis['autorange'] = false;
        Plotly.relayout(this.plot.nativeElement, {xaxis: xaxis});
    }

    autorange() {
        const xaxis = Object.assign({}, this.plot.nativeElement['layout']['xaxis']);
        const yaxis = Object.assign({}, this.plot.nativeElement['layout']['yaxis']);
        xaxis['autorange'] = true;
        yaxis['autorange'] = true;
        Plotly.relayout(this.plot.nativeElement, {xaxis: xaxis, yaxis: yaxis});
    }
}
