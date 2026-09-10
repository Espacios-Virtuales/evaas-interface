import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminInstrumentService } from '../../../../core/services/admin-instrument.service';
import { AdminInstrumentsOverviewComponent } from './admin-instruments-overview.component';

describe('AdminInstrumentsOverviewComponent', () => {
  it('projects canonicalId and status from the canonical catalogue', () => {
    const instruments = jasmine.createSpyObj<AdminInstrumentService>('AdminInstrumentService', ['getInstruments']);
    instruments.getInstruments.and.returnValue(of([
      { canonicalId: 'instrument-1', key: 'LIORA', status: 'ACTIVE' },
    ]));
    TestBed.configureTestingModule({ providers: [{ provide: AdminInstrumentService, useValue: instruments }] });

    const component = TestBed.runInInjectionContext(() => new AdminInstrumentsOverviewComponent());
    component.ngOnInit();

    expect(component.instruments()).toEqual([
      { canonicalId: 'instrument-1', key: 'LIORA', status: 'ACTIVE' },
    ]);
    expect(component.trackInstrument(0, component.instruments()[0])).toBe('instrument-1');
  });
});
