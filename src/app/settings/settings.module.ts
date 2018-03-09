import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { SettingsModalComponent } from './settings-modal/settings-modal.component';
import { TimersComponent } from './settings/timers/timers.component';
import { TestComponent } from './settings/test/test.component';
import { PresetExportComponent } from './settings/preset-export/preset-export.component';
import { PresetImportComponent } from './settings/preset-import/preset-import.component';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        SettingsModalComponent,
        TimersComponent,
        TestComponent,
        PresetExportComponent,
        PresetImportComponent
    ],
    exports: [
        SettingsModalComponent
    ],
    entryComponents: [
        TimersComponent,
        PresetImportComponent,
        PresetExportComponent,
        TestComponent
    ]
})
export class SettingsModule {
}
