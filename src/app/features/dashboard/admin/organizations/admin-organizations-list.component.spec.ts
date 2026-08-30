import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminOrganizationsListComponent } from './admin-organizations-list.component';

describe('AdminOrganizationsListComponent create request state', () => {
  it('prevents duplicate create while SUBMITTING and closes only after HTTP success', () => {
    const response = new Subject<{ id: number; name: string }>();
    const access = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', ['createOrganization', 'getOrganizations']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    access.createOrganization.and.returnValue(response);
    access.getOrganizations.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        { provide: AdminAccessService, useValue: access },
        { provide: Router, useValue: router },
      ],
    });
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationsListComponent());
    component.openCreateModal();
    component.createForm.controls.name.setValue('EVAAS Operations');

    component.createOrganization();
    component.createOrganization();

    expect(component.createState()).toBe('SUBMITTING');
    expect(access.createOrganization).toHaveBeenCalledTimes(1);
    expect(component.createModalOpen()).toBeTrue();

    response.next({ id: 7, name: 'EVAAS Operations' });

    expect(component.createState()).toBe('SUCCESS');
    expect(component.createModalOpen()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/admin/organizations', 7]);
  });

  it('keeps the modal open with FORBIDDEN when create is rejected', () => {
    const access = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', ['createOrganization']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    access.createOrganization.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    TestBed.configureTestingModule({ providers: [{ provide: AdminAccessService, useValue: access }, { provide: Router, useValue: router }] });
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationsListComponent());
    component.openCreateModal();
    component.createForm.controls.name.setValue('EVAAS Operations');

    component.createOrganization();

    expect(component.createState()).toBe('FORBIDDEN');
    expect(component.createModalOpen()).toBeTrue();
    expect(component.createError()).toContain('permisos');
  });

  it('requires contextual confirmation before changing Organization status', () => {
    const response = new Subject<{ id: number; name: string; enabled: boolean }>();
    const access = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', ['updateOrganizationStatus']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    access.updateOrganizationStatus.and.returnValue(response);
    TestBed.configureTestingModule({ providers: [{ provide: AdminAccessService, useValue: access }, { provide: Router, useValue: router }] });
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationsListComponent());
    const organization = { id: 7, name: 'EVAAS Operations', enabled: true };
    component.organizations.set([organization]);

    component.updateOrganizationStatus(organization, false);
    expect(component.statusConfirmation()?.organization.name).toBe('EVAAS Operations');
    expect(access.updateOrganizationStatus).not.toHaveBeenCalled();

    component.cancelOrganizationStatusChange();
    expect(component.statusConfirmation()).toBeNull();
    expect(access.updateOrganizationStatus).not.toHaveBeenCalled();

    component.updateOrganizationStatus(organization, false);
    component.confirmOrganizationStatusChange();
    component.confirmOrganizationStatusChange();
    expect(component.statusRequestState()).toBe('SUBMITTING');
    expect(access.updateOrganizationStatus).toHaveBeenCalledOnceWith(7, false);

    response.next({ ...organization, enabled: false });
    expect(component.organizations()[0].enabled).toBeFalse();
    expect(component.statusSuccess()).toContain('deshabilitada');
  });

  it('does not update Organization state falsely when the confirmed PATCH fails', () => {
    const access = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', ['updateOrganizationStatus']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    access.updateOrganizationStatus.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    TestBed.configureTestingModule({ providers: [{ provide: AdminAccessService, useValue: access }, { provide: Router, useValue: router }] });
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationsListComponent());
    const organization = { id: 7, name: 'EVAAS Operations', enabled: true };
    component.organizations.set([organization]);

    component.updateOrganizationStatus(organization, false);
    component.confirmOrganizationStatusChange();

    expect(component.statusRequestState()).toBe('CONFLICT');
    expect(component.organizations()[0].enabled).toBeTrue();
    expect(component.statusSuccess()).toBeNull();
  });
});
