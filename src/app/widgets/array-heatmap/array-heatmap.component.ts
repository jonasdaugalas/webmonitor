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


function getChartSeriesTemplate() {
    return {
        type: 'heatmap',
        z: [],
        zauto: false,
        x: [],
        y: undefined,
        xtype: "array",
        hoverinfo: "x+y+z+text",
        colorbar: {
            // title: "",
            titleside: "right",
            x: 1,
            xpad: 3,
            ypad: 3,
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
        // this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
    }

    refresh() {
        const obs = this.dataService.queryNewest(this.queryParams, 200)
            .map(this.setData.bind(this))
            .share();
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
        const newSeries = getChartSeriesTemplate();
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
            .map(this.setData.bind(this))
            .share();
        obs.subscribe(() => {
            this.setXZoom(range['strFrom'], range['strTo']);
        });
        return obs;
    }

    setXZoom(min, max) {
        this.chartLayout['xaxis']['autorange'] = false;
        this.chartLayout['xaxis']['range'] = [min, max];
        Plotly.relayout(this.plot.nativeElement, this.chartLayout);
    }

    // updateLive() {
    //     if (this.series.length < 1) {
    //         this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
    //         return;
    //     }
    //     const lastXPerSource = this.getLastXPerSource();
    //     this.dataService.queryNewestSince(this.queryParams, lastXPerSource)
    //         .subscribe(resp => {
    //             this.queryParams.sources.forEach((source, i) => {
    //                 const hits = resp[i].filter(hit => hit[source.timestampField] !== lastXPerSource[i]);
    //                 if (hits.length < 1) {
    //                     return;
    //                 }
    //                 source.fields.forEach((field, j) => {
    //                     const series = this.series[i][j];
    //                     series.x = series.x.concat(hits.map(hit => hit[source.timestampField]));
    //                     series.y = series.y.concat(hits.map(hit => hit[field.name]));
    //                     this.dropPointsOutsideLiveWindow(series);
    //                 });
    //             });
    //             this.setXZoomToLiveWindow(lastXPerSource);
    //             Plotly.redraw(this.plot.nativeElement, this.chartData);
    //         });
    // }

    // getLastXPerSource() {
    //     return this.series.map(s => {
    //         const x = s[0].x;
    //         return x[x.length -1];
    //     })
    // }

    // dropPointsOutsideLiveWindow(series) {
    //     const lastX = new Date(series.x[series.x.length -1]);
    //     const liveWindow = this.config['widget']['liveWindow'];
    //     while(lastX.getTime() - (new Date(series.x[0])).getTime() > liveWindow) {
    //         series.x.shift();
    //         series.y.shift();
    //     }
    // }

    // setXZoomToLiveWindow(lastPerSource?) {
    //     if (!lastPerSource) {
    //         lastPerSource = this.getLastXPerSource();
    //     }
    //     const max = Math.max.apply(null, lastPerSource.map(x => (new Date(x)).getTime()));
    //     if (!Number.isInteger(max)) {
    //         return;
    //     }
    //     const min = max - this.config['widget']['liveWindow'];
    //     const xaxis = this.plot.nativeElement['layout']['xaxis'];
    //     const newRange = [
    //         (new Date(min)).toISOString(),
    //         (new Date(max)).toISOString()];
    //     xaxis['range'] = newRange;
    //     xaxis['autorange'] = false;
    //     Plotly.relayout(this.plot.nativeElement, {xaxis: xaxis});
    // }

}
