import { NgModule } from '@angular/core';
import { provideRoutes } from '@angular/router';

@NgModule({
    imports: [],
    providers: [
        //provideRoutes: for making angular-cli compile lazy loading modules
        provideRoutes([
            { path: '^', loadChildren: 'app/widgets/static-label-widget/static-label-widget.module#StaticLabelWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/time-query-widget/time-query-widget.module#TimeQueryWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/fill-run-ls-query-widget/fill-run-ls-query-widget.module#FillRunLsQueryWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/test-widget/test-widget.module#TestWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/label-widget/label-widget.module#LabelWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/event-bus-test-widget/event-bus-test-widget.module#EventBusTestWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/numeric-field/numeric-field.module#NumericFieldModule'},
        ])
    ]
})
export class WidgetsModule {}
