import { convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminCommunicationActionService } from '../../../../core/services/admin-communication-action.service';
import { AdminOrganizationDetailComponent } from './admin-organization-detail.component';

describe('AdminOrganizationDetailComponent request refreshes', () => {
  let access: jasmine.SpyObj<AdminAccessService>;
  let communicationActions: jasmine.SpyObj<AdminCommunicationActionService>;

  beforeEach(() => {
    access = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', [
      'getOrganizationById', 'getOrganizationMembers', 'getOrganizationToolAccess', 'getOrganizationResources', 'disableToolAccess',
      'updateOrganizationMemberStatus',
    ]);
    access.getOrganizationById.and.returnValue(of({ id: 7, name: 'EVAAS Operations', enabled: true }));
    access.getOrganizationMembers.and.returnValue(of([]));
    access.getOrganizationToolAccess.and.returnValue(of([]));
    access.getOrganizationResources.and.returnValue(of([]));
    communicationActions = jasmine.createSpyObj<AdminCommunicationActionService>(
      'AdminCommunicationActionService',
      ['getCommunicationActions'],
    );
    communicationActions.getCommunicationActions.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        { provide: AdminAccessService, useValue: access },
        { provide: AdminCommunicationActionService, useValue: communicationActions },
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

  it('projects Organization branding without mixing the owner with members', () => {
    access.getOrganizationById.and.returnValue(of({
      id: 7,
      name: 'Espacios Virtuales',
      enabled: true,
      ownerEmail: 'owner@example.com',
      ownerUserId: 12,
      logoUrl: 'https://example.com/logo.svg',
      brandColor: '#154360',
    }));
    access.getOrganizationMembers.and.returnValue(of([
      { canonicalId: 'member-1', userId: 24, userEmail: 'member@example.com', role: 'MEMBER', status: 'ACTIVE' },
    ]));

    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(component.branding()).toEqual({
      logoUrl: 'https://example.com/logo.svg', brandColor: '#154360', configured: true,
    });
    expect(component.ownershipFields()).toEqual([
      { label: 'Email del responsable (owner)', value: 'owner@example.com' },
      { label: 'ID de usuario responsable (owner)', value: 12 },
    ]);
    expect(component.members()).toEqual([
      { canonicalId: 'member-1', userId: 24, userEmail: 'member@example.com', role: 'MEMBER', status: 'ACTIVE' },
    ]);
    expect(component.membersState()).toBe('READY');
  });

  it('marks branding as not configured when logoUrl and brandColor are null', () => {
    access.getOrganizationById.and.returnValue(of({
      id: 7, name: 'Espacios Virtuales', enabled: true, logoUrl: null, brandColor: null,
    }));

    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(component.branding()).toEqual({ logoUrl: null, brandColor: null, configured: false });
  });

  it('replaces Organization only with the update response without changing related collections', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    component.members.set([{ canonicalId: 'member-1', userId: 24, userEmail: 'member@example.com', role: 'MEMBER', status: 'ACTIVE' }]);
    component.resources.set([{ id: 99, name: 'Gateway' }]);
    const response = { id: 7, name: 'Espacios Virtuales', taxId: null, logoUrl: null, brandColor: null, enabled: true };

    component.openOrganizationEditModal();
    component.onOrganizationUpdated(response);

    expect(component.organization()).toEqual(response);
    expect(component.organizationEditModalOpen()).toBeFalse();
    expect(component.organizationEditSuccess()).toContain('actualizada');
    expect(component.members()).toHaveSize(1);
    expect(component.resources()).toHaveSize(1);
  });

  it('loads members by organization and marks an empty 200 response as EMPTY', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(access.getOrganizationMembers).toHaveBeenCalledWith(7);
    expect(component.members()).toEqual([]);
    expect(component.membersState()).toBe('EMPTY');
  });

  it('refreshes memberships after an owner transfer without changing unrelated collections', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    component.resources.set([{ id: 99, name: 'Gateway' }]);
    access.getOrganizationMembers.and.returnValue(of([
      { canonicalId: 'owner-uuid', userId: 203, userEmail: 'new-owner@example.com', role: 'OWNER', status: 'ACTIVE' },
    ]));
    const response = { id: 7, name: 'EVAAS Operations', enabled: true, ownerUserId: 203, ownerEmail: 'new-owner@example.com' };

    component.onOwnerTransferred(response);

    expect(component.organization()).toEqual(response);
    expect(access.getOrganizationMembers).toHaveBeenCalledWith(7);
    expect(component.members()[0].canonicalId).toBe('owner-uuid');
    expect(component.resources()).toEqual([{ id: 99, name: 'Gateway' }]);
  });

  it('uses canonicalId UUID for member lifecycle and keeps OWNER protected', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    const member = { canonicalId: '7c6954ce-d581-4f56-8f24-49a1c56ef941', userId: 24, userEmail: 'member@example.com', role: 'MEMBER' as const, status: 'ACTIVE' as const };
    const owner = { canonicalId: 'owner-uuid', userId: 12, userEmail: 'owner@example.com', role: 'OWNER' as const, status: 'ACTIVE' as const };
    access.updateOrganizationMemberStatus.and.returnValue(of({ ...member, status: 'SUSPENDED' as const }));
    access.getOrganizationMembers.and.returnValue(of([{ ...member, status: 'SUSPENDED' as const }, owner]));

    component.requestMemberStatus(member, 'SUSPENDED');
    component.requestMemberStatus(owner, 'SUSPENDED');

    expect(access.updateOrganizationMemberStatus).toHaveBeenCalledOnceWith(7, member.canonicalId, { status: 'SUSPENDED' });
    expect(component.members()).toContain(owner);
  });

  it('requires confirmation before revoking a member and does not clear memberships on failure', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();
    const member = { canonicalId: 'member-uuid', userId: 24, userEmail: 'member@example.com', role: 'MEMBER' as const, status: 'ACTIVE' as const };
    component.members.set([member]);
    access.updateOrganizationMemberStatus.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));

    component.requestMemberStatus(member, 'REVOKED');
    expect(access.updateOrganizationMemberStatus).not.toHaveBeenCalled();
    component.confirmMemberStatus();

    expect(access.updateOrganizationMemberStatus).toHaveBeenCalledWith(7, 'member-uuid', { status: 'REVOKED' });
    expect(component.members()).toEqual([member]);
    expect(component.memberStatusError()).toContain('conflicto');
  });

  it('keeps members in LOADING while their response is pending', () => {
    const response = new Subject<[]>();
    access.getOrganizationMembers.and.returnValue(response);

    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(component.membersState()).toBe('LOADING');
    response.next([]);
    response.complete();
  });

  it('marks members as ERROR when their request fails without discarding Organization', () => {
    access.getOrganizationMembers.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(component.organization()?.name).toBe('EVAAS Operations');
    expect(component.members()).toEqual([]);
    expect(component.membersState()).toBe('ERROR');
    expect(component.membersError()).toContain('miembros');
  });

  it('maps a 200 empty communication collection to EMPTY', () => {
    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(communicationActions.getCommunicationActions).toHaveBeenCalled();
    expect(component.communicationActions()).toEqual([]);
    expect(component.communicationActionsState()).toBe('EMPTY');
  });

  it('shows only communication evidence whose DTO organizationId matches the current Organization', () => {
    communicationActions.getCommunicationActions.and.returnValue(of([
      { id: 1, organizationId: 7, operation: 'NOTIFY', channel: 'EMAIL', status: 'SENT', requestId: 'request-7' },
      { id: 2, organizationId: 8, operation: 'NOTIFY', channel: 'EMAIL', status: 'SENT', requestId: 'request-8' },
    ]));

    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(component.communicationActions()).toEqual([
      { id: 1, organizationId: 7, operation: 'NOTIFY', channel: 'EMAIL', status: 'SENT', requestId: 'request-7' },
    ]);
    expect(component.communicationActionsState()).toBe('READY');
  });

  it('keeps communication evidence in LOADING while its response is pending', () => {
    const response = new Subject<[]>();
    communicationActions.getCommunicationActions.and.returnValue(response);

    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(component.communicationActionsState()).toBe('LOADING');
    response.next([]);
    response.complete();
  });

  it('keeps Organization, Members and Resources available when communication evidence fails', () => {
    access.getOrganizationMembers.and.returnValue(of([
      { canonicalId: 'member-1', userId: 2, userEmail: 'member@example.com', role: 'MEMBER', status: 'ACTIVE' },
    ]));
    access.getOrganizationResources.and.returnValue(of([{ id: 99, name: 'Gateway', provider: 'DigitalOcean' }]));
    communicationActions.getCommunicationActions.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    const component = TestBed.runInInjectionContext(() => new AdminOrganizationDetailComponent());
    component.ngOnInit();

    expect(component.organization()?.name).toBe('EVAAS Operations');
    expect(component.membersState()).toBe('READY');
    expect(component.resourcesState()).toBe('POPULATED');
    expect(component.communicationActionsState()).toBe('ERROR');
  });
});
