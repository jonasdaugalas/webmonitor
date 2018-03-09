import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Location, LocationStrategy, PathLocationStrategy} from '@angular/common';

import { AppLocationService } from './app-location.service';
import { AppLocationLink } from './app-location-link.directive';

@NgModule({
    imports: [
        SharedModule
    ],
    providers: [
        [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
        AppLocationService,
    ],
    declarations: [
        AppLocationLink
    ],
    exports: [
        AppLocationLink
    ]
})
export class AppLocationModule { }
