import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LabelWidgetComponent } from './label-widget.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [LabelWidgetComponent],
    entryComponents: [LabelWidgetComponent]
})
export class LabelWidgetModule {
    static entry = LabelWidgetComponent;
}
