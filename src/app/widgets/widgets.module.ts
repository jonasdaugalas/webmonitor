import { NgModule } from '@angular/core';
import { provideRoutes } from '@angular/router';

@NgModule({
    imports: [],
    providers: [
        //provideRoutes: for making angular-cli compile lazy loading modules
        provideRoutes([
            { path: '^', loadChildren: 'app/widgets/test-widget/test-widget.module#TestWidgetModule'},
            { path: '^', loadChildren: 'app/widgets/label-widget/label-widget.module#LabelWidgetModule'}
        ])
    ]
})
export class WidgetsModule {}
