import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { AdminInstrumentAccessService } from '../../../../core/services/admin-instrument-access.service';
import { AdminResourceStatusModalComponent } from './admin-resource-status-modal.component';

describe('AdminResourceStatusModalComponent', () => {
  let component: AdminResourceStatusModalComponent;
  let fixture: ComponentFixture<AdminResourceStatusModalComponent>;
  let service: jasmine.SpyObj<AdminResourceService>;
  let instrumentAccess: jasmine.SpyObj<AdminInstrumentAccessService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['updateResourceStatus']);
    instrumentAccess = jasmine.createSpyObj<AdminInstrumentAccessService>(
      'AdminInstrumentAccessService',
      ['getOrganizationInstrumentAccess', 'grantInstrumentAccess', 'updateInstrumentAccessStatus'],
    );
    await TestBed.configureTestingModule({
      imports: [AdminResourceStatusModalComponent],
      providers: [
        { provide: AdminResourceService, useValue: service },
        { provide: AdminInstrumentAccessService, useValue: instrumentAccess },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminResourceStatusModalComponent);
    component = fixture.componentInstance;
    component.resource = { id: 7, name: 'Gateway', status: 'ACTIVE' };
  });

  it('offers every Resource status and sends only status, including the same status', () => {
    service.updateResourceStatus.and.returnValue(of({ id: 7, status: 'ACTIVE' }));
    const updated = spyOn(component.updated, 'emit');

    component.submit();

    expect(component.statuses).toEqual(['PLANNED', 'ACTIVE', 'MAINTENANCE', 'DISABLED']);
    expect(service.updateResourceStatus).toHaveBeenCalledWith(7, { status: 'ACTIVE' });
    expect(instrumentAccess.updateInstrumentAccessStatus).not.toHaveBeenCalled();
    expect(updated).toHaveBeenCalled();
  });

  it('does not PATCH when cancelled', () => {
    const cancelled = spyOn(component.cancelled, 'emit');

    component.cancel();

    expect(cancelled).toHaveBeenCalled();
    expect(service.updateResourceStatus).not.toHaveBeenCalled();
  });

  it('keeps the operation isolated and explains a missing Resource', () => {
    service.updateResourceStatus.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const updated = spyOn(component.updated, 'emit');

    component.status = 'DISABLED';
    component.submit();

    expect(updated).not.toHaveBeenCalled();
    expect(component.requestState()).toBe('NOT_FOUND');
    expect(component.error()).toContain('ya no está disponible');
  });
});
