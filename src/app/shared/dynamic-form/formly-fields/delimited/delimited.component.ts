import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, DefaultValueAccessor } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'formly-field-delimited',
    templateUrl: './delimited.component.html',
    styleUrls: ['./delimited.component.css']
})
export class DelimitedComponent extends FieldType implements OnInit {

    inputModel: string = '';

    modelChange$ = new Subject<string>();

    ngOnInit() {
        let mapper: (string) => any
        if (this.field.type == 'delimited-numbers') {
            mapper = (val) => Number(val);
        } else {
            mapper = (val) => String(val);
        }
        let delimiter = ',';
        if (typeof this.field.templateOptions['delimiter'] == 'string') {
            delimiter = this.field.templateOptions['delimiter'];
        }
        this.modelChange$.pipe(
            debounceTime(300)
        ).subscribe(event => {
            if (event == '') {
                this.formControl.setValue([]);
                return;
            }
            const value = event.split(delimiter).map(mapper);
            this.formControl.setValue(value);
        });
    }


    onModelChange(event) {
        this.modelChange$.next(event as string);
    }
}
