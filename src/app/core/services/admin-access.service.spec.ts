import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminAccessService } from './admin-access.service';

describe('AdminAccessService', () => {
  let service: AdminAccessService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminAccessService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminAccessService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets organizations', () => {
    service.getOrganizations().subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminAccess.organizations)
    );
    req.flush([]);
  });

  it('filters organizations by enabled status', () => {
    service.getOrganizations(true).subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminAccess.organizations) && r.params.get('enabled') === 'true',
    );
    req.flush([]);
  });

  it('creates an organization', () => {
    const payload = { name: 'EV', taxId: '76.000.000-0' };
    service.createOrganization(payload).subscribe(result => expect(result).toEqual({ id: 7, name: 'EV' }));

    const req = http.expectOne(
      r => r.method === 'POST' && r.url === apiUrl(API.adminAccess.organizations)
    );
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 7, name: 'EV' });
  });

  it('updates organization status', () => {
    service.updateOrganizationStatus(7, false).subscribe(result => {
      expect(result).toEqual({ id: 7, name: 'EV', enabled: false });
    });

    const req = http.expectOne(
      r => r.method === 'PATCH' && r.url === apiUrl(API.adminAccess.organizationStatus(7)),
    );
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({ id: 7, name: 'EV', enabled: false });
  });

  it('creates tool access', () => {
    const payload = {
      organizationId: 7,
      toolKey: 'FARQBIM_DASHBOARD',
      userId: 12,
      externalCommerceActivationId: 24,
    };
    const response = {
      id: 30,
      organizationId: 7,
      organizationName: 'EV',
      toolKey: 'FARQBIM_DASHBOARD',
      status: 'ENABLED',
      grantedAt: '2026-06-08T12:00:00Z',
    };

    service.createToolAccess(payload).subscribe(result => expect(result).toEqual(response));

    const req = http.expectOne(
      r => r.method === 'POST' && r.url === apiUrl(API.adminAccess.toolAccess)
    );
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('disables tool access', () => {
    service.disableToolAccess(30).subscribe();

    const req = http.expectOne(
      r => r.method === 'DELETE' && r.url === apiUrl(API.adminAccess.toolAccessById(30))
    );
    req.flush(null);
  });

  it('finds a user by email and normalizes wrapped responses', () => {
    service.findUserByEmail('info@example.com').subscribe(result => {
      expect(result).toEqual({ id: 12, email: 'info@example.com' });
    });

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminUsers.byEmail('info@example.com'))
    );
    req.flush({ user: { id: 12, email: 'info@example.com' } });
  });

  it('gets an organization by id', () => {
    service.getOrganizationById(7).subscribe(result => expect(result).toEqual({ id: 7, name: 'EV' }));

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminAccess.organizationById(7))
    );
    req.flush({ id: 7, name: 'EV' });
  });

  it('gets organization tool access', () => {
    service.getOrganizationToolAccess(7).subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminAccess.organizationToolAccess(7))
    );
    req.flush([]);
  });

  it('gets organization resources', () => {
    service.getOrganizationResources(7).subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminAccess.organizationResources(7))
    );
    req.flush([]);
  });
});
