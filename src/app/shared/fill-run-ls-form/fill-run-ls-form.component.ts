import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'wm-fill-run-ls-form',
    templateUrl: './fill-run-ls-form.component.html',
    styleUrls: ['./fill-run-ls-form.component.css']
})
export class FillRunLsFormComponent implements OnInit {

    @Input('fillEnabled') fillEnabled = false;
    @Input('runEnabled') runEnabled = true;
    @Input('lsEnabled') lsEnabled = true;
    @Output('query') onQuery = new EventEmitter();

    fill: number;
    run: number;
    ls: number;

    constructor() { }

    ngOnInit() {
    }

    query() {
        this.onQuery.emit({
            fill: this.fill,
            run: this.run,
            ls: this.ls
        });
    }

}
