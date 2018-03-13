import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticLabelWidgetComponent } from './static-label-widget.component';

describe('StaticLabelWidgetComponent', () => {
  let component: StaticLabelWidgetComponent;
  let fixture: ComponentFixture<StaticLabelWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticLabelWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticLabelWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
