import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectsGridComponent } from './objects-grid.component';

describe('ObjectsGridComponent', () => {
  let component: ObjectsGridComponent;
  let fixture: ComponentFixture<ObjectsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
