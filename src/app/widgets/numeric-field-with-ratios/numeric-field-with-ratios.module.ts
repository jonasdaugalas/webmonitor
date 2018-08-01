import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { NumericFieldWithRatiosComponent } from './numeric-field-with-ratios.component';
import { DataService } from '../numeric-field/data.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [NumericFieldWithRatiosComponent],
    providers: [DataService],
    entryComponents: [NumericFieldWithRatiosComponent]
})
export class NumericFieldWithRatiosModule {
    static entry = NumericFieldWithRatiosComponent
}
