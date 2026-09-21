import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminInstrumentAccessService } from './admin-instrument-access.service';

describe('AdminInstrumentAccessService', () => {
  let service: AdminInstrumentAccessService;
  let http: HttpTestingController;
  const organizationRef = 'org / canonical?';
  const accessRef = 'access / canonical?';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminInstrumentAccessService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminInstrumentAccessService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets access using only the URL-encoded canonical organization reference', () => {
    service.getOrganizationInstrumentAccess(organizationRef).subscribe();
    const req = http.expectOne(apiUrl(API.adminInstrumentAccess.byOrganization(organizationRef)));
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toContain(encodeURIComponent(organizationRef));
    req.flush([]);
  });

  it('grants with only instrumentRef in the body', () => {
    service.grantInstrumentAccess(organizationRef, { instrumentRef: 'instrument-uuid' }).subscribe();
    const req = http.expectOne(apiUrl(API.adminInstrumentAccess.byOrganization(organizationRef)));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ instrumentRef: 'instrument-uuid' });
    req.flush({});
  });

  it('patches canonical organization and access references with only status', () => {
    service.updateInstrumentAccessStatus(organizationRef, accessRef, { status: 'SUSPENDED' }).subscribe();
    const req = http.expectOne(apiUrl(API.adminInstrumentAccess.status(organizationRef, accessRef)));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.url).toContain(encodeURIComponent(organizationRef));
    expect(req.request.url).toContain(encodeURIComponent(accessRef));
    expect(req.request.body).toEqual({ status: 'SUSPENDED' });
    req.flush({});
  });
});
