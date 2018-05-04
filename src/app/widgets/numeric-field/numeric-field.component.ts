import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from './data.service';
declare var Plotly: any;

@Component({
    selector: 'wm-numeric-field-widget',
    templateUrl: './numeric-field.component.html',
    styleUrls: ['./numeric-field.component.css']
})
export class NumericFieldComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input('config') config;
    @ViewChild('plot') protected plot: ElementRef;
    resizeEventSubs: Subscription;
    fields: Array<string>;
    reflow: () => void;
    chartData = [];
    chartLayout = ChartUtils.getDefaultLayout();
    chartConfig = ChartUtils.getDefaultConfig();
    queryParams;

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
            sources: wi['sources']
        };
    }

    ngAfterViewInit() {
        Plotly.plot(this.plot.nativeElement,
                    this.chartData, this.chartLayout, this.chartConfig);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.resizeEventSubs = ChartUtils.subscribeReflow(this.eventBus, this.reflow);
        this.reflow();
        this.refresh();
    }

    refresh() {
        this.dataService.queryNewest(this.queryParams, 40)
            .subscribe(this.setData.bind(this));
    }

    setData(newData) {
        this.chartData.length = 0;
        this.queryParams.sources.forEach((s, i) => {
            s.fields.forEach(f => {
                this.chartData.push({
                    x: newData[i].map(fields => fields[s.timestampField]),
                    y: newData[i].map(fields => fields[f.name]),
                    name: f.seriesName,
                    type: 'scatter'
                });
            });
        });
        console.log(this.chartData);
        Plotly.redraw(this.plot.nativeElement, this.chartData);
    }
}
