import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { MeService } from './me.service';

describe('MeService', () => {
  let service: MeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets my access context', () => {
    const accessContext = {
      email: 'person@example.com',
      enabled: true,
      authorities: ['ROLE_USER'],
      organizations: [],
    };

    service.getMyAccessContext().subscribe(result => expect(result).toEqual(accessContext));

    const req = http.expectOne(r => r.method === 'GET' && r.url === apiUrl(API.me.accessContext));
    req.flush(accessContext);
  });

  it('gets the complete contextual projection without browser-supplied context', () => {
    const projection = {
      version: 'v1',
      identity: { subjectRef: 'subject-1', enabled: true },
      context: { authorities: ['ROLE_USER'], organizationRefs: ['org-1'] },
      capabilities: [{
        organizationRef: 'org-1',
        instrumentAccessRef: 'access-1',
        instrumentRef: 'instrument-1',
        instrumentKey: 'communicator',
      }],
      relationships: [{
        organizationRef: 'org-1',
        organizationName: 'Example Org',
        organizationEnabled: true,
        memberRef: 'member-1',
        role: 'OWNER',
        status: 'ACTIVE',
      }],
      resources: [{
        organizationRef: 'org-1',
        type: 'API',
        key: 'example-api',
        name: 'Example API',
        status: 'ACTIVE',
      }],
      actions: [{ actionKey: 'READ_INSTRUMENT_ACCESS', organizationRef: 'org-1' }],
      results: [{ resultRef: 'result-1', status: 'READY' }],
      evidence: [{ evidenceRef: 'evidence-1', occurredAt: '2026-09-26T12:00:00Z', status: 'RECORDED' }],
    };

    let received: unknown;
    service.getMyContextualProjection().subscribe(result => received = result);

    const req = http.expectOne(apiUrl(API.me.contextualProjection));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toBeNull();
    expect(req.request.url).toBe('http://localhost:8091/api/v1/me/contextual-projection');
    expect(req.request.url).not.toContain('userRef');
    expect(req.request.url).not.toContain('organizationRef');
    req.flush(projection);

    expect(received).toEqual(projection);
  });

  it('gets my tool access', () => {
    service.getMyToolAccess().subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(r => r.method === 'GET' && r.url === apiUrl(API.me.toolAccess));
    req.flush([]);
  });

  it('gets my resources', () => {
    service.getMyResources().subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(r => r.method === 'GET' && r.url === apiUrl(API.me.resources));
    req.flush([]);
  });
});
