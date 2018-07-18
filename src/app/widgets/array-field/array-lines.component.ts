import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { Subscription, empty as emptyObservable, of, throwError } from 'rxjs';
import { map, tap, share, catchError, mergeMap } from 'rxjs/operators';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { ChartWidget } from 'app/widgets/base/chart-widget';
declare var Plotly: any;

@Component({
    selector: 'wm-widget-array-lines',
    templateUrl: './array-lines.component.html',
    styleUrls: ['./array-lines.component.css']
})
export class ArrayLinesComponent extends ChartWidget implements OnInit, AfterViewInit {

    queryParams;
    reflow = () => undefined;
    _aggregated = false;
    set aggregated(newVal) {
        this._aggregated = newVal;
        this.info = Object.assign({}, this.info, {aggregated: newVal})
    }
    get aggregated() { return this._aggregated};
    info = {};

    constructor(
        protected db: DatabaseService,
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(eventBus);
    }

    setupWidget() {
        const wi = super.setupWidget({
            'liveWindow': 600000,
            'refreshSize': 100,
            'series': [],
            'timestampField': 'timestamp'
        });
        this.queryParams = {
            database: wi['database'],
            index: wi['index'],
            documentType: wi['documentType'],
            timestampField: wi['timestampField'],
            field: wi['field'],
            series: wi['series'],
            tooltipFields: wi['tooltipFields'],
            nestedPath: wi['nestedPath'],
            terms: wi['terms'],
            fillField: wi['fillField'],
            runField: wi['runField']
        }
        return wi;
    }

    ngAfterViewInit() {
        this.makeSeries();
        super.ngAfterViewInit();
        this.plot.nativeElement.on('plotly_relayout', this.onRelayout.bind(this));
        if (!this.config['wrapper']['started']) {
            this.refresh();
        }
    }

    queryFromEvent(event) {
        if (event['type'] === 'time_range_query') {
            this.queryRange(event['payload']);
        } else if (event['type'] === 'fill_run_ls_query') {
            const wi = this.config['widget'];
            if (wi['fillQueriesEnabled'] || wi['runQueriesEnabled']) {
                this.queryFillRun(event['payload']);
            }
        }
    }

    onRefreshEvent() {
        this.refresh();
    }

    onStartEvent() {
        this.updateLive();
    }

    onQueryError(error) {
        this.widgetWrapper.log(String(error), 'danger');
        this.setChartData([]);
        throw(error);
    }

    refresh(size?) {
        size = Number.isInteger(size) ? size : this.config['widget']['refreshSize'] || 50;
        const obs = this.dataService.queryNewest(this.queryParams, size).pipe(
            tap(() => this.aggregated = false),
            tap(this.setChartData.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share());
        obs.subscribe();
        return obs;
    }

    setChartData(hits) {
        const wi = this.config['widget'];
        wi['series'].forEach((s, i) => {
            this.chartData[i].y = hits.map(hit => hit[wi['field']][s]);
            this.chartData[i].x = hits.map(hit => this.tsToChartTimestamp(hit[this.queryParams.timestampField]));
            this.chartData[i].text = hits.map(this.makeTooltipText.bind(this));
        });
        ChartUtils.setAutorange(this.chartLayout);
        Plotly.redraw(this.plot.nativeElement);
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
            map(this.setChartData.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share());
        obs.subscribe();
        return obs;
    }

    queryFillRun(event) {
        this.widgetWrapper.stop();
        const term = {};
        if (event['run']) {
            term[this.queryParams['runField']] = event['run'];
        } else if (event['fill']) {
            term[this.queryParams['fillField']] = event['fill'];
        } else {
            this.widgetWrapper.log('One of [FILL, RUN] must be specified', 'warning');
            return emptyObservable();
        }

        this.widgetWrapper.log('Querying timestamp extremes for FILL/RUN', 'info')
        this.dataService.queryExtremesByTerm(this.queryParams, term)
            .pipe(
                mergeMap(extremes => {
                    console.log(extremes);
                    if (!extremes['min']['value'] || !extremes['max']['value']) {
                        return throwError('Failed to get timestamp extremes for FILL/RUN query. ' + JSON.stringify(event));
                    }
                    const min = extremes['min']['value_as_string'];
                    const max = extremes['max']['value_as_string'];
                    this.widgetWrapper.log('Got timestamp extremes. ' + min + ', ' + max, 'info')
                    const range =  ChartUtils.makeQueryRangeFromStrings(min, max);
                    return of(range);
                }),
                map(this.queryRange.bind(this)),
                catchError(this.onQueryError.bind(this))
            )
            .subscribe();

        // const obs = this.dataService.queryTerm(this.queryParams, term)
        //     .pipe(
        //         tap(() => this.aggregated = false),
        //         map(this.setChartData.bind(this)),
        //         catchError(this.onQueryError.bind(this)),
        //         share());
        // obs.subscribe();
        // return obs;
    }

    updateLive() {
        if (this.aggregated || this.chartData.length < 1 || this.chartData[0].x.length < 1) {
            this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
            return;
        }
        const x = this.chartData[0].x;
        const lastX = x[x.length - 1];
        this.dataService.queryNewestSince(this.queryParams, lastX)
            .subscribe(hits => {
                const wi = this.config['widget'];
                wi['series'].forEach((s, i) => {
                    const trace = this.chartData[i];
                    trace.y = trace.y.concat(
                        hits.map(hit => hit[wi['field']][s]));
                    trace.x = trace.x.concat(
                        hits.map(hit => this.tsToChartTimestamp(hit[this.queryParams.timestampField])));
                    trace.text = trace.text.concat(
                        hits.map(this.makeTooltipText.bind(this)));
                    this.dropPointsOutsideLiveWindow(trace);
                });
                this.setXZoomToLiveWindow();
                Plotly.redraw(this.plot.nativeElement, this.chartData);
            });
    }

    makeTooltipText(hit) {
        if (!this.config['widget']['tooltipFields']) {
            return undefined;
        }
        const lines = [];
        this.config['widget']['tooltipFields'].forEach(f => {
            lines.push(f + ': ' + hit[f]);
        })
        return lines.join('\n');
    }

    dropPointsOutsideLiveWindow(trace) {
        const lastX = this.tsToMilliseconds(trace.x[trace.x.length -1]);
        const liveWindow = this.config['widget']['liveWindow'];
        while(lastX - this.tsToMilliseconds(trace.x[0]) > liveWindow) {
            trace.x.shift();
            trace.y.shift();
            trace.text.shift();
        }
    }

    setXZoomToLiveWindow() {
        if (this.chartData.length < 1) {
            return;
        }
        const trace = this.chartData[0];
        const max = this.tsToMilliseconds(trace.x[trace.x.length -1]);
        const min = max - this.config['widget']['liveWindow'];
        const mod = ChartUtils.setXRange(
            this.plot.nativeElement['layout'],
            (new Date(min)).toISOString(),
            (new Date(max)).toISOString());
        Plotly.relayout(this.plot.nativeElement, mod);
    }

    makeSeries() {
        this.chartData.length = 0;
        const wi = this.config['widget'];
        const names = wi['legendNames'] || [];
        wi['series'].forEach((s, i) => {
            const newSeries = {
                x: [],
                y: [],
                text: [],
                name: names[i] || wi['field'] + '.' + s,
                type: 'scatter',
                line: { width: 1},
            };
            this.chartData.push(newSeries);
        });
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
