// src/app/auth/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { AccessContextStore } from '../access/access-context.store';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(AuthStore);
  const accessContext = inject(AccessContextStore);

  if (store.isLoggedIn()) {
    return true;
  }

  accessContext.clear();
  return router.createUrlTree(['/login']);
};
