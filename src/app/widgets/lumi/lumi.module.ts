import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { LumiComponent } from './lumi.component';
import { DataService } from '../numeric-field/data.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [LumiComponent],
    providers: [DataService],
    entryComponents: [LumiComponent]
})
export class LumiModule {
    static entry = LumiComponent
}
