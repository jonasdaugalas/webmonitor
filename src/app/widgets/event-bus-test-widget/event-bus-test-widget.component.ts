import { Component, OnInit } from '@angular/core';
import { EventBusService } from 'app/core/event-bus.service';

@Component({
    selector: 'wm-event-bus-test-widget',
    templateUrl: './event-bus-test-widget.component.html',
    styleUrls: ['./event-bus-test-widget.component.css']
})
export class EventBusTestWidgetComponent implements OnInit {

    events = '';

    constructor(protected eventBus: EventBusService) {
        this.eventBus.events$.subscribe(event => {
            this.events += JSON.stringify(event) + '\n';
        })
    }

    ngOnInit() {
    }

}
