import { Component, OnInit, Input } from '@angular/core';
import { EventBusService } from 'app/core/event-bus.service';

@Component({
    selector: 'wm-time-query-widget',
    templateUrl: './time-query-widget.component.html',
    styleUrls: ['./time-query-widget.component.css']
})
export class TimeQueryWidgetComponent implements OnInit {

    @Input('config') config;
    info;

    constructor(protected eventBus: EventBusService) {
    }

    ngOnInit() {
        this.config = this.config || {};
        if (!this.config.hasOwnProperty('widget')) {
            this.config['widget'] = {};
        }
    }

    query(event) {
        const ebEvent = {type: 'time_range_query', payload: event};
        this.eventBus.emit(this.config['widget']['channel'], ebEvent);
        console.log(event);
    }

}
