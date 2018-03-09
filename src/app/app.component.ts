import { Component, OnDestroy } from '@angular/core';
import { EventBusService } from './core/event-bus.service';
import { AppLocationService } from './app-location';
import { ROUTES } from './preset-routes';
import { Subscription } from 'rxjs/Subscription';
import { PresetResolveService } from './preset-resolve.service';

@Component({
    selector: 'webmonitor-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

    presetRoutes = ROUTES;
    currentLocationSubs: Subscription;
    presetConfig: any;
    hideDashboard = false;


    constructor(
        protected eventBus: EventBusService,
        protected locationService: AppLocationService,
        protected presetResolver: PresetResolveService) {

        this.onLocationChange(this.locationService.path());
        this.currentLocationSubs = this.locationService.location$.subscribe(
            this.onLocationChange.bind(this));

    }

    ngOnDestroy() {
        this.currentLocationSubs.unsubscribe();
    }

    onLocationChange(path: string) {
        console.log('onLocationChange', path);
        if (path === '') {
            this.hideDashboard = true;
            return;
        }
        this.hideDashboard = false;
        if (path === '/--sandbox') {
            this.presetConfig = {
                widgets: [{
                    "type": "single",
                    "config": {
                        "container": {
                            "width": 100
                        },
                        "wrapper": {
                            "title": "SANDBOX",
                        }
                    }
                }]
            };
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

    play() {
        const event = {type: 'global_startstop', payload: 'start'};
        this.eventBus.emit(0, event);
    }

    stop() {
        const event = {type: 'global_startstop', payload: 'stop'};
        this.eventBus.emit(0, event);
    }

}
