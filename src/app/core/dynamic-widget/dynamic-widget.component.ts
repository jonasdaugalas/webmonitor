import {
    Component, OnInit, Input, ViewChild, ViewContainerRef,
    SystemJsNgModuleLoader, NgModuleFactory, getModuleFactory
} from '@angular/core';

import { DynamicWidgetService } from './dynamic-widget.service';

@Component({
    selector: 'wm-dynamic-widget',
    templateUrl: './dynamic-widget.component.html',
    styleUrls: ['./dynamic-widget.component.css']
})
export class DynamicWidgetComponent implements OnInit {

    @ViewChild('content', {read: ViewContainerRef}) content: ViewContainerRef;
    loaded = false;
    message = '';
    @Input('type') widgetType: string;
    @Input('config') config: any;

    constructor(protected dynamicWidgets: DynamicWidgetService) {}

    ngOnInit() {
        this.load();
    }

    load() {
        this.dynamicWidgets.loadWidget(this.widgetType, this.content, this.config)
            .then(loaded => this.loaded = loaded,
                  err => {
                      this.message = err;
                      this.content.remove();
                  });
    }

}
