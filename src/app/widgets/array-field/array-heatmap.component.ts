import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription, empty as emptyObservable } from 'rxjs';
import { map, share, tap, catchError } from 'rxjs/operators';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { ChartWidget } from 'app/widgets/base/chart-widget';
declare var Plotly: any;


@Component({
    selector: 'wm-array-heatmap',
    templateUrl: './array-heatmap.component.html',
    styleUrls: ['./array-heatmap.component.css']
})
export class ArrayHeatmapComponent extends ChartWidget implements OnInit, AfterViewInit, OnDestroy {

    queryParams;

    constructor(
        protected db: DatabaseService,
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(eventBus);
    }

    ngOnInit() {
        super.ngOnInit({
            'liveWindow': 600000,
            'refreshSize': 100,
            'timestampField': 'timestamp'
        });
        const wi = this.config['widget'];
        this.queryParams = {
            database: wi['database'],
            index: wi['index'],
            documentType: wi['documentType'],
            timestampField: wi['timestampField'],
            field: wi['field'],
            terms: wi['terms'],
            fillField: wi['fillField'],
            runField: wi['runField'],
            extraFields: wi['extraFields'] || []
        };
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (!this.config['wrapper']['started']) {
            this.refresh();
        }
    }

    queryFromEvent(event) {
        if (event['type'] === 'time_range_query') {
            this.widgetWrapper.log('Received time range query', 'info');
            this.queryRange(event['payload']);
        } else if (event['type'] === 'fill_run_ls_query') {
            const wi = this.config['widget'];
            if (wi['fillQueriesEnabled'] || wi['runQueriesEnabled']) {
                this.widgetWrapper.log('Received FILL/RUN query', 'info');
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
        this.setData([]);
        throw(error);
    }

    refresh(size?) {
        size = size || this.config['widget']['refreshSize'];
        this.disableInteraction();
        const obs = this.dataService.queryNewest(this.queryParams, size)
            .pipe(
                map(this.filterZValues.bind(this)),
                tap(this.setData.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share()
            );
        obs.subscribe();
        return obs;
    }

    setData(newData) {
        this.chartData.length = 0;
        if (!newData) {
            Plotly.redraw(this.plot.nativeElement, this.chartData);
            return;
        }
        const newSeries = this.getChartSeriesTemplate();
        newSeries.x = newData.map(hit => hit[this.queryParams.timestampField]);
        newSeries.z = [];
        const nRows = Math.max.apply(Math, newData.map(point => point[this.queryParams.field].length));
        for (let r = 0; r < nRows; ++r) {
            newSeries.z.push(newData.map(hit => hit[this.queryParams.field][r]));
        }
        this.chartData.push(newSeries);
        ChartUtils.setAutorange(this.chartLayout);
        Plotly.redraw(this.plot.nativeElement, this.chartData, this.chartLayout);
    }

    queryRange(range) {
        this.widgetWrapper.stop();
        const obs = this.dataService.queryRange(
            this.queryParams, range['strFrom'], range['strTo'])
            .pipe(
                map(this.filterZValues.bind(this)),
                tap(this.setData.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share()
            );
        this.disableInteraction();
        obs.subscribe(() => {
            this.setXZoom(range['strFrom'], range['strTo']);
        });
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
            this.widgetWrapper.log('One of [FILL,RUN] must be specified', 'warning');
            return emptyObservable();
        }
        const obs = this.dataService.queryTerm(this.queryParams, term)
            .pipe(
                map(this.setData.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share());
        this.disableInteraction();
        obs.subscribe();
        return obs;
    }

    updateLive() {
        if (this.chartData.length < 1 || this.chartData[0].x.length < 1) {
            this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
            return;
        } else {
            this.dropPointsOutsideLiveWindow();
            this.setXZoomToLiveWindow();
        }
        const x = this.chartData[0].x;
        const lastX = x[x.length -1];
        this.disableInteraction();
        this.dataService.queryNewestSince(this.queryParams, lastX, false)
            .pipe(
                map(resp => this.filterZValues(resp)),
                tap(newData => {
                    if (newData.length < 1) {
                        return;
                    }
                    this.chartData[0].x = this.chartData[0].x.concat(
                        newData.map(hit => hit[this.queryParams.timestampField]));
                    const z = this.chartData[0].z;
                    const nRows = z.length;
                    for (let r = 0; r < nRows; ++r) {
                        z[r] = z[r].concat(newData.map(hit => hit[this.queryParams.field][r]));
                    }
                }))
            .subscribe(() => {
                this.setXZoomToLiveWindow();
                if (this.dropPointsOutsideLiveWindow()) {
                    Plotly.redraw(this.plot.nativeElement, this.chartData);
                }
                this.enableInteraction();
            });
    }

    dropPointsOutsideLiveWindow() {
        const x = this.chartData[0].x;
        const lastX = new Date(x[x.length -1]);
        const lastXTime = lastX.getTime();
        const liveWindow = this.config['widget']['liveWindow'];
        const z = this.chartData[0].z;
        const nRows = z.length;
        let dropped = 0;
        while(lastXTime - (new Date(x[0])).getTime() > liveWindow) {
            dropped += 1;
            x.shift();
            for (let r = 0; r < nRows; ++r) {
                z[r].shift();
            }
        }
        return dropped;
    }

    setXZoom(min, max) {
        this.chartLayout['xaxis']['autorange'] = false;
        this.chartLayout['xaxis']['range'] = [min, max];
        Plotly.relayout(this.plot.nativeElement, this.chartLayout);
    }

    setXZoomToLiveWindow() {
        const x = this.chartData[0].x;
        const lastX = new Date(x[x.length -1]);
        const max = lastX.getTime();
        const min = max - this.config['widget']['liveWindow'];
        this.setXZoom(
            (new Date(min)).toISOString(),
            (new Date(max)).toISOString());
        Plotly.relayout(this.plot.nativeElement, this.chartLayout);
    }

    getChartSeriesTemplate() {
        return {
            type: 'heatmap',
            z: [],
            zauto: false,
            x: [],
            xgap: 0.2,
            connectgaps: false,
            y: undefined,
            xtype: "array",
            hoverinfo: "x+y+z+text",
            colorbar: {
                title: this.config['widget']['zAxisTitle'],
                titleside: "right",
                x: 1,
                thickness: 14,
                tickangle: -90
            },
            colorscale: [
                [0, 'rgb(0,0,255)'],
                [0.25, 'rgb(0,255,255)'],
                [0.5, 'rgb(0,255,0)'],
                [0.75, 'rgb(255,255,0)'],
                [1, 'rgb(255,0,0)']
            ]
        };
    }

    filterZValues(data) {
        const threshold = this.config['widget']['filterZThreshold'];
        const filterZeros = this.config['widget']['filterZeros'];
        if (Number.isFinite(threshold)) {
            data.forEach(hit => {
                hit[this.queryParams.field] = hit[this.queryParams.field]
                    .map(val => val < threshold ? null : val);
            });
        }
        if (filterZeros) {
            data.forEach(hit => {
                hit[this.queryParams.field] = hit[this.queryParams.field]
                    .map(val => val === 0 ? null : val);
            });
        }
        return data as Array<any>;
    }
}
