import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { EventBusTestWidgetComponent } from './event-bus-test-widget.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [EventBusTestWidgetComponent],
    entryComponents: [EventBusTestWidgetComponent]
})
export class EventBusTestWidgetModule {
    static entry = EventBusTestWidgetComponent;
}
