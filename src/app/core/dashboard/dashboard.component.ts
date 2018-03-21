import {
    Component, OnInit, HostListener, OnDestroy, AfterViewInit, Input
} from '@angular/core';
import { TimersService } from '../timers.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

    resizeForms = new Set();
    timersConfig: Array<number>;
    widgets: Array<any>;

    protected _config: any;
    @Input('config') set config(newConfig: any) {
        this._config = newConfig;
        this.configChanged();
        console.log(this.widgets);
    }
    get config() {
        return this._config;
    }

    protected _layoutMode = false;
    set layoutMode(newMode) {
        this._layoutMode = newMode;
        this.resizeForms.forEach(f => {
            f.hide();
        })
    }
    get layoutMode() {
        return this._layoutMode;
    }

    dragulaOptions = {
        invalid: function (el, handle) {
            if (handle.id === 'widget-rearrange-handle') {
                return false;
            }
            return true;
        }
    };

    @HostListener('window:keydown.esc', ['$event']) onEscKeyDown(event) {
        this.layoutMode = false;
    }

    constructor(protected timers: TimersService) {
    }

    ngOnInit() {
    }

    configChanged() {
        this.timers.removeAll();
        this.widgets = [];
        if (!this._config) {
            return;
        }
        if (this._config['timers']) {
            for (let interval of this._config['timers']) {
                this.timers.create(interval);
            }
        }
        if (!this._config['widgets']) {
            return;
        }
        for (let widget of this._config['widgets']) {
            this.fixContainerDimensions(widget);
            if (!widget.config.hasOwnProperty('widget')) {
                widget.config['widget'] = {};
            }
            this.widgets.push(widget);
        }
    }

    ngAfterViewInit() {}

    ngOnDestroy() {
    }

    fixContainerDimensions(widget) {
        const defaultContainer = {
            width: 50,
            height: 360
        };
        if (!this.hasProperty(widget, 'config')) {
            widget['config'] = {};
        }
        if (!this.hasProperty(widget['config'], 'container')) {
            widget['config']['container'] = {};
        }
        widget['config']['container'] = Object.assign(
            defaultContainer, widget['config']['container'])
        const cont = widget['config']['container'];
        cont['width'] = typeof cont['width'] === 'number' ? cont['width'] : 50;
        cont['height'] = typeof cont['height'] === 'number' ? cont['height'] : 360;
        cont['width'] = (cont['width'] < 5) ? 5 : cont['width'];
        cont['width'] = cont['width'] > 100 ? 100 : cont['width'];
        cont['height'] = cont['height'] < 40 ? 40 : cont['height'];
    }

    resizeContainer(dimensions, widget) {
        widget['config']['container']['height'] = dimensions.height;
        widget['config']['container']['width'] = dimensions.width;
        this.fixContainerDimensions(widget);
    }

    onResizeFormShow(event) {
        event['popperContent']['popperViewRef']['nativeElement'].style.zIndex = 4;
        this.resizeForms.add(event['popperContent']);
    }

    exportConfig() {
        return {
            timers: this.timers.getTimers().map(t => t.interval),
            widgets: this.widgets
        }
    }

    hasProperty(object, property) {
        return ((typeof object === 'object')
                && (object !== null)
                && object.hasOwnProperty(property));
    }

}
