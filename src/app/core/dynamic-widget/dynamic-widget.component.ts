import {
    Component, OnInit, Input, ViewChild, ViewContainerRef,
    SystemJsNgModuleLoader, NgModuleFactory
} from '@angular/core';

const moduleSelector = {
    'single': 'app/widgets/test-widget/test-widget.module#TestWidgetModule',
    'per-channel': 'app/widgets/test-widget/test-widget.module#TestWidgetModule',
    'static-label': 'app/widgets/static-label-widget/static-label-widget.module#StaticLabelWidgetModule',
    'label': 'app/widgets/label-widget/label-widget.module#LabelWidgetModule'
};

@Component({
    selector: 'app-dynamic-widget',
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
        if (!moduleSelector[this.widgetType]) {
            console.error('No such widget.', this.widgetType);
            this.message = 'No such widget: ' + this.widgetType;
            return;
        }
        console.log('dynamic', this.config);
        this.moduleLoader.load(moduleSelector[this.widgetType])
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
