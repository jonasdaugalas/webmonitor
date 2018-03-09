import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';

import { WidgetComponent } from './widget/widget.component';
import { SettingsComponent } from './widget/settings/settings.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ClarityModule.forChild()
    ],
    declarations: [
        WidgetComponent,
        SettingsComponent
    ],
    exports: [
        WidgetComponent, CommonModule, ClarityModule
    ]
})
export class SharedModule { }
