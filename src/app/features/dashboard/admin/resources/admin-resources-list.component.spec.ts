import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
      status: 'ACTIVE',
      visibility: 'ADMIN_ONLY',
    };

    expect(component.resourceProvider(resource)).toBe('DigitalOcean');
    expect(component.resourceFields(resource).some(field => field.label.toLowerCase().includes('metadata'))).toBeFalse();
  });
});
