import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { NumericFieldComponent } from './numeric-field.component';
import { DataService } from './data.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [NumericFieldComponent],
    providers: [DataService],
    entryComponents: [NumericFieldComponent]
})
export class NumericFieldModule {
    static entry = NumericFieldComponent
}
