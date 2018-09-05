import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription, empty as EmptyObservable, throwError, of } from 'rxjs';
import { tap, map, share, catchError, mergeMap} from 'rxjs/operators';

import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService } from '../numeric-field/data.service';
import { NumericFieldWithRatiosComponent } from 'app/widgets/numeric-field-with-ratios/numeric-field-with-ratios.component';

declare var Plotly: any;

@Component({
    selector: 'wm-numeric-field-with-ratios-widget',
    templateUrl: '../numeric-field-with-ratios/numeric-field-with-ratios.component.html',
    styleUrls: ['../numeric-field-with-ratios/numeric-field-with-ratios.component.css']
})
export class LumiComponent extends NumericFieldWithRatiosComponent {

    // bellow example snippet added to the sources in preset json allows querying without rendering
    //
    // "index": "shelflist",
    // "documentType": "bestlumi",
    // "timestampField": "timestamp",
    // "fields": [],
    // "extraFields": [{"name": "provider"}],
    // "terms": {
    //     "flash_key": "@http://srv-s2d16-21-01.cms:9236-101-"
    // }
}
