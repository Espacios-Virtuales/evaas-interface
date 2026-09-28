import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { LioraEvidenceV1Dto } from '../../../../core/models/evaas-contracts.model';
import { MeService } from '../../../../core/services/me.service';
import { AdminCommunicatorInstrumentDetailComponent } from './admin-communicator-instrument-detail.component';

const evidenceFixture: LioraEvidenceV1Dto = {
  instrument: { canonicalId: 'instrument-liora', key: 'LIORA', name: 'Comunicador' },
  organizations: [
    {
      organizationRef: 'org-first',
      organizationName: 'Primera organización',
      instrumentAccess: { canonicalId: 'access-first', status: 'ENABLED' },
      evidence: [
        {
          actionRef: 'action-first-1', notificationType: 'EMAIL', status: 'SENT',
          occurredAt: '2026-09-20T10:00:00Z', sourceReference: 'source-1', resultRef: 'result-1',
        },
        {
          actionRef: 'action-first-2', notificationType: 'SMS', status: 'FAILED',
          occurredAt: '2026-09-21T10:00:00Z', sourceReference: null, resultRef: null,
        },
      ],
    },
    {
      organizationRef: 'org-second',
      organizationName: 'Segunda organización',
      instrumentAccess: { canonicalId: 'access-second', status: 'ENABLED' },
      evidence: [],
    },
  ],
};

describe('AdminCommunicatorInstrumentDetailComponent', () => {
  let fixture: ComponentFixture<AdminCommunicatorInstrumentDetailComponent>;
  let component: AdminCommunicatorInstrumentDetailComponent;
  let me: jasmine.SpyObj<MeService>;

  beforeEach(() => {
    me = jasmine.createSpyObj<MeService>('MeService', ['getMyLioraEvidence']);
    me.getMyLioraEvidence.and.returnValue(of(evidenceFixture));
    TestBed.configureTestingModule({
      imports: [AdminCommunicatorInstrumentDetailComponent],
      providers: [
        { provide: MeService, useValue: me },
        provideRouter([]),
      ],
    });
    fixture = TestBed.createComponent(AdminCommunicatorInstrumentDetailComponent);
    component = fixture.componentInstance;
  });

  it('loads the LIORA governed projection and renders organizations and rows in CORE order', () => {
    fixture.detectChanges();

    expect(me.getMyLioraEvidence).toHaveBeenCalledOnceWith();
    expect(component.state()).toBe('READY');
    const text = fixture.nativeElement.textContent as string;
    expect(text.indexOf('Primera organización')).toBeLessThan(text.indexOf('Segunda organización'));
    expect(text.indexOf('action-first-1')).toBeLessThan(text.indexOf('action-first-2'));
    expect(text).toContain('No hay evidencia para esta organización.');
    expect(text).toContain('ENABLED');
    expect(text).toContain('source-1');
    expect(text).not.toContain('recipient');
    expect(text).not.toContain('provider');
    expect(text).not.toContain('idempotency');
  });

  it('keeps an organization with no evidence visible in READY', () => {
    me.getMyLioraEvidence.and.returnValue(of({
      ...evidenceFixture,
      organizations: [evidenceFixture.organizations[1]],
    }));

    fixture.detectChanges();

    expect(component.state()).toBe('READY');
    expect(fixture.nativeElement.textContent).toContain('Segunda organización');
    expect(fixture.nativeElement.textContent).toContain('No hay evidencia para esta organización.');
  });

  it('uses EMPTY only when CORE returns no organizations', () => {
    me.getMyLioraEvidence.and.returnValue(of({ ...evidenceFixture, organizations: [] }));

    fixture.detectChanges();

    expect(component.state()).toBe('EMPTY');
    expect(fixture.nativeElement.textContent).toContain('No hay organizaciones autorizadas');
  });

  it('keeps LOADING until the request resolves', () => {
    const response = new Subject<LioraEvidenceV1Dto>();
    me.getMyLioraEvidence.and.returnValue(response);

    fixture.detectChanges();
    expect(component.state()).toBe('LOADING');

    response.next(evidenceFixture);
    expect(component.state()).toBe('READY');
    response.complete();
  });

  it('uses ERROR for a failed request instead of treating it as EMPTY', () => {
    me.getMyLioraEvidence.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    fixture.detectChanges();

    expect(component.state()).toBe('ERROR');
    expect(component.error()).toContain('No fue posible cargar');
    expect(component.state()).not.toBe('EMPTY');
  });
});
