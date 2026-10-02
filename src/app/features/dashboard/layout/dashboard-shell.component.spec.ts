import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AccessContextStore } from '../../../core/access/access-context.store';
import { AuthFacade } from '../../../core/auth/auth.facade';
import { AuthStore } from '../../../core/auth/auth.store';
import { DashboardShellComponent } from './dashboard-shell.component';

describe('DashboardShellComponent navigation', () => {
  it('projects only items compatible with context authorities', () => {
    const store = {
      context: () => ({
        email: 'client@example.com',
        enabled: true,
        authorities: ['ROLE_CLIENT'],
        organizations: [],
      }),
      load: jasmine.createSpy('load').and.returnValue(of(null)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AccessContextStore, useValue: store },
        { provide: AuthStore, useValue: { session: () => null } },
        { provide: AuthFacade, useValue: { logout: jasmine.createSpy('logout') } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new DashboardShellComponent());

    expect(component.navItems()).toEqual([]);
    expect(component.email()).toBe('client@example.com');
  });

  it('projects administrative navigation from context authorities', () => {
    const store = {
      context: () => ({
        email: 'admin@example.com',
        enabled: true,
        authorities: ['ROLE_ADMIN'],
        organizations: [],
      }),
      load: jasmine.createSpy('load').and.returnValue(of(null)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AccessContextStore, useValue: store },
        { provide: AuthStore, useValue: { session: () => null } },
        { provide: AuthFacade, useValue: { logout: jasmine.createSpy('logout') } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new DashboardShellComponent());

    expect(component.navItems().map(item => item.label)).toEqual([
      'Organizaciones',
      'Recursos',
      'Instrumentos',
      'Activaciones',
    ]);
  });
});
