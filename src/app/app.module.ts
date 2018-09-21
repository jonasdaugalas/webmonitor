import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';

import { SharedModule } from './shared/shared.module';
import { SettingsModule } from './settings/settings.module';
import { AppLocationModule } from './app-location';
import { WidgetsModule } from './widgets/widgets.module';

import { PresetResolveService } from './preset-resolve.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreModule.forRoot(),
        SharedModule,
        SettingsModule,
        WidgetsModule,
        AppLocationModule,
    ],
    declarations: [
        AppComponent,
        HomeComponent,
    ],
    providers: [
        PresetResolveService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
