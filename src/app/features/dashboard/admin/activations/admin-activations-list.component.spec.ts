import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { AdminCommerceService } from '../../../../core/services/admin-commerce.service';
import { AdminActivationsListComponent } from './admin-activations-list.component';

describe('AdminActivationsListComponent create request state', () => {
  it('prevents duplicate create while SUBMITTING and keeps Activation.status independent', () => {
    const response = new Subject<never>();
    const commerce = jasmine.createSpyObj<AdminCommerceService>('AdminCommerceService', ['createActivation', 'getActivations']);
    commerce.createActivation.and.returnValue(response);
    commerce.getActivations.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [{ provide: AdminCommerceService, useValue: commerce }],
    });
    const component = TestBed.runInInjectionContext(() => new AdminActivationsListComponent());
    component.openCreateModal();
    component.createForm.patchValue({
      provider: 'MANUAL', productCode: 'EVAAS', buyerEmail: 'ops@example.com',
      organizationName: 'EVAAS Operations', status: 'RECEIVED',
    });

    component.createActivation();
    component.createActivation();

    expect(component.createState()).toBe('SUBMITTING');
    expect(component.createForm.controls.status.value).toBe('RECEIVED');
    expect(commerce.createActivation).toHaveBeenCalledTimes(1);
  });

  it('keeps the modal open with CONFLICT when create is rejected', () => {
    const commerce = jasmine.createSpyObj<AdminCommerceService>('AdminCommerceService', ['createActivation']);
    commerce.createActivation.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    TestBed.configureTestingModule({ providers: [{ provide: AdminCommerceService, useValue: commerce }] });
    const component = TestBed.runInInjectionContext(() => new AdminActivationsListComponent());
    component.openCreateModal();
    component.createForm.patchValue({ provider: 'MANUAL', productCode: 'EVAAS', buyerEmail: 'ops@example.com', organizationName: 'EVAAS Operations' });

    component.createActivation();

    expect(component.createState()).toBe('CONFLICT');
    expect(component.createModalOpen()).toBeTrue();
    expect(component.createError()).toContain('conflicto');
  });
});
