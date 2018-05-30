import {
    Injectable, ViewContainerRef, SystemJsNgModuleLoader, NgModuleFactory,
    NgModuleRef
} from '@angular/core';

import { widgetModuleSelector } from 'app/widgets/widget-module-selector';

@Injectable({providedIn: 'root'})
export class DynamicWidgetService {

    protected registeredModules = {};

    constructor(protected moduleLoader: SystemJsNgModuleLoader) {}

    protected registerModule(path: string, mod: NgModuleRef<any>) {
        if (this.getModule(path)) {
            throw new Error('Module already registered ' + path);
        }
        this.registeredModules[path] = mod;
    }

    protected getModule(path: string) {
        return this.registeredModules[path];
    }

    loadWidget(widget: string, container: ViewContainerRef, config: any) {

        const path = widgetModuleSelector[widget];
        if (!path) {
            console.error('No such widget.', widget);
            return Promise.reject('No such widget: ' + widget);
        }
        return this.moduleLoader.load(path)
            .then((moduleFactory: NgModuleFactory<any>) => {
                const entryComponent = (<any>moduleFactory.moduleType).entry;
                let ngModuleRef = this.getModule(path);
                if (!ngModuleRef) {
                    ngModuleRef = moduleFactory.create(container.parentInjector);
                    this.registerModule(path, ngModuleRef);
                }
                let componentFactory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
                let componentRef = container.createComponent(componentFactory);
                componentRef.instance['config'] = config;
                componentRef.changeDetectorRef.detectChanges();
                componentRef.onDestroy(()=> {
                    componentRef.changeDetectorRef.detach();
                });
                return true;
            });
    }
}
