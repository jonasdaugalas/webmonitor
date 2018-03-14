import {
    Component, OnInit, Input, ViewChild, ViewContainerRef,
    SystemJsNgModuleLoader, NgModuleFactory
} from '@angular/core';

import { widgetModuleSelector } from 'app/widgets/widget-module-selector';

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

    constructor(protected moduleLoader: SystemJsNgModuleLoader) { }

    ngOnInit() {
        this.load();
    }

    load() {
        if (!widgetModuleSelector[this.widgetType]) {
            console.error('No such widget.', this.widgetType);
            this.message = 'No such widget: ' + this.widgetType;
            return;
        }
        this.moduleLoader.load(widgetModuleSelector[this.widgetType])
            .then((moduleFactory: NgModuleFactory<any>) => {
                const entryComponent = (<any>moduleFactory.moduleType).entry;
                const ngModuleRef = moduleFactory.create(this.content.parentInjector);
                let componentFactory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
                let componentRef = this.content.createComponent(componentFactory);
                componentRef.instance['config'] = this.config;
                componentRef.changeDetectorRef.detectChanges();
                componentRef.onDestroy(()=> {
                    componentRef.changeDetectorRef.detach();
                });
                this.loaded = true;
            });
    }

}
