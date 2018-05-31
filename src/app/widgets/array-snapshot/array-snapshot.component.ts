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
    info = {};
    needWebGLFallback = false;

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
        if (wi['chartType'] && wi['chartType'].toLowerCase() === 'scattergl') {
            if (!ChartUtils.detectWebGLContext()) {
                this.needWebGLFallback = true;
            }
        }
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
        if (this.needWebGLFallback) {
            return;
        }
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
                title: widget['xAxisTitle']
            },
            yaxis: {
                title: widget['yAxisTitle'],
                type: widget['yAxisScale'] || 'lin'
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
        if (this.needWebGLFallback) {
            return;
        }
        const obs = this.dataService.queryNewest(this.queryParams)
            .map(this.setData.bind(this))
            .share();
        obs.subscribe();
        return obs;
    }

    setData(newData) {
        this.chartData.length = 0;
        this.series.length = 0;
        this.queryParams.fields.forEach((f, i) => {
            let y = newData[0][f.name];
            if (f.mask) {
                y = this.applyMask(y, newData[0][f.mask]);
            }
            const newSeries = {
                y: y,
                name: f.seriesName,
                type: this.config['widget']['chartType'] || 'bar',
                mode: 'markers',
                marker: { size: 5 }
            };
            this.offsetXValues(newSeries);
            this.chartData.push(newSeries);
            this.series.push(newSeries);
        });
        this.updateAnnotation(newData);
        this.setAutorange();
        Plotly.redraw(this.plot.nativeElement, this.chartData, this.chartLayout);
        this.updateInfo(newData);
    }

    applyMask(data, mask) {
        return data.map((v, i) => mask[i] ? v : null);
    }

    updateInfo(newData) {
        this.info = {
            timestamp: newData[0][this.queryParams.timestampField]
        }
    }

    updateLive() {
        return this.refresh();
    }

    updateAnnotation(newData) {
        this.chartLayout['annotations'] = [{
            y: 1,
            x: 0.5,
            xref: 'paper',
            yref: 'paper',
            xanchor: 'middle',
            yanchor: 'top',
            bgcolor: 'FFFFFF80',
            text: newData[0]['timestamp'],
            showarrow: false,
            font: { size: 18 }
        }];
    }

    offsetXValues(newSeries) {
        if (this.config['widget']['xOffset']) {
            const x = newSeries['y'].map((v, i) => {
                return i + this.config['widget']['xOffset'];
            });
            newSeries['x'] = x;
        }
        return newSeries;
    }

    setAutorange() {
        const xaxis = this.plot.nativeElement['layout']['xaxis'];
        const yaxis = this.plot.nativeElement['layout']['yaxis'];
        xaxis['autorange'] = true;
        yaxis['autorange'] = true;
    }

    tryWebGLFallback() {
        if (this.needWebGLFallback &&
            this.config['widget']['chartType'] === 'scattergl') {
            this.config['widget']['chartType'] = 'scatter';
            this.needWebGLFallback = false;
            this.ngAfterViewInit();
        }

    }

}
