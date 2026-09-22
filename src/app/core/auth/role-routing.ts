import { Role } from '../types/auth.types';
import { PATHS } from '../../utils/paths';

export const DASHBOARD_CHILD_PATHS = {
  admin: 'admin',
  client: 'client',
  context: 'context',
} as const;

export function dashboardRouteForAuthorities(authorities: readonly string[]): string[] {
  if (authorities.includes(Role.ADMIN)) {
    return ['/', PATHS.dashboard, DASHBOARD_CHILD_PATHS.admin];
  }

  if (
    authorities.includes(Role.CLIENT) ||
    authorities.includes(Role.USER) ||
    authorities.includes(Role.COMPANY)
  ) {
    return ['/', PATHS.dashboard, DASHBOARD_CHILD_PATHS.client];
  }

  return ['/', PATHS.dashboard, DASHBOARD_CHILD_PATHS.context];
}
