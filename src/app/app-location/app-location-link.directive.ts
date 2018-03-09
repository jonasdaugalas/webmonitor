import { Directive, ElementRef, Input, HostListener, AfterViewInit } from '@angular/core';
import { AppLocationService } from './app-location.service';

@Directive({
    selector: '[locationLink]'
})
export class AppLocationLink implements AfterViewInit {

    @Input('locationLink') url: string;

    constructor(
        private el: ElementRef,
        private locationService: AppLocationService) {
    }

    ngAfterViewInit() {
        this.el.nativeElement['href'] = this.url;
    }

    @HostListener('click', ['$event']) public onClick(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.locationService.go(this.url);
    }
}
