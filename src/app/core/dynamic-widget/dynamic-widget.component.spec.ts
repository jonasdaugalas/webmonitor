import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicWidgetComponent } from './dynamic-widget.component';
import {SystemJsNgModuleLoader} from '@angular/core';

describe('DynamicWidgetComponent', () => {
  let component: DynamicWidgetComponent;
  let fixture: ComponentFixture<DynamicWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [ DynamicWidgetComponent ],
        providers: [SystemJsNgModuleLoader]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
