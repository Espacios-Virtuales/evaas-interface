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
