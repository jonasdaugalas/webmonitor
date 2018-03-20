import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

import { WidgetComponent } from './widget/widget.component';
import { SettingsComponent } from './widget/settings/settings.component';
import { DateRangeFormComponent } from './date-range-form/date-range-form.component';

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
        DateRangeFormComponent
    ],
    exports: [
        WidgetComponent, DateRangeFormComponent, CommonModule, ClarityModule,
        OwlNativeDateTimeModule, OwlDateTimeModule, FormsModule
    ]
})
export class SharedModule { }
