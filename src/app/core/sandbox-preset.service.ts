import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SandboxPresetService {

    config$ = new BehaviorSubject<any>({});
    protected configStr: string;

    constructor() {
        this.setConfig({
            widgets: [{
                type: 'static-label',
                config: {
                    container: {
                        width: 100
                    },
                    widget: {
                        pretext: undefined,
                        maintext: 'SANDBOX',
                        posttext: 'This is sandbox. For importing your own presets.'
                    }
                }
            }]
        });
    }

    getConfig() {
        return JSON.parse(this.configStr);
    }

    setConfig(newConfig) {
        this.configStr = JSON.stringify(newConfig);
        this.config$.next(this.getConfig());
    }
}
