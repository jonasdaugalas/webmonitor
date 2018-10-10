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
    utc = false;

    public timeRange = [this.dateBegin, this.dateEnd];


    constructor() { }

    ngOnInit() {
    }

    query() {
        let makeTSSec, makeTSMSec;
        if (this.utc) {
            makeTSSec = this.makeUTCTimestampSec;
            makeTSMSec = this.makeUTCTimestampMSec;
        } else {
            makeTSSec = this.makeTimestampSec;
            makeTSMSec = this.makeTimestampMSec;
        }
        this.onQuery.emit({
            'from': this.timeRange[0],
            'to': this.timeRange[1],
            'tsFrom': makeTSSec(this.timeRange[0]),
            'tsTo': makeTSSec(this.timeRange[1]),
            'msecFrom': makeTSMSec(this.timeRange[0]),
            'msecTo': makeTSMSec(this.timeRange[1]),
            'strFrom': this.makeISOWithoutMilliseconds(this.timeRange[0]),
            'strTo': this.makeISOWithoutMilliseconds(this.timeRange[1]),
            'utc': this.utc
        });
    }

    makeUTCTimestampMSec(date: Date) {
        return date.getTime() - date.getTimezoneOffset() * 60000;
    }

    makeTimestampMSec(date: Date) {
        return date.getTime();
    }

    makeUTCTimestampSec(date: Date) {
        return Math.round((date.getTime() - date.getTimezoneOffset() * 60000)/1000);
    }

    makeTimestampSec(date: Date) {
        return Math.round(date.getTime()/1000);
    }

    makeISOWithoutMilliseconds(date: Date) {
        if (this.utc) {
            date = new Date(this.makeUTCTimestampMSec(date));
        }
        return date.toISOString().split('.')[0] + 'Z';
    }

}
