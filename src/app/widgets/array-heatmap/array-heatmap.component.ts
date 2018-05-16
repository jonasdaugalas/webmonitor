import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
declare var Plotly: any;


@Component({
    selector: 'wm-array-heatmap',
    templateUrl: './array-heatmap.component.html',
    styleUrls: ['./array-heatmap.component.css']
})
export class ArrayHeatmapComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input('config') config;
    @ViewChild('plot') protected plot: ElementRef;
    @ViewChild('widgetWrapper') protected widgetWrapper: WidgetComponent;
    resizeEventSubs: Subscription;
    chartData = [];
    chartLayout = ChartUtils.getDefaultLayout();
    chartConfig = ChartUtils.getDefaultConfig();
    queryParams;

    reflow: () => void;

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
        wi['liveWindow'] = wi['liveWindow'] || 600000;
        wi['refreshSize'] = wi['refreshSize'] || 100;
        if (!this.db.parseDatabase(wi['database'])) {
            wi['database'] = 'default';
        }
        this.queryParams = {
            database: wi['database'],
            index: wi['index'],
            documentType: wi['documentType'],
            timestampField: wi['timestampField'] || 'timestamp',
            field: wi['field'],
            terms: wi['terms']
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
            }
        }
        Plotly.relayout(this.plot.nativeElement, update);
    }

    onRefreshEvent() {
        this.refresh();
    }

    onStartEvent() {
        this.updateLive();
    }

    refresh(size?) {
        size = size || this.config['widget']['refreshSize'];
        const obs = this.dataService.queryNewest(this.queryParams, size)
            .pipe(
                map(this.setData.bind(this)),
                share()
            );
        obs.subscribe();
        return obs;
    }

    setData(newData) {
        console.log(newData);
        this.chartData.length = 0;
        if (!newData) {
            Plotly.redraw(this.plot.nativeElement, this.chartData);
            return;
        }
        const newSeries = this.getChartSeriesTemplate();
        newSeries.x = newData.map(hit => hit[this.queryParams.timestampField]);
        newSeries.z = [];
        const nRows = newData[0][this.queryParams.field].length;
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
                map(this.setData.bind(this)),
                share()
            );
        obs.subscribe(() => {
            this.setXZoom(range['strFrom'], range['strTo']);
        });
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
        this.dataService.queryNewestSince(this.queryParams, lastX, false)
            .pipe(
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
                    this.dropPointsOutsideLiveWindow();
                    this.setXZoomToLiveWindow();
                    Plotly.redraw(this.plot.nativeElement, this.chartData);
                }))
            .subscribe(() => {
                this.setXZoomToLiveWindow();
                if (this.dropPointsOutsideLiveWindow()) {
                    Plotly.redraw(this.plot.nativeElement, this.chartData);
                }
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




}
