import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { DataService } from './data.service';

// import * as Plotly from 'plotly.js';
declare var Plotly: any;

function parseUNIXTimestamp(t) {
    return new Date(t*1000).toISOString();
}


@Component({
    selector: 'wm-widget-array-lines',
    templateUrl: './array-lines.component.html',
    styleUrls: ['./array-lines.component.css']
})
export class ArrayLinesComponent implements OnInit, AfterViewInit {

    @Input('config') config;
    @ViewChild('plot') protected plot: ElementRef;
    chartData = [];
    chartLayout = Object.assign(ChartUtils.getDefaultLayout(), {
        'xaxis': {
            title: "Date UTC",
            ticks: "outside",
            type: "date"
        }
    });
    chartConfig = ChartUtils.getDefaultConfig();
    queryParams;
    parseTimestamp = (timestamp) => timestamp;

    constructor( protected db: DatabaseService,
                 protected dataService: DataService) {}

    ngOnInit() {
        const wr = this.config['wrapper'] = this.config['wrapper'] || {};
        const wi = this.config['widget'] = this.config['widget'] || {};
        this.chartLayout['legend'] = ChartUtils.getLegendConfig(wi['legend']);
        wi['series'] = wi['series'] || [];
        if (wi['timestampUNIX']) {
            this.parseTimestamp = parseUNIXTimestamp;
        }
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
        this.makeSeries();
    }

    ngAfterViewInit() {
        console.log(this.plot);
        Plotly.plot(
            this.plot.nativeElement,
            this.chartData,
            this.chartLayout,
            this.chartConfig);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.reflow();
        this.refresh();
    }

    // reflow reassigned in ngAfterViewInit
    reflow() {}

    refresh(size?) {
        size = Number.isInteger(size) ? size : this.config['widget']['refreshSize'] || 50;
        this.dataService.queryNewest(this.queryParams, size)
            .subscribe(
                this.setChartData.bind(this),
                err => {this.setChartData(null);}
            );
    }

    setChartData(hits) {
        const wi = this.config['widget'];
        wi['series'].forEach((s, i) => {
            this.chartData[i].y = hits.map(hit => hit[wi['field']][s]);
            this.chartData[i].x = hits.map(hit => this.parseTimestamp(hit[this.queryParams.timestampField]));
            this.chartData[i].text = hits.map(this.makeTooltipText.bind(this));
        });
        Plotly.redraw(this.plot.nativeElement);
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

    makeSeries() {
        this.chartData.length = 0;
        const wi = this.config['widget'];
        const names = wi['legendNames'] || [];
        wi['series'].forEach((s, i) => {
            const newSeries = {
                x: [],
                y: [],
                name: names[i] || wi['field'] + '.' + s,
                type: 'scatter',
                line: { width: 1},
            };
            this.chartData.push(newSeries);
        });
    }

}
