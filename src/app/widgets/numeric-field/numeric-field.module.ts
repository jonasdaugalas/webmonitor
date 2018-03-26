import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { NumericFieldComponent } from './numeric-field.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [NumericFieldComponent],
    entryComponents: [NumericFieldComponent]
})
export class NumericFieldModule {
    static entry = NumericFieldComponent
}
