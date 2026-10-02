import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AccessContextStore } from '../../../core/access/access-context.store';
import { AccessProfileComponent } from './access-profile.component';

describe('AccessProfileComponent', () => {
  it('loads and exposes the authenticated access context', () => {
    const accessContext = {
      email: 'person@example.com',
      enabled: true,
      authorities: ['ROLE_USER'],
      organizations: [
        {
          organizationRef: 'a4797f2a-91c8-4a50-a6f9-b29e497993a1',
          organizationName: 'EVAAS',
          organizationEnabled: true,
          memberRef: '0875b00a-3d32-45c1-ad33-cb3337141dbf',
          role: 'OWNER' as const,
          status: 'ACTIVE' as const,
        },
      ],
    };
    const state = signal<'LOADING' | 'READY' | 'ERROR'>('LOADING');
    const context = signal<typeof accessContext | null>(null);
    const errorMessage = signal<string | null>(null);
    const store = {
      state,
      context,
      errorMessage,
      loading: () => state() === 'LOADING',
      ready: () => state() === 'READY',
      load: jasmine.createSpy('load').and.callFake(() => {
        context.set(accessContext);
        state.set('READY');
        return of(accessContext);
      }),
      refresh: jasmine.createSpy('refresh'),
    };
    TestBed.configureTestingModule({ providers: [{ provide: AccessContextStore, useValue: store }] });

    const component = TestBed.runInInjectionContext(() => new AccessProfileComponent());
    component.load();

    expect(store.load).toHaveBeenCalledTimes(1);
    expect(component.ready()).toBeTrue();
    expect(component.accessContext()).toEqual(accessContext);
    expect(component.userState(accessContext)).toBe('Cuenta habilitada');
    expect(component.organizationState(accessContext.organizations[0])).toBe('Organización habilitada');
  });

  it('keeps access data empty and reports an isolated load failure', () => {
    const state = signal<'LOADING' | 'READY' | 'ERROR'>('ERROR');
    const context = signal<null>(null);
    const errorMessage = signal('No fue posible cargar tu perfil de acceso.');
    const store = {
      state,
      context,
      errorMessage,
      loading: () => false,
      ready: () => false,
      load: jasmine.createSpy('load').and.returnValue(throwError(() => new Error('unavailable'))),
      refresh: jasmine.createSpy('refresh').and.returnValue(of(null)),
    };
    TestBed.configureTestingModule({ providers: [{ provide: AccessContextStore, useValue: store }] });

    const component = TestBed.runInInjectionContext(() => new AccessProfileComponent());
    expect(component.state()).toBe('ERROR');
    expect(component.accessContext()).toBeNull();
    expect(component.error()).toBe('No fue posible cargar tu perfil de acceso.');

    component.retry();
    expect(store.refresh).toHaveBeenCalledTimes(1);
  });
});
