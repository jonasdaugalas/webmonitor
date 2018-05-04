import { Injectable, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { SubscriptionLike as ISubscription ,  Subject } from 'rxjs';


@Injectable()
export class AppLocationService implements OnDestroy {

    protected locationSubscription: ISubscription;
    protected lastLocationPath: string;
    location$ = new Subject<string>();


    constructor(protected location: Location) {
        this.lastLocationPath = this.location.path();
        this.locationSubscription = this.location.subscribe(
            popState => {this.onLocationChange(popState.url);});
    }

    ngOnDestroy() {
        this.locationSubscription.unsubscribe();
    }

    go(path: string) {
        if (path === this.lastLocationPath) {
            return;
        }
        this.location.go(path);
        this.lastLocationPath = path;
        this.onLocationChange(path);
    }

    getPath() {
        return this.location.path();
    }

    onLocationChange(path: string) {
        this.location$.next(path);
    }
}
