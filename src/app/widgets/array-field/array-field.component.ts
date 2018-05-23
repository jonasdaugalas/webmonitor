import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { DataService } from '../array-heatmap/data.service';

// import * as Plotly from 'plotly.js';
declare var Plotly: any;

@Component({
    selector: 'app-array-field',
    templateUrl: './array-field.component.html',
    styleUrls: ['./array-field.component.css']
})
export class ArrayFieldComponent implements OnInit, AfterViewInit {

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

    constructor( protected db: DatabaseService,
                 protected dataService: DataService) {}

    ngOnInit() {
        const wr = this.config['wrapper'] = this.config['wrapper'] || {};
        const wi = this.config['widget'] = this.config['widget'] || {};
        wi['series'] = wi['series'] || [];
        wr['controlsEnabled'] = true;
        wr['optionsEnabled'] = false;
        wr['queriesEnabled'] = false;
        wr['startEnabled'] = false;
        wr['refreshEnabled'] = true;
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

    refresh() {
        this.dataService.queryNewest(this.queryParams, 1000)
            .subscribe(
                this.setChartData.bind(this),
                err => {this.setChartData(null);}
            );
    }

    setChartData(hits) {
        console.log(hits);
        this.chartData.length = 0;
        if (!hits) {
            Plotly.redraw(this.plot.nativeElement);
            return;
        }
        this.config['widget']['series'].forEach(s => {
            const y = [];
            const x = [];
            const text = [];
            hits.forEach(hit => {
                x.push(new Date(hit['timestamp']*1000).toISOString());
                y.push(hit[this.config['widget']['field']][s]);
                text.push(this.makeTooltipText(hit));
            });
            this.chartData.push({
                name: this.config['widget']['field'] + '.' + s,
                x: x,
                y: y,
                text: text,
                type: 'line'
            });
        });
        console.log(this.chartData);
        Plotly.redraw(this.plot.nativeElement);
    }

    makeTooltipText(hit) {
        const lines = [];
        this.config['widget']['tooltipFields'].forEach(f => {
            lines.push(f + ': ' + hit[f]);
        })
        return lines.join('\n');
    }

}
