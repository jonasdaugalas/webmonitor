import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'wm-range-form',
    templateUrl: './range-form.component.html',
    styleUrls: ['./range-form.component.css']
})
export class RangeFormComponent implements OnInit {

    @Input('key') key: string;
    @Input('label') label: string;
    @Input('inputType') inputType: 'string' | 'number';
    @Output('query') onQuery = new EventEmitter();

    minValue;
    maxValue;

    constructor() { }

    ngOnInit() {
    }

    query() {
        this.onQuery.emit({
            'key': this.key,
            'min': this.inputType === 'number' ? parseFloat(this.minValue) : this.minValue,
            'max': this.inputType === 'number' ? parseFloat(this.maxValue) : this.maxValue
        });
    }
}
