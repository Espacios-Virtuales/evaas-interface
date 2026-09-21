import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminInstrumentAccessService } from '../../../../core/services/admin-instrument-access.service';
import { AdminInstrumentService } from '../../../../core/services/admin-instrument.service';
import { AdminOrganizationInstrumentAccessComponent } from './admin-organization-instrument-access.component';

describe('AdminOrganizationInstrumentAccessComponent', () => {
  let access: jasmine.SpyObj<AdminInstrumentAccessService>;
  let instruments: jasmine.SpyObj<AdminInstrumentService>;
  const organizationRef = 'c95cba5d-e1db-4a63-a3a0-5e9e53d90a0c';
  const enabled = {
    canonicalId: 'access-enabled', organizationRef, instrumentRef: 'instrument-liora', instrumentKey: 'LIORA', status: 'ENABLED' as const,
  };
  const revoked = {
    canonicalId: 'access-revoked', organizationRef, instrumentRef: 'instrument-eda', instrumentKey: 'EDA', status: 'REVOKED' as const,
  };

  beforeEach(() => {
    access = jasmine.createSpyObj<AdminInstrumentAccessService>('AdminInstrumentAccessService', [
      'getOrganizationInstrumentAccess', 'grantInstrumentAccess', 'updateInstrumentAccessStatus',
    ]);
    access.getOrganizationInstrumentAccess.and.returnValue(of([]));
    instruments = jasmine.createSpyObj<AdminInstrumentService>('AdminInstrumentService', ['getInstruments']);
    instruments.getInstruments.and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        { provide: AdminInstrumentAccessService, useValue: access },
        { provide: AdminInstrumentService, useValue: instruments },
      ],
    });
  });

  function create(): AdminOrganizationInstrumentAccessComponent {
    return TestBed.runInInjectionContext(() => new AdminOrganizationInstrumentAccessComponent());
  }

  it('loads InstrumentAccess with Organization.canonicalId and maps an empty response', () => {
    const component = create();
    component.organizationRef = organizationRef;
    expect(access.getOrganizationInstrumentAccess).toHaveBeenCalledWith(organizationRef);
    expect(component.state()).toBe('EMPTY');
  });

  it('does not request InstrumentAccess when canonicalId is absent', () => {
    const component = create();
    component.organizationRef = '';
    expect(access.getOrganizationInstrumentAccess).not.toHaveBeenCalled();
    expect(component.error()).toBe('La organización no expone una referencia canónica utilizable.');
  });

  it('keeps REVOKED and every persisted access out of grant candidates', () => {
    access.getOrganizationInstrumentAccess.and.returnValue(of([enabled, revoked]));
    instruments.getInstruments.and.returnValue(of([
      { canonicalId: 'instrument-liora', key: 'LIORA', status: 'ACTIVE' },
      { canonicalId: 'instrument-eda', key: 'EDA', status: 'ACTIVE' },
      { canonicalId: 'instrument-asariel', key: 'ASARIEL', status: 'ACTIVE' },
    ]));
    const component = create();
    component.organizationRef = organizationRef;
    component.openGrant();
    expect(instruments.getInstruments).toHaveBeenCalled();
    expect(component.availableInstruments()).toEqual([
      { canonicalId: 'instrument-asariel', key: 'ASARIEL', status: 'ACTIVE' },
    ]);
  });

  it('refreshes the canonical collection after successful grant', () => {
    access.getOrganizationInstrumentAccess.and.returnValues(of([]), of([enabled]));
    const component = create();
    component.organizationRef = organizationRef;
    component.onGranted();
    expect(access.getOrganizationInstrumentAccess).toHaveBeenCalledTimes(2);
    expect(component.accesses()).toEqual([enabled]);
    expect(component.success()).toBe('Instrumento habilitado correctamente.');
  });

  it('suspends ENABLED access then refreshes the whole collection', () => {
    access.getOrganizationInstrumentAccess.and.returnValues(of([enabled]), of([{ ...enabled, status: 'SUSPENDED' as const }]));
    access.updateInstrumentAccessStatus.and.returnValue(of({ ...enabled, status: 'SUSPENDED' as const }));
    const component = create();
    component.organizationRef = organizationRef;
    component.requestStatus(enabled, 'SUSPENDED');
    expect(access.updateInstrumentAccessStatus).toHaveBeenCalledWith(
      organizationRef, 'access-enabled', { status: 'SUSPENDED' },
    );
    expect(component.accesses()[0].status).toBe('SUSPENDED');
  });

  it('requires confirmation for revocation and cancellation makes no PATCH', () => {
    const component = create();
    component.organizationRef = organizationRef;
    component.requestStatus(enabled, 'REVOKED');
    expect(access.updateInstrumentAccessStatus).not.toHaveBeenCalled();
    component.cancelRevoke();
    expect(access.updateInstrumentAccessStatus).not.toHaveBeenCalled();
  });

  it('patches REVOKED only after revocation confirmation', () => {
    access.getOrganizationInstrumentAccess.and.returnValues(of([enabled]), of([{ ...enabled, status: 'REVOKED' as const }]));
    access.updateInstrumentAccessStatus.and.returnValue(of({ ...enabled, status: 'REVOKED' as const }));
    const component = create();
    component.organizationRef = organizationRef;
    component.requestStatus(enabled, 'REVOKED');
    component.confirmRevoke();
    expect(access.updateInstrumentAccessStatus).toHaveBeenCalledWith(
      organizationRef, 'access-enabled', { status: 'REVOKED' },
    );
    expect(component.accesses()[0].status).toBe('REVOKED');
  });

  it('reactivates a REVOKED access instead of granting it again', () => {
    access.getOrganizationInstrumentAccess.and.returnValues(of([revoked]), of([{ ...revoked, status: 'ENABLED' as const }]));
    access.updateInstrumentAccessStatus.and.returnValue(of({ ...revoked, status: 'ENABLED' as const }));
    const component = create();
    component.organizationRef = organizationRef;
    component.requestStatus(revoked, 'ENABLED');
    expect(access.updateInstrumentAccessStatus).toHaveBeenCalledWith(
      organizationRef, 'access-revoked', { status: 'ENABLED' },
    );
  });

  it('isolates an InstrumentAccess collection error in this component', () => {
    access.getOrganizationInstrumentAccess.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    const component = create();
    component.organizationRef = organizationRef;
    expect(component.state()).toBe('FORBIDDEN');
    expect(component.error()).toContain('permisos administrativos');
  });
});
