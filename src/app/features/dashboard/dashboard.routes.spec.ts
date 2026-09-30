import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AccessContextStore } from '../../core/access/access-context.store';
import { authGuard } from '../../core/auth/auth-guard';
import { accessContextGuard } from '../../core/auth/access-context.guard';
import { AuthStore } from '../../core/auth/auth.store';
import { DASHBOARD_ROUTES } from './dashboard.routes';

@Component({ standalone: true, imports: [RouterOutlet], template: '<router-outlet />' })
class DashboardShellStub {}

@Component({ standalone: true, template: '' })
class PageStub {}

describe('DASHBOARD_ROUTES', () => {
  const dashboardRoute = DASHBOARD_ROUTES[0];
  const children = dashboardRoute.children ?? [];

  function route(path: string): Route | undefined {
    return children.find(child => child.path === path);
  }

  it('redirects legacy resource and project entries to the access context', () => {
    expect(route('resources')).toEqual(
      jasmine.objectContaining({ pathMatch: 'full', redirectTo: '/dashboard/context' }),
    );
    expect(route('projects')).toEqual(
      jasmine.objectContaining({ pathMatch: 'full', redirectTo: '/dashboard/context' }),
    );
  });

  it('keeps authentication at the dashboard boundary and the context route available', () => {
    expect(dashboardRoute.canMatch).toContain(authGuard);
    expect(route('context')).toEqual(jasmine.objectContaining({ title: 'Contexto de acceso' }));
  });

  it('keeps contextual authorization on protected dashboard destinations', () => {
    expect(route('admin')?.canActivate).toContain(accessContextGuard);
    expect(route('client')?.canActivate).toContain(accessContextGuard);
  });

  it('keeps the legacy admin access redirect free of activation guards and its destination protected', () => {
    expect(route('admin/access')).toEqual(jasmine.objectContaining({
      pathMatch: 'full',
      redirectTo: '/dashboard/admin/instruments',
    }));
    expect(route('admin/access')?.canActivate).toBeUndefined();
    expect(route('admin/instruments')?.data?.['roles']).toEqual(['ROLE_ADMIN']);
    expect(route('admin/instruments')?.canActivate).toContain(accessContextGuard);
  });
});

describe('admin access redirect navigation', () => {
  let router: Router;
  let authStore: { isLoggedIn: jasmine.Spy };
  let accessContext: { load: jasmine.Spy; clear: jasmine.Spy };

  beforeEach(() => {
    authStore = { isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true) };
    accessContext = {
      load: jasmine.createSpy('load').and.returnValue(of({
        email: 'admin@example.com', enabled: true, authorities: ['ROLE_ADMIN'], organizations: [],
      })),
      clear: jasmine.createSpy('clear'),
    };

    // Keep the real redirect and guards while replacing screen components with local stubs.
    const dashboard = DASHBOARD_ROUTES[0];
    const children = (dashboard.children ?? []).map(child => child.loadComponent
      ? { ...child, loadComponent: undefined, component: PageStub }
      : child);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { ...dashboard, loadComponent: undefined, component: DashboardShellStub, children },
          { path: 'login', component: PageStub },
        ]),
        { provide: AuthStore, useValue: authStore },
        { provide: AccessContextStore, useValue: accessContext },
      ],
    });
    router = TestBed.inject(Router);
  });

  async function navigate(path: string): Promise<string> {
    await RouterTestingHarness.create();
    await router.navigateByUrl(path);
    return router.url;
  }

  it('builds the router without NG04014 and sends an admin through the historical redirect', async () => {
    expect(await navigate('/dashboard/admin/access')).toBe('/dashboard/admin/instruments');
    expect(accessContext.load).toHaveBeenCalled();
  });

  it('applies the destination guard to a non-admin using the redirect', async () => {
    accessContext.load.and.returnValue(of({
      email: 'client@example.com', enabled: true, authorities: ['ROLE_USER'], organizations: [],
    }));

    expect(await navigate('/dashboard/admin/access')).toBe('/dashboard/client');
  });

  it('rejects an anonymous visitor at the dashboard boundary', async () => {
    authStore.isLoggedIn.and.returnValue(false);

    expect(await navigate('/dashboard/admin/access')).toBe('/login');
    expect(accessContext.load).not.toHaveBeenCalled();
  });

  it('preserves direct destination authorization for admin and non-admin users', async () => {
    expect(await navigate('/dashboard/admin/instruments')).toBe('/dashboard/admin/instruments');

    accessContext.load.and.returnValue(of({
      email: 'client@example.com', enabled: true, authorities: ['ROLE_USER'], organizations: [],
    }));
    await router.navigateByUrl('/login');
    expect(await router.navigateByUrl('/dashboard/admin/instruments')).toBeTrue();
    expect(router.url).toBe('/dashboard/client');
  });

  it('preserves direct destination denial for an anonymous visitor', async () => {
    authStore.isLoggedIn.and.returnValue(false);

    expect(await navigate('/dashboard/admin/instruments')).toBe('/login');
    expect(accessContext.load).not.toHaveBeenCalled();
  });
});
