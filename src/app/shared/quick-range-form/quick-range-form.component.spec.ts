import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickRangeFormComponent } from './quick-range-form.component';

describe('QuickRangeFormComponent', () => {
  let component: QuickRangeFormComponent;
  let fixture: ComponentFixture<QuickRangeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickRangeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickRangeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
