import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayLinesBasicXComponent } from './array-lines-basicx.component';
import { DataService } from './data.service';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [DataService],
    declarations: [ArrayLinesBasicXComponent],
    entryComponents: [ArrayLinesBasicXComponent]
})
export class ArrayLinesBasicXModule {
    static entry = ArrayLinesBasicXComponent;
}
