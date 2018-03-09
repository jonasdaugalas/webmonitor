import {
    Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { DashboardComponent } from 'app/core/dashboard/dashboard.component';
import * as JSONEditor from 'jsoneditor';

@Component({
    selector: 'app-preset-export',
    templateUrl: './preset-export.component.html',
    styleUrls: ['./preset-export.component.css']
})
export class PresetExportComponent implements OnInit, AfterViewInit {

    @Input('dashboard') dashboard: DashboardComponent;
    @ViewChild('editorContainer') editorContainer: ElementRef;
    editor: JSONEditor;

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        console.log(this.editorContainer);
        const options = {
            onEditable: () => false,
            modes: ['text', 'code', 'view']

        };
        this.editor = new JSONEditor(this.editorContainer.nativeElement, options);
    }

    exportDashboard() {
        if (this.dashboard) {
            this.editor.set(this.dashboard.config);
        } else {
            this.editor.set({});
        }
    }

}
