// src/app/features/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { PATHS } from '../../paths';
import { lazy } from '../../shared/lazy';
import { authGuard } from '../../core/guards/auth-guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: PATHS.dashboard,
    canMatch: [authGuard],
    loadComponent: () =>
      lazy(import('./layout/dashboard-layout.component'), 'DashboardLayoutComponent'),
    children: [
      {
        path: '',
        title: 'Dashboard',
        loadComponent: () =>
          lazy(import('./home/home.component'), 'HomeComponent'),
      },
      // futuros children: reports, settings, etc.
    ],
  },
];
