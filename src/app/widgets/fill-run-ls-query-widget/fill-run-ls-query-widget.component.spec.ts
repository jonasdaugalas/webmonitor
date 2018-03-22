import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FillRunLsQueryWidgetComponent } from './fill-run-ls-query-widget.component';

describe('FillRunLsQueryWidgetComponent', () => {
  let component: FillRunLsQueryWidgetComponent;
  let fixture: ComponentFixture<FillRunLsQueryWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FillRunLsQueryWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillRunLsQueryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
