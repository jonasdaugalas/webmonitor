import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsModalComponent } from './settings-modal.component';

import { SharedModule } from '../../shared/shared.module';

import { TimersComponent } from '../settings/timers/timers.component';
import { TestComponent } from '../settings/test/test.component';




describe('SettingsModalComponent', () => {
  let component: SettingsModalComponent;
  let fixture: ComponentFixture<SettingsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [ SharedModule],
        declarations: [ SettingsModalComponent, TimersComponent, TestComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
