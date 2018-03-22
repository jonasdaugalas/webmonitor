import { Component, OnInit, Input } from '@angular/core';
import { DatabaseService } from '../../core/database.service';

@Component({
    selector: 'wm-label-widget',
    templateUrl: './label-widget.component.html',
    styleUrls: ['./label-widget.component.css']
})
export class LabelWidgetComponent implements OnInit {

    protected _config: any;
    @Input() set config(newConfig: any) {
        this._config = newConfig;
    }
    get config() {
        return this._config;
    }

    value = undefined;
    queryURL = undefined;
    queryBody = undefined;
    parseValue = undefined;
    info = {
        timestamp: (new Date()).toISOString()
    }

    constructor(protected dbService: DatabaseService) { }

    ngOnInit() {
        if (!this.config.hasOwnProperty('wrapper')) {
            this.config['wrapper'] = {};
        }
        this.config['wrapper'] = Object.assign(this.config['wrapper'], {
            controlsEnabled: true,
            infoEnabled: true,
            startEnabled: true,
            refreshEnabled: true,
            optionsEnabled: true
        });
        this.resolveQuery(this.config['widget']);
        this.setValueParser(this.config['widget']);
        this.refresh();
    }

    resolveQuery(cfg) {
        switch(cfg['aggregation']) {
        case 'count': {
            this.queryURL = cfg.path + '/_count';
            this.queryBody = undefined;
            break;
        }
        case 'avg': {

        }
        case 'newest': {

        }
        default: {

        }
        }
    }

    setValueParser(cfg) {
        switch(cfg['aggregation']) {
        case 'count': {
            this.parseValue = (response) => {
                return response['count']
            };
            break;
        }
        case 'avg': {

        }
        case 'newest': {

        }
        default: {
            this.parseValue = (response) => response;
        }
        }
    }

    refresh() {
        if (!this.queryURL) {
            console.error('Empty query URL.');
        }
        this.dbService.query(this.queryURL, this.queryBody)
            .subscribe(r => this.value = this.parseValue(r));
    }

    onTimerTick() {
        this.info = Object.assign({}, this.info, {
            timestamp: (new Date()).toISOString()
        });
    }

    query(range) {
        console.log(range);
    }

}
