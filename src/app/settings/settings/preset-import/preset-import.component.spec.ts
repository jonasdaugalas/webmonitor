import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetImportComponent } from './preset-import.component';

describe('PresetImportComponent', () => {
  let component: PresetImportComponent;
  let fixture: ComponentFixture<PresetImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresetImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
