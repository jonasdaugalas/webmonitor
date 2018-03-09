import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule} from '@angular/forms';

import { DashboardContainerResizeFormComponent } from './dashboard-container-resize-form.component';

describe('DashboardContainerResizeFormComponent', () => {
  let component: DashboardContainerResizeFormComponent;
  let fixture: ComponentFixture<DashboardContainerResizeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [ DashboardContainerResizeFormComponent ],
        imports: [FormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardContainerResizeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
