import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FillRunLsQueryFormComponent } from './fill-run-ls-query-form.component';

describe('FillRunLsQueryFormComponent', () => {
  let component: FillRunLsQueryFormComponent;
  let fixture: ComponentFixture<FillRunLsQueryFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FillRunLsQueryFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillRunLsQueryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
