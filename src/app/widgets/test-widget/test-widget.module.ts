import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';

import { TestWidgetComponent } from './test-widget.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [
        TestWidgetComponent
    ],
    entryComponents: [TestWidgetComponent]
})
export class TestWidgetModule {
    static entry = TestWidgetComponent;
}
