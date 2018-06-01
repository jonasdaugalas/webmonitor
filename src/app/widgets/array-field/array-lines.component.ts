import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { DataService } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { map, tap, share } from 'rxjs/operators';

// import * as Plotly from 'plotly.js';
declare var Plotly: any;

@Component({
    selector: 'wm-widget-array-lines',
    templateUrl: './array-lines.component.html',
    styleUrls: ['./array-lines.component.css']
})
export class ArrayLinesComponent implements OnInit, AfterViewInit {

    @Input('config') config;
    @ViewChild('plot') protected plot: ElementRef;
    @ViewChild('widgetWrapper') protected widgetWrapper: WidgetComponent;
    chartData = [];
    chartLayout;
    chartConfig = ChartUtils.getDefaultConfig();
    queryParams;
    parseToDate = ChartUtils.parseStringTimestamp;
    parseToChartTimestamp = (ts) => ts;
    parseToMilliseconds = (ts) => this.parseToDate(ts).getTime();
    reflow = () => undefined;

    constructor( protected db: DatabaseService,
                 protected dataService: DataService) {}

    ngOnInit() {
        const wr = this.config['wrapper'] = this.config['wrapper'] || {};
        const wi = this.config['widget'] = this.config['widget'] || {};
        wi['series'] = wi['series'] || [];
        if (wr['startEnabled']) {
            wi['liveWindow'] = wi['liveWindow'] || 600000;
        }
        this.chartLayout = ChartUtils.configureDefaultLayout(wi);
        this.queryParams = {
            database: wi['database'],
            index: wi['index'],
            documentType: wi['documentType'],
            timestampField: wi['timestampField'] || 'timestamp',
            field: wi['field'],
            tooltipFields: wi['tooltipFields'],
            nestedPath: wi['nestedPath'],
            terms: wi['terms']
        }
        if (wi['timestampUNIX']) {
            this.parseToDate = ChartUtils.parseUNIXTimestamp;
            this.parseToChartTimestamp = (ts) => this.parseToDate(ts).toISOString();
        }
        this.makeSeries();
    }

    ngAfterViewInit() {
        Plotly.plot(
            this.plot.nativeElement,
            this.chartData,
            this.chartLayout,
            this.chartConfig);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.reflow();
        if (!this.config['wrapper']['started']) {
            this.refresh();
        }
    }

    onRefreshEvent() {
        this.refresh();
    }

    onStartEvent() {
        this.updateLive();
    }


    refresh(size?) {
        size = Number.isInteger(size) ? size : this.config['widget']['refreshSize'] || 50;
        const obs = this.dataService.queryNewest(this.queryParams, size).pipe(
            tap(this.setChartData.bind(this)),
            share()
        );
        obs.subscribe(
            () => undefined,
            err => {this.setChartData(null);}
        );
        return obs;
    }

    setChartData(hits) {
        const wi = this.config['widget'];
        wi['series'].forEach((s, i) => {
            this.chartData[i].y = hits.map(hit => hit[wi['field']][s]);
            this.chartData[i].x = hits.map(hit => this.parseToChartTimestamp(hit[this.queryParams.timestampField]));
            this.chartData[i].text = hits.map(this.makeTooltipText.bind(this));
        });
        ChartUtils.setAutorange(this.chartLayout);
        Plotly.redraw(this.plot.nativeElement);
    }

    queryRange(range) {
        this.widgetWrapper.stop();
        const obs = this.dataService.queryRange(
            this.queryParams, range['strFrom'], range['strTo']).pipe(
                map(this.setChartData.bind(this)),
                share()
            );
        obs.subscribe();
        return obs;
    }

    updateLive() {
        if (this.chartData.length < 1 || this.chartData[0].x.length < 1) {
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
                        hits.map(hit => this.parseToChartTimestamp(hit[this.queryParams.timestampField])));
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
        const lastX = this.parseToMilliseconds(trace.x[trace.x.length -1]);
        const liveWindow = this.config['widget']['liveWindow'];
        while(lastX - this.parseToMilliseconds(trace.x[0]) > liveWindow) {
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
        const max = this.parseToMilliseconds(trace.x[trace.x.length -1]);
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

}
