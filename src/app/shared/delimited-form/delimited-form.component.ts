import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'wm-delimited-form',
    templateUrl: './delimited-form.component.html',
    styleUrls: ['./delimited-form.component.css']
})
export class DelimitedFormComponent implements OnInit {

    @Input('key') key: string;
    @Input('label') label: string;
    @Input('delimiter') delimiter: string = ',';
    @Input('inputType') inputType: 'string' | 'number';
    @Output('query') onQuery = new EventEmitter();

    placeholder: string;
    inputModel: string = '';

    constructor() { }

    ngOnInit() {
        this.placeholder = (this.label || this.key) +
            '. \"' + this.delimiter + '\" delimited';
    }

    query() {
        if (typeof this.inputModel == 'undefined' || this.inputModel === '') {
            return;
        }
        const split = this.inputModel.split(this.delimiter);
        let values = [];
        if (this.inputType == 'string') {
            values = split.map(v => String(v));
        } else if (this.inputType == 'number') {
            values = split.map(v => Number(v));
        }

        this.onQuery.emit({
            'key': this.key,
            'value': values
        });
    }
}
