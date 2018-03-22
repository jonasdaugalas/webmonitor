import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { FillRunLsQueryWidgetComponent } from './fill-run-ls-query-widget.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [FillRunLsQueryWidgetComponent],
    entryComponents: [FillRunLsQueryWidgetComponent]
})
export class FillRunLsQueryWidgetModule {
    static entry = FillRunLsQueryWidgetComponent;
}
