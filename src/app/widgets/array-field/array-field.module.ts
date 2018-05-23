import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayFieldComponent } from './array-field.component';
import { SharedModule } from 'app/shared/shared.module';
import { DataService } from '../array-heatmap/data.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [DataService],
    entryComponents: [ArrayFieldComponent],
    declarations: [ArrayFieldComponent]
})
export class ArrayFieldModule {
    static entry = ArrayFieldComponent;
}
