import { Injectable } from '@angular/core';
import { Subject ,  Observable ,  Subscription } from 'rxjs';
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
