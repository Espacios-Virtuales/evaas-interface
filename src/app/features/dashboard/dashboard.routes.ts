// src/app/features/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { PATHS } from '../../utils/paths';
import { lazy } from '../../shared/lazy';
import { authGuard } from '../../core/auth/auth-guard';
import { DASHBOARD_CHILD_PATHS } from '../../core/auth/role-routing';

const DASHBOARD_LEGACY_PATHS = {
  resources: 'resources',
  projects: 'projects',
} as const;

export const DASHBOARD_ROUTES: Routes = [
  {
    path: PATHS.dashboard,
    canMatch: [authGuard],
    loadComponent: () =>
      lazy(import('./layout/dashboard-shell.component'), 'DashboardShellComponent'),
    children: [
      {
        path: DASHBOARD_CHILD_PATHS.client,
        title: 'Dashboard Cliente',
        data: { roles: ['ROLE_CLIENT', 'ROLE_USER', 'ROLE_COMPANY'] },
        loadComponent: () =>
          lazy(import('./client/client-dashboard.component'), 'ClientDashboardComponent'),
      },
      {
        path: DASHBOARD_CHILD_PATHS.admin,
        title: 'Panel Admin',
        data: { roles: ['ROLE_ADMIN'] },
        loadComponent: () =>
          lazy(import('./home/home.component'), 'HomeComponent'),
      },
      {
        path: DASHBOARD_LEGACY_PATHS.resources,
        title: 'Recursos',
        loadComponent: () =>
            lazy(import('./resources/resources-dashboard.component'), 'ResourcesDashboardComponent'),
      },
      {
        path: DASHBOARD_LEGACY_PATHS.projects,
        title: 'Proyectos',
        loadComponent: () =>
            lazy(import('./objects/grid/objects-grid.component'), 'ObjectsGridComponent'),
      },
      {
        path: '',
        pathMatch: 'full',
        title: 'Panel',
        loadComponent: () =>
          lazy(import('./home/home.component'), 'HomeComponent'),
      },
    ],
  },
];
