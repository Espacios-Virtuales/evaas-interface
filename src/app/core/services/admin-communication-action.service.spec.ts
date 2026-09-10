import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminCommunicationActionService } from './admin-communication-action.service';

describe('AdminCommunicationActionService', () => {
  let service: AdminCommunicationActionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminCommunicationActionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminCommunicationActionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets read-only communication evidence', () => {
    service.getCommunicationActions().subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(
      request => request.method === 'GET' && request.url === apiUrl(API.adminCommunicationActions.actions),
    );
    req.flush([]);
  });
});
