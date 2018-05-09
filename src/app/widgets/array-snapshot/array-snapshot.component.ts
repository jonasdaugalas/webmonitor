import {
    Component, OnInit, Input, ViewChild, ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';

declare var Plotly: any;

@Component({
    selector: 'wm-array-snapshot',
    templateUrl: './array-snapshot.component.html',
    styleUrls: ['./array-snapshot.component.css']
})
export class ArraySnapshotComponent implements OnInit {

    @Input('config') config;
    @ViewChild('plot') protected plot: ElementRef;
    resizeEventSubs: Subscription;
    reflow: () => void;
    chartData = [];
    chartLayout = ChartUtils.getDefaultLayout();
    chartConfig = ChartUtils.getDefaultConfig();
    queryParams;
    series = [];

    constructor(
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
            queriesEnabled: false,
            startEnabled: true,
            refreshEnabled: true
        }, this.config['wrapper'] || {});
        const wi = this.config['widget'] = this.config['widget'] || {};
        console.log(wi);
        this.queryParams = {
            database: wi['database'],
            timestampField: wi['timestampField'] || 'timestamp',
            index: wi['index'],
            documentType: wi['documentType'],
            terms: wi['terms'],
            fields: wi['fields']
        };
    }

    ngAfterViewInit() {
        Plotly.plot(this.plot.nativeElement,
                    this.chartData, this.chartLayout, this.chartConfig);
        this.configureLayout(this.config['widget']);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.resizeEventSubs = ChartUtils.subscribeReflow(this.eventBus, this.reflow);
        this.reflow();
        this.refresh();
    }

    configureLayout(widget) {
        const update = {
            xaxis: {
                title: widget['xAxisTitle'],
            },
            yaxis: {
                title: widget['yAxisTitle'],
            },
            legend: ChartUtils.getLegendConfig(widget['legend']),
            barmode: 'group',
            bargap: 0,
            bargroupgap: 0
        }
        Plotly.relayout(this.plot.nativeElement, update);
    }

    onRefreshEvent() {
        this.refresh();
    }

    onStartEvent() {
        this.refresh();
    }

    refresh() {
        const obs = this.dataService.queryNewest(this.queryParams)
            .map(this.setData.bind(this))
            .share();
        obs.subscribe();
        return obs;
    }

    setData(newData) {
        console.log(newData);
        this.chartData.length = 0;
        this.series.length = 0;
        this.queryParams.fields.forEach((f, i) => {
            const newSeries = {
                y: newData[0][f.name],
                name: f.seriesName,
                type: this.config['widget']['chartType'] || 'bar',
                mode: 'markers'
            };
            this.chartData.push(newSeries);
            this.series.push(newSeries);
        });
        Plotly.redraw(this.plot.nativeElement, this.chartData);
    }

queryRange(range) {
    // this.widgetWrapper.stop();
    // const obs = this.dataService.queryRange(
    //     this.queryParams, range['strFrom'], range['strTo'])
    //     .map(this.setData.bind(this))
    //     .share();
    // obs.subscribe();
    // return obs;
}

updateLive() {
    // if (this.series.length < 1) {
    //     this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
    //     return;
    // }
    // const lastXPerSource = this.getLastXPerSource();
    // this.dataService.queryNewestSince(this.queryParams, lastXPerSource)
    //     .subscribe(resp => {
    //         this.queryParams.sources.forEach((source, i) => {
    //             const hits = resp[i].filter(hit => hit[source.timestampField] !== lastXPerSource[i]);
    //             if (hits.length < 1) {
    //                 return;
    //             }
    //             source.fields.forEach((field, j) => {
    //                 const series = this.series[i][j];
    //                 series.x = series.x.concat(hits.map(hit => hit[source.timestampField]));
    //                 series.y = series.y.concat(hits.map(hit => hit[field.name]));
    //                 this.dropPointsOutsideLiveWindow(series);
    //             });
    //         });
    //         this.setXZoomToLiveWindow(lastXPerSource);
    //         Plotly.redraw(this.plot.nativeElement, this.chartData);
    //     });
}

}
