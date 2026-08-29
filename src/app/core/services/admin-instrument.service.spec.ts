import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminInstrumentService } from './admin-instrument.service';

describe('AdminInstrumentService', () => {
  let service: AdminInstrumentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminInstrumentService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminInstrumentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the canonical instrument catalogue', () => {
    service.getInstruments().subscribe(result => expect(result).toEqual([{ key: 'LIORA' }]));

    const req = http.expectOne(
      request => request.method === 'GET' && request.url === apiUrl(API.adminInstruments.instruments),
    );
    req.flush([{ key: 'LIORA' }]);
  });
});
