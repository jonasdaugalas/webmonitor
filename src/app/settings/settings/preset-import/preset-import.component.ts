import {
    Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { SandboxPresetService } from 'app/core/sandbox-preset.service';
import * as JSONEditor from 'jsoneditor';
import { SCHEMA } from './dashboard-preset-schema';


@Component({
    selector: 'app-preset-import',
    templateUrl: './preset-import.component.html',
    styleUrls: ['./preset-import.component.css']
})
export class PresetImportComponent implements OnInit, AfterViewInit {


    @ViewChild('editorContainer') editorContainer: ElementRef;
    editor: JSONEditor;
    showAlert = false;
    alertType = 'alert-danger';
    alertMessage: string;

    constructor(protected sandboxPreset: SandboxPresetService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        console.log(this.editorContainer);
        const options = {
            modes: ['code', 'tree', 'text'],
            schema: SCHEMA
        };
        this.editor = new JSONEditor(this.editorContainer.nativeElement, options);
    }

    importConfig() {
        try {
            const config = this.editor.get();
            this.sandboxPreset.setConfig(config);
            this.alertMessage = 'Successfully imported';
            this.alertType = 'alert-success';
            this.showAlert = true;
        } catch (e){
            this.alertMessage = e;
            this.alertType = 'alert-danger';
            this.showAlert = true;
        }
    }

}
