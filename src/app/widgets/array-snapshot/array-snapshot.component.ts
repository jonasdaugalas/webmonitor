import {
    Component, OnInit, Input, ViewChild, ElementRef
} from '@angular/core';
import { Subscription, empty as emptyObservable } from 'rxjs';
import { map, tap, catchError, share } from 'rxjs/operators';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';
import { ChartWidget } from 'app/widgets/base/chart-widget';

declare var Plotly: any;

@Component({
    selector: 'wm-array-snapshot',
    templateUrl: './array-snapshot.component.html',
    styleUrls: ['./array-snapshot.component.css']
})
export class ArraySnapshotComponent extends ChartWidget implements OnInit {

    queryParams;
    series = [];
    info = {};
    needWebGLFallback = false;

    constructor(
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(eventBus);
    }

    ngOnInit() {
        super.ngOnInit({
            'timestampField': 'timestamp'
        });
        const wi = this.config['widget'];
        this.configureLayout(wi);
        if (wi['chartType'] && wi['chartType'].toLowerCase() === 'scattergl') {
            if (!ChartUtils.detectWebGLContext()) {
                this.needWebGLFallback = true;
            }
        }
        this.queryParams = {
            database: wi['database'],
            timestampField: wi['timestampField'],
            index: wi['index'],
            documentType: wi['documentType'],
            terms: wi['terms'],
            fields: wi['fields'],
            runField: wi['runField'],
            lsField: wi['lsField']
        };
    }

    ngAfterViewInit() {
        if (this.needWebGLFallback) {
            return;
        }
        super.ngAfterViewInit();
        if (!this.config['wrapper']['started']) {
            this.refresh();
        }
    }

    configureLayout(widget) {
        const update = {
            xaxis: {
                type: 'linear',
                title: widget['xAxisTitle']
            },
            barmode: 'group'
        }
        this.chartLayout = Object.assign(this.chartLayout, update);
    }

    queryFromEvent(event) {
        if (event['type'] === 'fill_run_ls_query') {
            if (this.config['widget']['runLsQueriesEnabled']) {
                this.widgetWrapper.log('Received RUN,LS query', 'info');
                this.queryRunLs(event['payload']);
            }
        }
    }

    onRefreshEvent() {
        this.widgetWrapper.stop();
        this.refresh();
    }

    onStartEvent() {
        this.refresh();
    }

    onQueryError(error) {
        this.setData([]);
        this.widgetWrapper.log(String(error), 'danger', 5000);
        throw(error);
    }

    refresh() {
        if (this.needWebGLFallback) {
            return;
        }
        const obs = this.dataService.queryNewest(this.queryParams).pipe(
            map(this.setData.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share()
        );
        obs.subscribe();
        return obs;
    }

    queryRunLs(event) {
        this.widgetWrapper.stop();
        if (!event['run'] || !event['ls']) {
            this.widgetWrapper.log('RUN and LS must be specified', 'warning', 3500);
            return emptyObservable();
        }
        const runTerm = {};
        const lsTerm = {};
        runTerm[this.queryParams.runField] = event['run'];
        lsTerm[this.queryParams.lsField] = event['ls'];
        const obs = this.dataService.queryTerms(this.queryParams, [runTerm, lsTerm]).pipe(
            map(this.setData.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share()
        );
        obs.subscribe();
        return obs;
    }

    setData(newData) {
        if (!newData[0]) {
            this.widgetWrapper.log('Cannot draw chart: no data.', 'danger', 3500);
            return;
        }
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
        ChartUtils.setAutorange(this.chartLayout)
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

    tryWebGLFallback() {
        if (this.needWebGLFallback &&
            this.config['widget']['chartType'] === 'scattergl') {
            this.config['widget']['chartType'] = 'scatter';
            this.needWebGLFallback = false;
            this.ngAfterViewInit();
        }

    }

}
