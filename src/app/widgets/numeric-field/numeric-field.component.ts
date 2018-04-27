import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
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
    chartData = [];
    chartLayout = Object.assign(ChartUtils.getDefaultLayout(), {
        'xaxis': {
            title: "Date UTC",
            ticks: "outside",
            type: "date"
        }
    });
    chartConfig = ChartUtils.getDefaultConfig();

    constructor( protected db: DatabaseService,
                 protected eventBus: EventBusService ) {
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
    }

    ngAfterViewInit() {
        console.log(this.plot);
        Plotly.plot(
            this.plot.nativeElement,
            this.chartData,
            this.chartLayout,
            this.chartConfig);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.resizeEventSubs = this.eventBus.getEvents(0, 'global_reflow')
            .subscribe(this.reflow.bind(this));
        this.reflow();
        this.refresh();
    }


    // reflow method reassigned in ngAfterVievInit
    reflow() {};

    refresh() {

    }

}
