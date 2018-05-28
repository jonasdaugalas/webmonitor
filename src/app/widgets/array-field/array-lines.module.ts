import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayLinesComponent } from './array-lines.component';
import { DataService } from './data.service';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [DataService],
    declarations: [ArrayLinesComponent],
    entryComponents: [ArrayLinesComponent]
})
export class ArrayLinesModule {
    static entry = ArrayLinesComponent;
}
