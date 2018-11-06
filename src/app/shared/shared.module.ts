import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

import { DynamicFormModule } from './dynamic-form/dynamic-form.module';
import { WidgetComponent } from './widget/widget.component';
import { SettingsComponent } from './widget/settings/settings.component';
import { DateRangeFormComponent } from './date-range-form/date-range-form.component';
import { RangeFormComponent } from './range-form/range-form.component';
import { DelimitedFormComponent } from './delimited-form/delimited-form.component';
import { FillRunLsFormComponent } from './fill-run-ls-form/fill-run-ls-form.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ClarityModule,
        ClrFormsNextModule,
        OwlNativeDateTimeModule,
        OwlDateTimeModule,
        DynamicFormModule
    ],
    declarations: [
        WidgetComponent,
        SettingsComponent,
        DateRangeFormComponent,
        FillRunLsFormComponent,
        RangeFormComponent,
        DelimitedFormComponent
    ],
    exports: [
        CommonModule,
        ClarityModule, ClrFormsNextModule,
        FormsModule, ReactiveFormsModule,
        OwlNativeDateTimeModule, OwlDateTimeModule, DynamicFormModule,
        WidgetComponent, DateRangeFormComponent, FillRunLsFormComponent,
        RangeFormComponent, DelimitedFormComponent
    ]
})
export class SharedModule { }
