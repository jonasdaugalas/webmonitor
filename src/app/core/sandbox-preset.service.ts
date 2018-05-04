import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SandboxPresetService {

    config$ = new BehaviorSubject<any>({});
    protected configStr = '{}';

    constructor() {
    }

    getConfig() {
        return JSON.parse(this.configStr);
    }

    setConfig(newConfig) {
        this.configStr = JSON.stringify(newConfig);
        this.config$.next(this.getConfig());
    }
}
