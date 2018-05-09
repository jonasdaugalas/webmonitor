import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { ArraySnapshotComponent } from './array-snapshot.component';
import { DataService } from './data.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [DataService],
    entryComponents: [ArraySnapshotComponent],
    declarations: [ArraySnapshotComponent]
})
export class ArraySnapshotModule {
    static entry = ArraySnapshotComponent;
}
