import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'wm-date-range-form',
    templateUrl: './date-range-form.component.html',
    styleUrls: ['./date-range-form.component.css']
})
export class DateRangeFormComponent implements OnInit {

    @Input('dateBegin') dateBegin = new Date();
    @Input('dateEnd') dateEnd = new Date();
    @Output('query') onQuery = new EventEmitter();

    public timeRange = [this.dateBegin, this.dateEnd];


    constructor() { }

    ngOnInit() {
    }

    query() {
        this.onQuery.emit(this.timeRange.slice());
    }

}
