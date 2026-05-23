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

  it('gets a resource by id', () => {
    service.getResourceById(11).subscribe();

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminResources.resourceById(11))
    );
    req.flush({});
  });

  it('creates a resource', () => {
    const payload = { name: 'resource' };
    service.createResource(payload).subscribe();

    const req = http.expectOne(
      r => r.method === 'POST' && r.url === apiUrl(API.adminResources.resources)
    );
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });
});
