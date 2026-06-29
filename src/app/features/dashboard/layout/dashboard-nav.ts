import { Role } from '../../../core/types/auth.types';

export interface DashboardNavItem {
  label: string;
  route: string;
  roles: string[];
  iconClass?: string;
  exact?: boolean;
  enabled?: boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    label: 'Organizaciones',
    route: '/dashboard/admin/organizations',
    roles: [Role.ADMIN],
    iconClass: 'bi-building',
  },
  {
    label: 'Recursos',
    route: '/dashboard/admin/resources',
    roles: [Role.ADMIN],
    iconClass: 'bi-boxes',
  },
  {
    label: 'Activaciones',
    route: '/dashboard/admin/activations',
    roles: [Role.ADMIN],
    iconClass: 'bi-lightning-charge',
  },
  {
    label: 'Accesos',
    route: '/dashboard/admin/access',
    roles: [Role.ADMIN],
    iconClass: 'bi-key',
    enabled: false,
  },
];
