import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription, empty as EmptyObservable, throwError, of } from 'rxjs';
import { tap, map, share, catchError, mergeMap} from 'rxjs/operators';

import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from '../numeric-field/data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { NumericFieldComponent } from 'app/widgets/numeric-field/numeric-field.component';

declare var Plotly: any;

@Component({
    selector: 'wm-numeric-field-with-ratios-widget',
    templateUrl: './numeric-field-with-ratios.component.html',
    styleUrls: ['./numeric-field-with-ratios.component.css']
})
export class NumericFieldWithRatiosComponent extends NumericFieldComponent
implements OnInit, AfterViewInit {

    constructor(
        protected db: DatabaseService,
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(db, eventBus, dataService);
    }

    ngOnInit() {
        super.ngOnInit();
        const wi = this.config['widget'];
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    setData(newData) {
        console.log('before setData');
        super.setData(newData);
        console.log('after setData');
    }

    updateLive() {
        console.log('before updateLive');
        super.updateLive();
        console.log('after updateLive');
    }

}
