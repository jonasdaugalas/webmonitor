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
            { path: '^', loadChildren: 'app/widgets/label-widget/label-widget.module#LabelWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/event-bus-test-widget/event-bus-test-widget.module#EventBusTestWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/numeric-field/numeric-field.module#NumericFieldModule'},
            { path: '^', loadChildren: 'app/widgets/array-snapshot/array-snapshot.module#ArraySnapshotModule'},
            { path: '^', loadChildren: 'app/widgets/array-field/array-lines.module#ArrayLinesModule'},
            { path: '^', loadChildren: 'app/widgets/array-field/array-heatmap.module#ArrayHeatmapModule'},
            { path: '^', loadChildren: 'app/widgets/numeric-field-with-ratios/numeric-field-with-ratios.module#NumericFieldWithRatiosModule'},
            { path: '^', loadChildren: 'app/widgets/lumi/lumi.module#LumiModule'}
        ])
    ]
})
export class WidgetsModule {}
