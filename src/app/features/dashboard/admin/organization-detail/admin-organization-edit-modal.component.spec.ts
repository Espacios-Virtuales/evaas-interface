import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminOrganizationEditModalComponent } from './admin-organization-edit-modal.component';

describe('AdminOrganizationEditModalComponent', () => {
  let access: jasmine.SpyObj<AdminAccessService>;

  beforeEach(() => {
    access = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', ['updateOrganization']);
    TestBed.configureTestingModule({ providers: [{ provide: AdminAccessService, useValue: access }] });
  });

  function createComponent(): AdminOrganizationEditModalComponent {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationEditModalComponent());
    component.organization = {
      id: 7,
      name: 'Espacios Virtuales',
      taxId: '76.000.000-0',
      logoUrl: 'https://example.com/logo.svg',
      brandColor: '#154360',
      ownerUserId: 12,
      ownerEmail: 'owner@example.com',
      enabled: true,
    };
    return component;
  }

  it('opens with the current Organization profile values', () => {
    const component = createComponent();

    expect(component.form).toEqual({
      name: 'Espacios Virtuales',
      taxId: '76.000.000-0',
      logoUrl: 'https://example.com/logo.svg',
      brandColor: '#154360',
    });
  });

  it('requires a name', () => {
    const component = createComponent();
    component.form.name = '  ';

    component.submit();

    expect(access.updateOrganization).not.toHaveBeenCalled();
    expect(component.requestState()).toBe('VALIDATION_ERROR');
    expect(component.validation()).toContain('requerido');
  });

  it('sends empty optional values as null and never includes owner or enabled', () => {
    const component = createComponent();
    component.form = { name: ' Espacios Virtuales ', taxId: ' ', logoUrl: '', brandColor: '  ' };
    access.updateOrganization.and.returnValue(of({ id: 7, name: 'Espacios Virtuales', enabled: true }));

    component.submit();

    expect(access.updateOrganization).toHaveBeenCalledWith(7, {
      name: 'Espacios Virtuales', taxId: null, logoUrl: null, brandColor: null,
    });
  });

  it('emits the backend response and transitions to SUCCESS', () => {
    const component = createComponent();
    const response = {
      id: 7, name: 'Espacios Virtuales actualizados', taxId: null, logoUrl: null,
      brandColor: '#112233', ownerUserId: 12, enabled: true,
    };
    const updated = jasmine.createSpy('updated');
    component.updated.subscribe(updated);
    access.updateOrganization.and.returnValue(of(response));

    component.submit();

    expect(component.requestState()).toBe('SUCCESS');
    expect(updated).toHaveBeenCalledOnceWith(response);
  });

  it('prevents a double submission while SUBMITTING', () => {
    const component = createComponent();
    const response = new Subject<{ id: number; name: string; enabled: boolean }>();
    access.updateOrganization.and.returnValue(response);

    component.submit();
    component.submit();

    expect(component.requestState()).toBe('SUBMITTING');
    expect(access.updateOrganization).toHaveBeenCalledTimes(1);
  });

  it('maps invalid data errors', () => {
    const component = createComponent();
    access.updateOrganization.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400 })));

    component.submit();

    expect(component.requestState()).toBe('ERROR');
    expect(component.error()).toContain('no son válidos');
  });

  ([
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
  ] as const).forEach(([status, state]) => {
    it(`maps ${status} update errors to ${state}`, () => {
      const component = createComponent();
      access.updateOrganization.and.returnValue(throwError(() => new HttpErrorResponse({ status })));

      component.submit();

      expect(component.requestState()).toBe(state);
      expect(component.error()).toBeTruthy();
    });
  });
});
