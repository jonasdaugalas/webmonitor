import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'wm-quick-range-form',
    templateUrl: './quick-range-form.component.html',
    styleUrls: ['./quick-range-form.component.css']
})
export class QuickRangeFormComponent implements OnInit {

    ranges = [
        'today',
        'yesterday',
        'this-week',
        'last-hous',
        'last-days'
    ];
    constructor() { }

    ngOnInit() {
    }

}
