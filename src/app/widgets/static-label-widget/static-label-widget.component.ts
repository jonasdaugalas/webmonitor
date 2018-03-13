import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'wm-static-label-widget',
    templateUrl: './static-label-widget.component.html',
    styleUrls: ['./static-label-widget.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticLabelWidgetComponent implements OnInit {

    @Input('config') config: any;

    pretext = undefined;
    maintext = undefined;
    posttext = undefined;

    constructor() { }

    ngOnInit() {
        console.log(this.config);
        if (this.config && this.config.hasOwnProperty('widget')) {
            this.pretext = this.config['widget']['pretext'];
            this.maintext = this.config['widget']['maintext'];
            this.posttext = this.config['widget']['posttext'];
        }
    }

}
