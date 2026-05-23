import { UserSession } from '../models/auth.model';
import { Role } from '../types/auth.types';
import { PATHS } from '../../utils/paths';

export const DASHBOARD_CHILD_PATHS = {
  admin: 'admin',
  client: 'client',
} as const;

export function dashboardRouteForSession(session: Pick<UserSession, 'roles'> | null): string[] {
  const roles = session?.roles ?? [];

  if (roles.includes(Role.ADMIN)) {
    return ['/', PATHS.dashboard, DASHBOARD_CHILD_PATHS.admin];
  }

  if (roles.includes(Role.CLIENT) || roles.includes(Role.USER) || roles.includes(Role.COMPANY)) {
    return ['/', PATHS.dashboard, DASHBOARD_CHILD_PATHS.client];
  }

  return ['/', PATHS.dashboard, DASHBOARD_CHILD_PATHS.client];
}
