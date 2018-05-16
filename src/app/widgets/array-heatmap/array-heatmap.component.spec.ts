import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayHeatmapComponent } from './array-heatmap.component';

describe('ArrayHeatmapComponent', () => {
  let component: ArrayHeatmapComponent;
  let fixture: ComponentFixture<ArrayHeatmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArrayHeatmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrayHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
