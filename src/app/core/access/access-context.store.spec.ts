import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { MyAccessContextDto } from '../models/evaas-contracts.model';
import { MeService } from '../services/me.service';
import { AccessContextStore } from './access-context.store';

describe('AccessContextStore', () => {
  const context: MyAccessContextDto = {
    email: 'admin@example.com',
    enabled: true,
    authorities: ['ROLE_ADMIN'],
    organizations: [],
  };

  let meService: jasmine.SpyObj<MeService>;
  let authStore: { clear: jasmine.Spy };
  let store: AccessContextStore;

  beforeEach(() => {
    meService = jasmine.createSpyObj<MeService>('MeService', ['getMyAccessContext']);
    authStore = { clear: jasmine.createSpy('clear') };
    TestBed.configureTestingModule({
      providers: [
        AccessContextStore,
        { provide: MeService, useValue: meService },
        { provide: AuthStore, useValue: authStore },
      ],
    });
    store = TestBed.inject(AccessContextStore);
  });

  it('loads once and reuses the ready access context', () => {
    meService.getMyAccessContext.and.returnValue(of(context));

    store.load().subscribe();
    store.load().subscribe();

    expect(meService.getMyAccessContext).toHaveBeenCalledTimes(1);
    expect(store.state()).toBe('READY');
    expect(store.context()).toEqual(context);
  });

  it('refreshes and clears the context explicitly', () => {
    meService.getMyAccessContext.and.returnValues(of(context), of({ ...context, authorities: ['ROLE_USER'] }));

    store.load().subscribe();
    store.refresh().subscribe();

    expect(meService.getMyAccessContext).toHaveBeenCalledTimes(2);
    expect(store.context()?.authorities).toEqual(['ROLE_USER']);

    store.clear();

    expect(store.context()).toBeNull();
    expect(store.state()).toBe('LOADING');
  });

  it('invalidates the local session when the access-context request returns 401', () => {
    meService.getMyAccessContext.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );

    store.load().subscribe({ error: () => undefined });

    expect(authStore.clear).toHaveBeenCalledTimes(1);
    expect(store.state()).toBe('ERROR');
    expect(store.errorStatus()).toBe(401);
    expect(store.context()).toBeNull();
  });

  it('retains a controlled error state for non-authentication failures', () => {
    meService.getMyAccessContext.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Unavailable' })),
    );

    store.load().subscribe({ error: () => undefined });

    expect(authStore.clear).not.toHaveBeenCalled();
    expect(store.state()).toBe('ERROR');
    expect(store.errorStatus()).toBe(503);
    expect(store.errorMessage()).toBe('No fue posible cargar tu perfil de acceso.');
  });
});
