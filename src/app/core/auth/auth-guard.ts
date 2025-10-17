// src/app/auth/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(AuthStore);
  return store.isLoggedIn() || router.createUrlTree(['/login']);
};