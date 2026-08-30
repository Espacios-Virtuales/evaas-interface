import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmationModalComponent] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    component.title = 'Deshabilitar acceso';
    component.message = 'Esta acción deshabilitará el acceso legacy.';
    component.contextLabel = 'Organization';
    component.contextValue = 'EVAAS Operations';
    component.confirmLabel = 'Deshabilitar';
    fixture.detectChanges();
  });

  it('renders contextual content and emits cancel or confirm explicitly', () => {
    const cancelled = spyOn(component.cancelled, 'emit');
    const confirmed = spyOn(component.confirmed, 'emit');
    expect(fixture.nativeElement.textContent).toContain('EVAAS Operations');
    expect(fixture.nativeElement.textContent).toContain('Deshabilitar acceso');

    fixture.nativeElement.querySelector('.confirmation-modal__cancel').click();
    fixture.nativeElement.querySelector('.confirmation-modal__confirm').click();

    expect(cancelled).toHaveBeenCalled();
    expect(confirmed).toHaveBeenCalled();
  });
});
