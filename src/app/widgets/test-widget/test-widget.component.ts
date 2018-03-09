import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-test-widget',
    templateUrl: './test-widget.component.html',
    styleUrls: ['./test-widget.component.css']
})
export class TestWidgetComponent implements OnInit {

    protected _config: any;
    @Input() set config(newConfig: any) {
        console.log('setting new config', newConfig);
        this._config = newConfig;
    }
    get config() {
        return this._config;
    }

    constructor() { }

    ngOnInit() {
        this.config['wrapper'] = Object.assign(this.config['wrapper'], {
            controlsEnabled: true,
            infoEnabled: true,
            startEnabled: false,
            refreshEnabled: true,
            optionsEnabled: true
        });
    }

}
