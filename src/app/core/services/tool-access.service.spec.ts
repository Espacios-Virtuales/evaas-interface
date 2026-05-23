import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { ToolAccessService } from './tool-access.service';

describe('ToolAccessService', () => {
  let service: ToolAccessService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolAccessService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ToolAccessService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads the current client tool access contract', () => {
    service.getMyToolAccess().subscribe(result => {
      expect(result).toEqual([
        {
          toolKey: 'vps-enclaustrado',
          organizationId: 1,
          organizationName: 'Empresa X',
          status: 'ENABLED',
          grantedAt: '2026-05-22T12:00:00Z',
          revokedAt: null,
        },
      ]);
    });

    const req = http.expectOne(r => r.method === 'GET' && r.url === apiUrl(API.me.toolAccess));
    req.flush([
      {
        toolKey: 'vps-enclaustrado',
        organizationId: 1,
        organizationName: 'Empresa X',
        status: 'ENABLED',
        grantedAt: '2026-05-22T12:00:00Z',
        revokedAt: null,
      },
    ]);
  });
});
