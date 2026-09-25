import { dashboardRouteForAuthorities } from './role-routing';

describe('dashboardRouteForAuthorities', () => {
  it('prioritizes the admin dashboard from context authorities', () => {
    expect(dashboardRouteForAuthorities(['ROLE_USER', 'ROLE_ADMIN'])).toEqual(['/', 'dashboard', 'admin']);
  });

  it('routes client authorities to the client dashboard', () => {
    expect(dashboardRouteForAuthorities(['ROLE_COMPANY'])).toEqual(['/', 'dashboard', 'client']);
  });

  it('keeps an authority-less context on the controlled dashboard state', () => {
    expect(dashboardRouteForAuthorities([])).toEqual(['/', 'dashboard', 'context']);
  });
});
