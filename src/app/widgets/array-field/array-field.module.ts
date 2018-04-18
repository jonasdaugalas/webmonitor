import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayFieldComponent } from './array-field.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    entryComponents: [ArrayFieldComponent],
    declarations: [ArrayFieldComponent]
})
export class ArrayFieldModule {
    static entry = ArrayFieldComponent;
}
