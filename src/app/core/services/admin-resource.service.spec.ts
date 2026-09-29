import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminResourceService } from './admin-resource.service';

describe('AdminResourceService', () => {
  let service: AdminResourceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminResourceService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminResourceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets resources', () => {
    service.getResources().subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminResources.resources)
    );
    req.flush([]);
  });

  it('creates a resource', () => {
    const payload = { organizationId: 7, type: 'API', name: 'resource' };
    service.createResource(payload).subscribe();

    const req = http.expectOne(
      r => r.method === 'POST' && r.url === apiUrl(API.adminResources.resources)
    );
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  (['PLANNED', 'ACTIVE', 'MAINTENANCE', 'DISABLED'] as const).forEach(status => {
    it(`updates status to ${status}`, () => {
      service.updateResourceStatus(11, { status }).subscribe();

      const req = http.expectOne(
        r => r.method === 'PATCH' && r.url === apiUrl(API.adminResources.resourceStatus(11)),
      );
      expect(req.request.body).toEqual({ status });
      req.flush({ id: 11, status });
    });
  });
});
