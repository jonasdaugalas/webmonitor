import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { DynamicFormTestComponent } from './dynamic-form-test.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [DynamicFormTestComponent],
    entryComponents: [DynamicFormTestComponent]
})
export class DynamicFormTestModule {
    static entry = DynamicFormTestComponent;
}
