import { NgModule,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { BinaryImagesComponent } from './binary-images.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
    ],
    declarations: [BinaryImagesComponent],
    entryComponents: [BinaryImagesComponent]
})
export class BinaryImagesModule {
    static entry = BinaryImagesComponent;
}
