import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayHeatmapComponent } from './array-heatmap.component';
import { DataService } from './data.service';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [DataService],
    declarations: [ArrayHeatmapComponent],
    entryComponents: [ArrayHeatmapComponent]
})
export class ArrayHeatmapModule {
    static entry = ArrayHeatmapComponent;
}
