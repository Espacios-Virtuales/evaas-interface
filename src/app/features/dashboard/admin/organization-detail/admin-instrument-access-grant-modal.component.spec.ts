import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminInstrumentAccessService } from '../../../../core/services/admin-instrument-access.service';
import { AdminInstrumentAccessGrantModalComponent } from './admin-instrument-access-grant-modal.component';

describe('AdminInstrumentAccessGrantModalComponent', () => {
  let access: jasmine.SpyObj<AdminInstrumentAccessService>;

  beforeEach(() => {
    access = jasmine.createSpyObj<AdminInstrumentAccessService>('AdminInstrumentAccessService', ['grantInstrumentAccess']);
    TestBed.configureTestingModule({ providers: [{ provide: AdminInstrumentAccessService, useValue: access }] });
  });

  it('posts only the selected instrument canonical reference', () => {
    access.grantInstrumentAccess.and.returnValue(of({
      canonicalId: 'access-uuid', organizationRef: 'organization-uuid', instrumentRef: 'instrument-uuid', instrumentKey: 'LIORA', status: 'ENABLED',
    }));
    const component = TestBed.runInInjectionContext(() => new AdminInstrumentAccessGrantModalComponent());
    component.organizationRef = 'organization-uuid';
    component.instrumentRef = 'instrument-uuid';
    component.submit();
    expect(access.grantInstrumentAccess).toHaveBeenCalledOnceWith('organization-uuid', { instrumentRef: 'instrument-uuid' });
  });

  it('presents the explicit duplicate grant message for HTTP 409', () => {
    access.grantInstrumentAccess.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const component = TestBed.runInInjectionContext(() => new AdminInstrumentAccessGrantModalComponent());
    component.organizationRef = 'organization-uuid';
    component.instrumentRef = 'instrument-uuid';
    component.submit();
    expect(component.error()).toBe('La organización ya posee una relación InstrumentAccess para este instrumento.');
  });
});
