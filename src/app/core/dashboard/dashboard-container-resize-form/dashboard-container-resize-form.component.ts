import {
    Component, OnInit, OnDestroy, Input, Output, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'dashboard-container-resize-form',
    templateUrl: './dashboard-container-resize-form.component.html',
    styleUrls: ['./dashboard-container-resize-form.component.css']
})
export class DashboardContainerResizeFormComponent implements OnInit, OnDestroy {

    ngDestroy$: Subject<void> = new Subject<void>();
    resize$: Subject<{value: number, direction: 'height'|'width'}> = new Subject<null>();
    @Input('width') width: number;
    @Input('height') height: number;
    @Output('dimensionsChange') dimensionsChange: EventEmitter<{width: number, height: number}> = new EventEmitter();

    constructor() { }

    ngOnInit() {
        this.resize$
            .debounceTime(1000)
            .takeUntil(this.ngDestroy$)
            .subscribe(event => {
                if (event.direction === 'height') {
                    this.dimensionsChange.emit({
                        width: this.width,
                        height: event.value
                    });
                } else if (event.direction === 'width') {
                    this.dimensionsChange.emit({
                        width: event.value,
                        height: this.height
                    });
                }
            });
    }

    ngOnDestroy() {
        this.ngDestroy$.next();
        this.ngDestroy$.complete();
    }

}
