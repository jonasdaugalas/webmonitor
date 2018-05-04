import { Component, OnDestroy } from '@angular/core';
import { EventBusService } from './core/event-bus.service';
import { AppLocationService } from './app-location';
import { ROUTES, SANDBOX_PATH } from './preset-routes';
import { Subscription } from 'rxjs';
import { PresetResolveService } from './preset-resolve.service';
import { SandboxPresetService } from 'app/core/sandbox-preset.service';
import * as APP_CONFIG from './config';


@Component({
    selector: 'webmonitor-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

    sandboxPath = SANDBOX_PATH;
    presetRoutes = ROUTES;
    presetConfig: any;
    hideDashboard = false;
    protected currentLocationSubs: Subscription;
    protected sandboxConfigSubs: Subscription;

    constructor(
        protected sandboxPreset: SandboxPresetService,
        protected eventBus: EventBusService,
        protected locationService: AppLocationService,
        protected presetResolver: PresetResolveService) {

        this.onLocationChange(this.locationService.getPath());
        this.currentLocationSubs = this.locationService.location$.subscribe(
            this.onLocationChange.bind(this));
        this.sandboxConfigSubs = this.sandboxPreset.config$.subscribe(
            this.onSandboxPresetChange.bind(this));
        this.sandboxPreset.setConfig(APP_CONFIG.initialSandboxPreset);
    }

    ngOnDestroy() {
        this.currentLocationSubs.unsubscribe();
        this.sandboxConfigSubs.unsubscribe();
    }

    onLocationChange(path: string) {
        if (path === '') {
            this.hideDashboard = true;
            return;
        }
        this.hideDashboard = false;

        if (path === SANDBOX_PATH) {
            this.presetConfig = this.sandboxPreset.getConfig();
            return;
        }

        const route = this.presetRoutes.find(el => el.path === path);
        if (!route) {
            this.presetConfig = null;
            return;
        }
        this.presetResolver.resolve(route.config_url).subscribe(
            val => {
                this.presetConfig = val;
            },
            err => {
                this.presetConfig = null;
            });
    }

    onSandboxPresetChange(newConfig) {
        if (this.locationService.getPath() === SANDBOX_PATH) {
            this.presetConfig = this.sandboxPreset.getConfig();
        }
    }

    play() {
        const event = {type: 'global_startstop', payload: 'start'};
        this.eventBus.emit(0, event);
    }

    stop() {
        const event = {type: 'global_startstop', payload: 'stop'};
        this.eventBus.emit(0, event);
    }

}
