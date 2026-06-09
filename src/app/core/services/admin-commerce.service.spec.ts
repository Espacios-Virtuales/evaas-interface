import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API, apiUrl } from '../http/api.endpoints';
import { AdminCommerceService } from './admin-commerce.service';

describe('AdminCommerceService', () => {
  let service: AdminCommerceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminCommerceService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminCommerceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets activations', () => {
    service.getActivations().subscribe(result => expect(result).toEqual([]));

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminCommerce.activations)
    );
    req.flush([]);
  });

  it('gets an activation by id', () => {
    service.getActivationById(3).subscribe();

    const req = http.expectOne(
      r => r.method === 'GET' && r.url === apiUrl(API.adminCommerce.activationById(3))
    );
    req.flush({});
  });

  it('creates an activation', () => {
    const payload = {
      provider: 'INTERNAL',
      externalOrderId: 'order-1',
      productCode: 'FARQBIM_SETUP',
      buyerEmail: 'buyer@example.com',
      organizationName: 'Buyer Org',
      status: 'RECEIVED',
    };
    service.createActivation(payload).subscribe();

    const req = http.expectOne(
      r => r.method === 'POST' && r.url === apiUrl(API.adminCommerce.activations)
    );
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('updates activation status', () => {
    const payload = { status: 'ACTIVE' };
    service.updateActivationStatus(3, payload).subscribe();

    const req = http.expectOne(
      r => r.method === 'PATCH' && r.url === apiUrl(API.adminCommerce.activationStatus(3))
    );
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });
});
