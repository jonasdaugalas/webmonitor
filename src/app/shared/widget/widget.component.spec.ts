import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

import { WidgetComponent } from './widget.component';
import {SettingsComponent} from './settings/settings.component';
import { TimersService } from 'app/core/timers.service';
import { EventBusService } from 'app/core/event-bus.service';

describe('WidgetComponent', () => {
    let component: WidgetComponent;
    let fixture: ComponentFixture<WidgetComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ClarityModule, FormsModule],
            declarations: [ WidgetComponent, SettingsComponent ],
            providers: [TimersService, EventBusService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WidgetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
