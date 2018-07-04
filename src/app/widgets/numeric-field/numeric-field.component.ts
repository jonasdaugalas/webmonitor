import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription, empty as EmptyObservable} from 'rxjs';
import { tap, map, share, catchError, } from 'rxjs/operators';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { ChartWidget } from 'app/widgets/base/chart-widget';
declare var Plotly: any;

@Component({
    selector: 'wm-numeric-field-widget',
    templateUrl: './numeric-field.component.html',
    styleUrls: ['./numeric-field.component.css']
})
export class NumericFieldComponent extends ChartWidget implements OnInit, AfterViewInit {

    queryParams;
    flatFields = [];
    series = [];
    initialShowHideSeriesDone = false;

    info = {};
    labelAggregated = undefined;
    _aggregated = false;
    get aggregated() {
        return this._aggregated;
    }
    set aggregated(newVal) {
        this._aggregated = newVal;
        this.info = Object.assign({}, this.info, {aggregated: newVal});
        // if (newVal) {
        //     if (!this.labelAggregated) {
        //         this.labelAggregated = this.widgetWrapper.addLabel('aggregated');
        //     }
        // } else {
        //     this.widgetWrapper.removeLabel(this.labelAggregated);
        // }
    }

    constructor(
        protected db: DatabaseService,
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(eventBus);
    }

    ngOnInit() {
        super.ngOnInit({
            'refreshSize': 100,
            'liveWindow': 600000,
            'database': 'default',
            'sources': []
        });
        const wi = this.config['widget'];
        this.queryParams = {
            database: wi['database'],
            sources: wi['sources']
        };
        wi['sources'].forEach(s => {
            s['timestampField'] = s['timestampField'] || 'timestamp';
            this.flatFields = this.flatFields.concat(s['fields']);
        });
        this.makeSeries();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.plot.nativeElement.on('plotly_legendclick', this.onLegendClick.bind(this));
        this.plot.nativeElement.on('plotly_relayout', this.onRelayout.bind(this));
        if (!this.config['wrapper']['started']) {
            this.refresh().subscribe();
        }
    }

    queryFromEvent(event) {
        if (event['type'] === 'time_range_query') {
            this.widgetWrapper.log('Received time range query', 'info');
            this.queryRange(event['payload']);
        } else if (event['type'] === 'fill_run_ls_query') {
            const wi = this.config['widget'];
            if (wi['fillQueriesEnabled'] || wi['runQueriesEnabled']) {
                this.widgetWrapper.log('Received fill/run query', 'info');
                this.queryFillRun(event['payload']);
            }
        }
    }

    onRefreshEvent() {
        this.refresh();
    }

    onStartEvent() {
        this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
    }

    onQueryError(error) {
        this.setData([]);
        this.widgetWrapper.log(String(error), 'danger', 5000);
        throw(error);
    }

    refresh(size?) {
        size = size || this.config['widget']['refreshSize'];
        const obs = this.dataService.queryNewest(this.queryParams, size).pipe(
            map(this.setData.bind(this)),
            tap(() => this.aggregated = false),
            catchError(this.onQueryError.bind(this)),
            share()
        )
        obs.subscribe();
        obs.subscribe();
        return obs;
    }

    setData(newData) {
        this.queryParams.sources.forEach((source, i) => {
            source.fields.forEach((field, j) => {
                const series = this.series[i][j];
                series.x = newData[i].map(hit => hit[source.timestampField]);
                series.y = newData[i].map(hit => hit[field.name]);
            });
        });
        Plotly.redraw(this.plot.nativeElement, this.chartData);
        this.autorange();
    }

    queryRange(range) {
        this.widgetWrapper.stop();
        let obs;
        if (range['tsTo'] - range['tsFrom'] > this.config['widget']['aggregationThreshold']) {
            obs = this.dataService.queryRangeAggregated(
                this.queryParams, range['strFrom'], range['strTo']).pipe(
                    tap(() => this.aggregated = true),
                );
        } else {
            obs = this.dataService.queryRange(
                this.queryParams, range['strFrom'], range['strTo']).pipe(
                    tap(() => this.aggregated = false),
                );
        }
        obs = obs.pipe(
            map(this.setData.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share());
        obs.subscribe();
        return obs;
    }

    queryFillRun(event) {
        this.widgetWrapper.stop();
        const terms = [];
        if (event['run']) {
            this.queryParams.sources.forEach(s => {
                const term = {};
                term[s['runField']] = event['run'];
                terms.push(term);
            })
        } else if (event['fill']) {
            this.queryParams.sources.forEach(s => {
                const term = {};
                term[s['fillField']] = event['fill'];
                terms.push(term);
            })
        } else {
            this.widgetWrapper.log('One of [FILL, RUN] must be specified', 'warning', 3500)
            return EmptyObservable();
        }
        const obs = this.dataService.queryTerms(this.queryParams, terms)
            .pipe(
                tap(() => this.aggregated = false),
                map(this.setData.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share());
        obs.subscribe();
        return obs;
    }

    updateLive() {
        if (this.series.length < 1 || this.aggregated) {
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
        lastPerSource = lastPerSource.map(x => (new Date(x)).getTime()).filter(x => Number.isFinite(x));
        const max = Math.max.apply(null, lastPerSource);
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

    makeSeries() {
        this.chartData.length = 0;
        this.series.length = 0;
        this.queryParams.sources.forEach((s, i) => {
            const seriesOfCurrentSource = [];
            s.fields.forEach((field, j) => {
                const newSeries = {
                    x: [],
                    y: [],
                    name: field.seriesName || field.name,
                    type: 'scatter',
                    line: { width: 1, color: field['color']},
                    visible: (field['hidden'] ? 'legendonly' : true)
                };
                if (field['yAxis'] === 2) {
                    newSeries['yaxis'] = 'y2';
                }
                seriesOfCurrentSource.push(newSeries);
                this.chartData.push(newSeries);
            });
            this.series.push(seriesOfCurrentSource);
        });
    }

    onLegendClick(event) {
        this.flatFields[event.expandedIndex]['hidden'] = !this.flatFields[event.expandedIndex]['hidden'];
    }

    onRelayout(event) {
        if (!this.aggregated) {
            return 1;
        }
        const range = ChartUtils.makeQueryRangeFromZoomEvent(event);
        if (range) {
            this.disableInteraction();
            this.queryRange(range)
                .pipe(tap(this.enableInteraction.bind(this)))
                .subscribe();
        }
    }
}
