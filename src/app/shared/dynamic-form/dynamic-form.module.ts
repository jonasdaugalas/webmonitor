import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';

import { DynamicFormComponent } from './dynamic-form.component';
import { FORMLY_FIELDS_CONFIG } from './formly-fields/formly-fields';

import { NumberComponent } from './formly-fields/number/number.component';

@NgModule({
    imports: [
        CommonModule,
        ClarityModule,
        ClrFormsNextModule,
        FormsModule, ReactiveFormsModule,
        FormlyModule.forRoot(FORMLY_FIELDS_CONFIG),

    ],
    declarations: [DynamicFormComponent, NumberComponent],
    exports: [DynamicFormComponent]
})
export class DynamicFormModule { }
