import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AccessContextStore } from '../access/access-context.store';
import { AuthStore } from './auth.store';
import { accessContextGuard } from './access-context.guard';

describe('accessContextGuard', () => {
  const adminContext = {
    email: 'admin@example.com',
    enabled: true,
    authorities: ['ROLE_ADMIN'],
    organizations: [],
  };

  let authStore: { isLoggedIn: jasmine.Spy; clear: jasmine.Spy };
  let accessContext: { load: jasmine.Spy; clear: jasmine.Spy; invalidateSession: jasmine.Spy; errorStatus: jasmine.Spy };
  let router: Router;

  beforeEach(() => {
    authStore = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
      clear: jasmine.createSpy('clear'),
    };
    accessContext = {
      load: jasmine.createSpy('load').and.returnValue(of(adminContext)),
      clear: jasmine.createSpy('clear'),
      invalidateSession: jasmine.createSpy('invalidateSession'),
      errorStatus: jasmine.createSpy('errorStatus').and.returnValue(null),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: AccessContextStore, useValue: accessContext },
      ],
    });
    router = TestBed.inject(Router);
  });

  async function run(requiredRoles: string[]): Promise<unknown> {
    const result = TestBed.runInInjectionContext(() =>
      accessContextGuard({ data: { roles: requiredRoles } } as never, {} as never),
    );
    return result instanceof Object && 'subscribe' in result
      ? firstValueFrom(result)
      : result;
  }

  it('allows ROLE_ADMIN to activate an admin route', async () => {
    await expectAsync(run(['ROLE_ADMIN'])).toBeResolvedTo(true);
  });

  it('redirects a user without ROLE_ADMIN to its contextual root', async () => {
    accessContext.load.and.returnValue(of({ ...adminContext, authorities: ['ROLE_USER'] }));

    const result = await run(['ROLE_ADMIN']);

    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard/client');
  });

  it('allows a client authority to activate the client route', async () => {
    accessContext.load.and.returnValue(of({ ...adminContext, authorities: ['ROLE_CLIENT'] }));

    await expectAsync(run(['ROLE_CLIENT', 'ROLE_USER', 'ROLE_COMPANY'])).toBeResolvedTo(true);
  });

  it('redirects a missing session to login without loading context', async () => {
    authStore.isLoggedIn.and.returnValue(false);

    const result = await run(['ROLE_ADMIN']);

    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    expect(accessContext.load).not.toHaveBeenCalled();
    expect(accessContext.clear).toHaveBeenCalledTimes(1);
  });

  it('invalidates the session and redirects to login after a context 401', async () => {
    accessContext.load.and.returnValue(throwError(() => new Error('unauthorized')));
    accessContext.errorStatus.and.returnValue(401);

    const result = await run(['ROLE_ADMIN']);

    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
    expect(accessContext.invalidateSession).toHaveBeenCalledTimes(1);
  });
});
