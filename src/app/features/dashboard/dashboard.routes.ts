// src/app/features/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { PATHS } from '../../utils/paths';
import { lazy } from '../../shared/lazy';
import { authGuard } from '../../core/auth/auth-guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: PATHS.dashboard,
    canMatch: [authGuard],
    loadComponent: () =>
      lazy(import('./layout/dashboard-shell.component'), 'DashboardShellComponent'),
    children: [
      {
        path: '',
        title: 'Panel',
        loadComponent: () =>
          lazy(import('./home/home.component'), 'HomeComponent'),
      },
      {
        path: 'resources',
        title: 'Recursos',
        loadComponent: () =>
            lazy(import('./resources/resources-dashboard.component'), 'ResourcesDashboardComponent'),
      }    
    ],
  },
];
