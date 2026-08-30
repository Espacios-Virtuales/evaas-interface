import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminToolAccessCreateModalComponent } from './admin-tool-access-create-modal.component';

describe('AdminToolAccessCreateModalComponent', () => {
  let component: AdminToolAccessCreateModalComponent;
  let fixture: ComponentFixture<AdminToolAccessCreateModalComponent>;
  let service: jasmine.SpyObj<AdminAccessService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<AdminAccessService>('AdminAccessService', ['createToolAccess', 'findUserByEmail']);
    await TestBed.configureTestingModule({
      imports: [AdminToolAccessCreateModalComponent],
      providers: [{ provide: AdminAccessService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminToolAccessCreateModalComponent);
    component = fixture.componentInstance;
    component.organizationId = 7;
    component.organizationName = 'EVAAS Operations';
  });

  it('preserves the ToolAccess legacy payload and emits success', () => {
    service.createToolAccess.and.returnValue(of({
      id: 30, organizationId: 7, organizationName: 'EVAAS Operations', toolKey: 'EVAAS_WORKFLOW',
      status: 'ENABLED', grantedAt: '2026-01-01',
    }));
    const created = spyOn(component.created, 'emit');
    component.toolKey = 'EVAAS_WORKFLOW';
    component.externalCommerceActivationId = '24';
    component.selectedUser.set({ id: 12, email: 'ops@example.com' });

    component.submit();

    expect(service.createToolAccess).toHaveBeenCalledWith({
      organizationId: 7, toolKey: 'EVAAS_WORKFLOW', userId: 12, externalCommerceActivationId: 24,
    });
    expect(created).toHaveBeenCalled();
  });

  it('does not emit success when the legacy request fails', () => {
    service.createToolAccess.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    const created = spyOn(component.created, 'emit');
    component.toolKey = 'EVAAS_WORKFLOW';
    component.selectedUser.set({ id: 12, email: 'ops@example.com' });

    component.submit();

    expect(created).not.toHaveBeenCalled();
    expect(component.error()).toContain('permisos');
    expect(component.submitting()).toBeFalse();
  });
});
