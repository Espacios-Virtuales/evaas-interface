// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { PATHS } from '../../utils/paths';
import { lazy } from '../../shared/lazy';

export const AUTH_ROUTES: Routes = [
  {
    path: PATHS.login,
    title: 'Ingresar',
    loadComponent: () =>
      lazy(import('./login/login.component'), 'LoginComponent'),
  },
  {
    path: PATHS.register,
    title: 'Registro',
    loadComponent: () =>
      lazy(import('./register/register.component'), 'RegisterComponent'),
  },
  {
    path: PATHS.authActivate,
    title: 'Activar cuenta',
    loadComponent: () =>
      lazy(import('./activate/account-activation.component'), 'AccountActivationComponent'),
  },
  {
    path: PATHS.altaEvaas,
    title: 'Alta EVAAS',
    loadComponent: () =>
      lazy(
        import('../onboarding/alta-evaas/alta-evaas-onboarding.component'),
        'AltaEvaasOnboardingComponent'
      ),
  },
];
