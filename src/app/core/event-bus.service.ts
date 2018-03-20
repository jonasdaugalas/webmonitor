import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

export class Event {
    constructor(public type: string, public payload: any) {}
}

class ChanneledEvent {
    constructor(public channel: number, public event: Event) {}
}

@Injectable()
export class EventBusService {

    events$ = new Subject<ChanneledEvent>();

    constructor() {

    }

    getEvents(channel: number, filter?: string) {
        let filtered =  this.events$
            .filter(x => x.channel === channel);
        if (filter) {
            filtered = filtered.filter(x => x.event.type === filter);
        }
        return filtered.map(x => x.event);
    }

    subscribe(channel: number, filter: string|undefined): Subscription {
        return this.getEvents(channel, filter).subscribe();
    }

    emit(channel: number, event: Event) {
        if (!Number.isInteger(channel)) {
            return;
        }
        this.events$.next({channel: channel, event: event});
    }

    reset() {
        this.events$.complete();
        this.events$ = new Subject<ChanneledEvent>();
    }

}
