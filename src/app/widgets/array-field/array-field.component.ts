import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { DatabaseService } from 'app/core/database.service';

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
    fields: Array<string>;
    chartData = [];
    chartLayout = {
        margin: {
            b: 40,
            l: 60,
            r: 40,
            t: 20
        },
        showlegend: true,
        legend: {
            orientation: "h"
        },
        xaxis: {
            title: "Date UTC",
            ticks: "outside",
            type: "date"
        },
        autosize: true
    };
    chartConfig = {
        modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'toImage'],
        displaylogo: false
    }

    constructor( protected db: DatabaseService ) {}

    ngOnInit() {
        const wr = this.config['wrapper'];
        wr['controlsEnabled'] = true;
        wr['optionsEnabled'] = false;
        wr['queriesEnabled'] = false;
        wr['startEnabled'] = false;
        wr['refreshEnabled'] = true;
        const wi = this.config['widget'];
        this.fields = ['timestamp']
            .concat(wi['tooltipFields'])
            .concat([wi['field']])
            .filter(Boolean);
        if (wi['nestedPath']) {
            this.fields = this.fields.map(val => wi['nestedPath'] + '.' + val);
        }
    }

    ngAfterViewInit() {
        console.log(this.plot);
        Plotly.plot(this.plot.nativeElement, this.chartData, this.chartLayout, this.chartConfig);
        this.reflow();
        this.refresh();
    }

    reflow() {
        setTimeout(() => {
            Plotly.relayout(this.plot.nativeElement, {width: null, height: null});
        });
    }

    refresh() {
        const wi = this.config['widget'];
        const url = wi['index'] + '/_search';
        const body = {
            'size': 1000,
            '_source': this.fields
        };
        this.db.query(url, body).subscribe(resp => {
            if (wi['nestedPath']) {
                this.setChartData(resp['hits']['hits'].map(hit => hit['_source'][wi['nestedPath']]));
            } else {
                this.setChartData(resp['hits']['hits']);
            }
        }, err => {
            this.setChartData(null);
        });
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
