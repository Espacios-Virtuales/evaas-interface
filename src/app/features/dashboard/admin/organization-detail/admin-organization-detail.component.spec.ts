import { convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminOrganizationDetailComponent } from './admin-organization-detail.component';

describe('AdminOrganizationDetailComponent request refreshes', () => {
  let access: jasmine.SpyObj<AdminAccessService>;

  beforeEach(() => {
    access = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', [
      'getOrganizationById', 'getOrganizationToolAccess', 'getOrganizationResources', 'disableToolAccess',
    ]);
    access.getOrganizationById.and.returnValue(of({ id: 7, name: 'EVAAS Operations' }));
    access.getOrganizationToolAccess.and.returnValue(of([]));
    access.getOrganizationResources.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        { provide: AdminAccessService, useValue: access },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '7' })) } },
      ],
    });
  });

  it('refreshes only resources after the resource modal reports success', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    access.getOrganizationResources.calls.reset();
    access.getOrganizationResources.and.returnValue(of([{ id: 99, name: 'Gateway' }]));

    component.onResourceCreated();

    expect(access.getOrganizationResources).toHaveBeenCalledWith(7);
    expect(component.resources()).toEqual([{ id: 99, name: 'Gateway' }]);
    expect(component.resourceCreateSuccess()).toBe('Recurso creado correctamente.');
  });

  it('refreshes only ToolAccess after the ToolAccess modal reports success', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    access.getOrganizationToolAccess.calls.reset();
    access.getOrganizationToolAccess.and.returnValue(of([{ id: 30, toolKey: 'EVAAS_WORKFLOW', organizationId: 7, organizationName: 'EVAAS Operations', status: 'ENABLED', grantedAt: '2026-01-01' }]));

    component.onToolAccessCreated();

    expect(access.getOrganizationToolAccess).toHaveBeenCalledWith(7);
    expect(component.toolAccess()).toHaveSize(1);
    expect(component.assignmentSuccess()).toBe('Acceso asignado correctamente.');
  });

  it('requires confirmation before disabling ToolAccess and refreshes only ToolAccess on success', () => {
    const response = new Subject<void>();
    access.disableToolAccess.and.returnValue(response);
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    const toolAccess = { id: 30, toolKey: 'EVAAS_WORKFLOW', organizationId: 7, organizationName: 'EVAAS Operations', status: 'ENABLED', grantedAt: '2026-01-01' };
    component.toolAccess.set([toolAccess]);

    component.requestToolAccessDisable(toolAccess);
    expect(component.toolAccessDisableConfirmation()?.id).toBe(30);
    expect(access.disableToolAccess).not.toHaveBeenCalled();

    component.cancelToolAccessDisable();
    expect(access.disableToolAccess).not.toHaveBeenCalled();

    component.requestToolAccessDisable(toolAccess);
    component.confirmToolAccessDisable();
    component.confirmToolAccessDisable();
    expect(component.disableRequestState()).toBe('SUBMITTING');
    expect(access.disableToolAccess).toHaveBeenCalledOnceWith(30);

    access.getOrganizationToolAccess.and.returnValue(of([]));
    response.next();
    expect(component.toolAccess()).toEqual([]);
    expect(component.disableToolAccessSuccess()).toContain('deshabilitado');
  });

  it('keeps ToolAccess visible and reports error when confirmed disable fails', () => {
    access.disableToolAccess.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    const toolAccess = { id: 30, toolKey: 'EVAAS_WORKFLOW', organizationId: 7, organizationName: 'EVAAS Operations', status: 'ENABLED', grantedAt: '2026-01-01' };
    component.toolAccess.set([toolAccess]);

    component.requestToolAccessDisable(toolAccess);
    component.confirmToolAccessDisable();

    expect(component.disableRequestState()).toBe('FORBIDDEN');
    expect(component.toolAccess()).toEqual([toolAccess]);
    expect(component.disableToolAccessSuccess()).toBeNull();
  });
});
