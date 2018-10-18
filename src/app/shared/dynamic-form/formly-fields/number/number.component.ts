import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, DefaultValueAccessor } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';


import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'formly-field-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.css']
})
export class NumberComponent extends FieldType implements AfterViewInit {

    protected lastValue;

    ngAfterContentInit() {
        // bellow overwriting setValue function to avoid
        // FormControl.valueChanges firing multiple times
        // see: https://github.com/angular/angular/issues/12540
        const originalSetValue = this.field.formControl.setValue.bind(this.field.formControl);
        this.field.formControl.setValue = (value: any, options: any) => {
            if (value !== this.lastValue) {
                this.lastValue = value;
                originalSetValue(value, options);
            }
        };

    }

}
