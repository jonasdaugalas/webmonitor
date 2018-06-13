import { Component, OnInit, Input } from '@angular/core';
import { EventBusService } from 'app/core/event-bus.service';

@Component({
    selector: 'app-fill-run-ls-query-widget',
    templateUrl: './fill-run-ls-query-widget.component.html',
    styleUrls: ['./fill-run-ls-query-widget.component.css']
})
export class FillRunLsQueryWidgetComponent implements OnInit {

    @Input('config') config;

    constructor(protected eventBus: EventBusService) { }

    ngOnInit() {
    }

    query(event) {
        this.eventBus.emit(
            this.config['widget']['channel'],
            {type: 'fill_run_ls_query', payload: event});
    }

}
