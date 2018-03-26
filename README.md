## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Implement new widget

Create a directory in `src/app/widgets` for the new widget. Inside the directory place module and component files of the widget. Add widget component to the `entryComponents` in the module `NgModule` decorator. Make the exported module class define static member `entry` and assign the component to it. Example:

```
@NgModule({
    \\...
    declarations: [MyNewWidgetComponent],
    entryComponents: [MyNewWidgetComponent]
})
export class MyNewWidgetModule {
    static entry = MyNewWidgetComponent;
}
```

Modify `src/app/widgets/widgets.module.ts` to include route with `loadChildren` to the new module into `provideRoutes` array (see the file for examples of all the other widgets) in order for the new widget to be compiled by angular-cli.

Add entry to `src/app/widgets/widget-module-selector.ts` so that the new widget would be recognised by dashboards.
