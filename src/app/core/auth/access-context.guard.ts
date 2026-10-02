import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AccessContextStore } from '../access/access-context.store';
import { dashboardRouteForAuthorities } from './role-routing';
import { AuthStore } from './auth.store';

function isAuthorized(authorities: readonly string[], requiredAuthorities: readonly string[]): boolean {
  return requiredAuthorities.length === 0 || requiredAuthorities.some(authority => authorities.includes(authority));
}

export const accessContextGuard: CanActivateFn = route => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const accessContext = inject(AccessContextStore);

  if (!authStore.isLoggedIn()) {
    accessContext.clear();
    return router.createUrlTree(['/login']);
  }

  const requiredAuthorities = (route.data?.['roles'] as string[] | undefined) ?? [];

  return accessContext.load().pipe(
    map(context => {
      if (context.enabled && isAuthorized(context.authorities, requiredAuthorities)) {
        return true;
      }

      return router.createUrlTree(dashboardRouteForAuthorities(context.authorities));
    }),
    catchError(() => {
      if (accessContext.errorStatus() === 401) {
        accessContext.invalidateSession();
        return of(router.createUrlTree(['/login']));
      }

      return of(router.createUrlTree(dashboardRouteForAuthorities([])));
    }),
  );
};
