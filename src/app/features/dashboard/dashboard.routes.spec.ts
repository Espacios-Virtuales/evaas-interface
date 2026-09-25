import { Route } from '@angular/router';
import { authGuard } from '../../core/auth/auth-guard';
import { accessContextGuard } from '../../core/auth/access-context.guard';
import { DASHBOARD_ROUTES } from './dashboard.routes';

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
});
