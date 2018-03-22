import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

import { WidgetComponent } from './widget/widget.component';
import { SettingsComponent } from './widget/settings/settings.component';
import { DateRangeFormComponent } from './date-range-form/date-range-form.component';
import { FillRunLsFormComponent } from './fill-run-ls-form/fill-run-ls-form.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ClarityModule.forChild(),
        OwlNativeDateTimeModule,
        OwlDateTimeModule
    ],
    declarations: [
        WidgetComponent,
        SettingsComponent,
        DateRangeFormComponent,
        FillRunLsFormComponent
    ],
    exports: [
        CommonModule, ClarityModule, FormsModule,
        OwlNativeDateTimeModule, OwlDateTimeModule,
        WidgetComponent, DateRangeFormComponent, FillRunLsFormComponent
    ]
})
export class SharedModule { }
