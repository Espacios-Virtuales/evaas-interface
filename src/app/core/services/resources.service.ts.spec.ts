// src/app/core/services/resources.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ResourcesService } from './resources.service';
import { environment } from '../../../environments/environment.development'; 

describe('ResourcesService', () => {
  let service: ResourcesService;
  let httpMock: HttpTestingController;

  const base = environment.apiUrl;
  const url = `${base}/integrations/software`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourcesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ResourcesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // evita requests colgados
  });

  it('debe hacer GET con params por defecto', () => {
    // defaults: q='cloud OR aws OR gcp', page=1, perPage=10
    service.searchSoftware().subscribe();

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === url);

    expect(req.request.params.get('q')).toBe('cloud OR aws OR gcp');
    expect(Number(req.request.params.get('page'))).toBe(1);
    expect(Number(req.request.params.get('perPage'))).toBe(10);

    req.flush({ items: [], total: 0 });
  });

  it('debe aceptar q/page/perPage personalizados', () => {
    service.searchSoftware('angular rxjs', 3, 25).subscribe();

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === url);

    expect(req.request.params.get('q')).toBe('angular rxjs');
    expect(Number(req.request.params.get('page'))).toBe(3);
    expect(Number(req.request.params.get('perPage'))).toBe(25);

    req.flush({ items: [], total: 0 });
  });
});
