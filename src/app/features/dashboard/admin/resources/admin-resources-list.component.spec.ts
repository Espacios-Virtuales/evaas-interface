import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { AdminResourcesListComponent } from './admin-resources-list.component';

describe('AdminResourcesListComponent', () => {
  it('uses collection values only and keeps absent detail values explicit', () => {
    const resources = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['getResources']);
    resources.getResources.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [{ provide: AdminResourceService, useValue: resources }] });

    const component = TestBed.runInInjectionContext(() => new AdminResourcesListComponent());
    const resource = {
      id: 7,
      name: 'Gateway',
      key: 'GATEWAY',
      type: 'API',
      status: 'ACTIVE' as const,
    };

    component.openResourceDetail(resource);

    expect(resources.getResources).not.toHaveBeenCalled();
    expect(component.selectedResource()).toEqual(resource);
    expect(component.resourceFields(resource).find(field => field.label === 'Visibilidad')?.value).toBeUndefined();
  });

  it('replaces the collection item with the confirmed lifecycle response', () => {
    const resources = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['getResources']);
    resources.getResources.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [{ provide: AdminResourceService, useValue: resources }] });
    const component = TestBed.runInInjectionContext(() => new AdminResourcesListComponent());
    const active = { id: 7, name: 'Gateway', status: 'ACTIVE' as const };
    const disabled = { id: 7, name: 'Gateway', status: 'DISABLED' as const };
    component.resources.set([active]);
    component.onResourceStatusUpdated(disabled);

    expect(resources.getResources).toHaveBeenCalledTimes(0);
    expect(component.resources()).toEqual([disabled]);
    expect(component.resourceStatusSuccess()).toContain('actualizado');
  });

  it('keeps the confirmed collection until a status response is received', () => {
    const resources = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['getResources']);
    resources.getResources.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [{ provide: AdminResourceService, useValue: resources }] });
    const component = TestBed.runInInjectionContext(() => new AdminResourcesListComponent());
    const active = { id: 7, name: 'Gateway', status: 'ACTIVE' as const };
    component.resources.set([active]);
    component.openResourceStatusModal(active);

    expect(component.resources()).toEqual([active]);
    expect(component.resourceStatusModalResource()).toEqual(active);
  });
});
