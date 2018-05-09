import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArraySnapshotComponent } from './array-snapshot.component';

describe('ArraySnapshotComponent', () => {
  let component: ArraySnapshotComponent;
  let fixture: ComponentFixture<ArraySnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArraySnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArraySnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
