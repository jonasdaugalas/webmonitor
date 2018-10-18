import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'wm-dynamic-form',
    templateUrl: './dynamic-form.component.html',
    styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {

    @Input('debounce') debounce = 0;
    form: FormGroup = null;
    fields: FormlyFieldConfig[] = null;
    @Input('model') model = {};
    @Output('modelChange') modelChange = new EventEmitter();
    rawModelChange = new Subject<number>();

    _formFields = {};
    @Input('formFields') set formFields(newFields) {
        this._formFields = newFields;
        this.fields = JSON.parse(JSON.stringify(this._formFields));
        if (this.fields && this.fields.length > 0) {
            this.form = new FormGroup({});
        } else {
            this.form = null;
        }
    }

    constructor() {
        let modelChange = <Observable<number>>this.rawModelChange;
        if (this.debounce > 0) {
            modelChange = this.rawModelChange.pipe(debounceTime(this.debounce));
        }
        modelChange.subscribe(model => this.modelChange.emit(model));
    }

    ngOnInit() {
    }

    onChange(model) {
        this.rawModelChange.next(model);
    }

}
