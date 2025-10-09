// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { PATHS } from './paths';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: PATHS.login },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
  { path: '**', redirectTo: PATHS.login },
];
