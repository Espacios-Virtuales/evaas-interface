import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { AdminResourcesListComponent } from './admin-resources-list.component';

describe('AdminResourcesListComponent', () => {
  it('projects provider and does not create metadata fields absent from the GET contract', () => {
    const resources = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['getResources', 'getResourceById']);
    resources.getResources.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [{ provide: AdminResourceService, useValue: resources }] });

    const component = TestBed.runInInjectionContext(() => new AdminResourcesListComponent());
    const resource = {
      id: 7,
      organizationId: 3,
      name: 'Gateway',
      key: 'GATEWAY',
      type: 'API',
      provider: 'DigitalOcean',
      status: 'ACTIVE' as const,
      visibility: 'ADMIN_ONLY',
    };

    expect(component.resourceProvider(resource)).toBe('DigitalOcean');
    expect(component.resourceFields(resource).some(field => field.label.toLowerCase().includes('metadata'))).toBeFalse();
  });

  it('refreshes the global Resource collection after lifecycle success', () => {
    const resources = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['getResources', 'getResourceById']);
    resources.getResources.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [{ provide: AdminResourceService, useValue: resources }] });
    const component = TestBed.runInInjectionContext(() => new AdminResourcesListComponent());
    const active = { id: 7, name: 'Gateway', status: 'ACTIVE' as const };
    const disabled = { id: 7, name: 'Gateway', status: 'DISABLED' as const };
    component.resources.set([active]);
    resources.getResources.and.returnValue(of([disabled]));

    component.onResourceStatusUpdated();

    expect(resources.getResources).toHaveBeenCalled();
    expect(component.resources()).toEqual([disabled]);
    expect(component.resourceStatusSuccess()).toContain('actualizado');
  });

  it('preserves the global collection when lifecycle refresh fails', () => {
    const resources = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['getResources', 'getResourceById']);
    resources.getResources.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [{ provide: AdminResourceService, useValue: resources }] });
    const component = TestBed.runInInjectionContext(() => new AdminResourcesListComponent());
    const active = { id: 7, name: 'Gateway', status: 'ACTIVE' as const };
    component.resources.set([active]);
    resources.getResources.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    component.onResourceStatusUpdated();

    expect(component.resources()).toEqual([active]);
    expect(component.resourceStatusError()).toContain('no se pudo refrescar');
  });
});
