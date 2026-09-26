import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ContextualProjectionDto } from '../models/evaas-contracts.model';
import { MeService } from '../services/me.service';
import { ContextualProjectionStore } from './contextual-projection.store';

describe('ContextualProjectionStore', () => {
  const projection: ContextualProjectionDto = {
    version: 'v1',
    identity: { subjectRef: 'subject-1', enabled: true },
    context: { authorities: [], organizationRefs: [] },
    capabilities: [],
    relationships: [],
    resources: [],
    actions: [],
    results: [],
    evidence: [],
  };

  let meService: jasmine.SpyObj<MeService>;
  let store: ContextualProjectionStore;

  beforeEach(() => {
    meService = jasmine.createSpyObj<MeService>('MeService', ['getMyContextualProjection']);
    TestBed.configureTestingModule({
      providers: [
        ContextualProjectionStore,
        { provide: MeService, useValue: meService },
      ],
    });
    store = TestBed.inject(ContextualProjectionStore);
  });

  it('moves from LOADING to READY when CORE returns the projection', () => {
    const response = new Subject<ContextualProjectionDto>();
    meService.getMyContextualProjection.and.returnValue(response);

    store.load().subscribe();

    expect(store.state()).toBe('LOADING');
    expect(store.projection()).toBeNull();
    response.next(projection);
    response.complete();

    expect(store.state()).toBe('READY');
    expect(store.projection()).toEqual(projection);
  });

  it('moves from LOADING to ERROR without replacing an HTTP error with empty arrays', () => {
    const error = new HttpErrorResponse({ status: 503, statusText: 'Unavailable' });
    meService.getMyContextualProjection.and.returnValue(throwError(() => error));

    store.load().subscribe({ error: () => undefined });

    expect(store.state()).toBe('ERROR');
    expect(store.projection()).toBeNull();
    expect(store.errorStatus()).toBe(503);
    expect(store.errorMessage()).toBe('No fue posible cargar la proyección contextual.');
  });

  it('preserves an empty successful projection as READY and reuses it', () => {
    meService.getMyContextualProjection.and.returnValue(of(projection));

    store.load().subscribe();
    store.load().subscribe();

    expect(store.state()).toBe('READY');
    expect(store.projection()?.capabilities).toEqual([]);
    expect(meService.getMyContextualProjection).toHaveBeenCalledTimes(1);
  });
});
