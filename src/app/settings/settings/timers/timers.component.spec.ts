import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimersComponent } from './timers.component';
import { SharedModule} from '../../../shared/shared.module';
import { TimersService } from 'app/core/timers.service';

describe('TimersComponent', () => {
    let component: TimersComponent;
    let fixture: ComponentFixture<TimersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule],
            declarations: [ TimersComponent ],
            providers: [TimersService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TimersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
