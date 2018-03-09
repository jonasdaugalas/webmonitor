import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetExportComponent } from './preset-export.component';

describe('PresetExportComponent', () => {
  let component: PresetExportComponent;
  let fixture: ComponentFixture<PresetExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresetExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
