import {
    Component, OnInit, Input, ViewChild, ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs';
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
        super.ngOnInit();
        this.config['wrapper']['queriesEnabled'] = false;
        const wi = this.config['widget'];
        this.configureLayout(wi);
        if (wi['chartType'] && wi['chartType'].toLowerCase() === 'scattergl') {
            if (!ChartUtils.detectWebGLContext()) {
                this.needWebGLFallback = true;
            }
        }
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
            barmode: 'group',
            bargap: 0,
            bargroupgap: 0
        }
        this.chartLayout = Object.assign(this.chartLayout, update);
    }

    queryFromEvent(event) {
        console.warn('no queries implemented yet');
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
