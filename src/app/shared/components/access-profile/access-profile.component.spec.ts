import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MeService } from '../../../core/services/me.service';
import { AccessProfileComponent } from './access-profile.component';

describe('AccessProfileComponent', () => {
  it('loads and exposes the authenticated access context', () => {
    const me = jasmine.createSpyObj<MeService>('MeService', ['getMyAccessContext']);
    const accessContext = {
      email: 'person@example.com',
      enabled: true,
      authorities: ['ROLE_USER'],
      organizations: [
        {
          organizationRef: 'a4797f2a-91c8-4a50-a6f9-b29e497993a1',
          organizationName: 'EVAAS',
          organizationEnabled: true,
          memberRef: '0875b00a-3d32-45c1-ad33-cb3337141dbf',
          role: 'OWNER' as const,
          status: 'ACTIVE' as const,
        },
      ],
    };
    me.getMyAccessContext.and.returnValue(of(accessContext));
    TestBed.configureTestingModule({ providers: [{ provide: MeService, useValue: me }] });

    const component = TestBed.runInInjectionContext(() => new AccessProfileComponent());
    component.load();

    expect(me.getMyAccessContext).toHaveBeenCalledTimes(1);
    expect(component.ready()).toBeTrue();
    expect(component.accessContext()).toEqual(accessContext);
    expect(component.userState(accessContext)).toBe('Cuenta habilitada');
    expect(component.organizationState(accessContext.organizations[0])).toBe('Organización habilitada');
  });

  it('keeps access data empty and reports an isolated load failure', () => {
    const me = jasmine.createSpyObj<MeService>('MeService', ['getMyAccessContext']);
    me.getMyAccessContext.and.returnValue(throwError(() => new Error('unavailable')));
    TestBed.configureTestingModule({ providers: [{ provide: MeService, useValue: me }] });
    spyOn(console, 'error');

    const component = TestBed.runInInjectionContext(() => new AccessProfileComponent());
    component.load();

    expect(component.state()).toBe('ERROR');
    expect(component.accessContext()).toBeNull();
    expect(component.error()).toBe('No fue posible cargar tu perfil de acceso.');
  });
});
