import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AccessContextStore } from '../../../core/access/access-context.store';
import { ContextualProjectionStore } from '../../../core/access/contextual-projection.store';
import { ContextualProjectionDto, MyAccessContextDto } from '../../../core/models/evaas-contracts.model';
import { DashboardContextComponent } from './dashboard-context.component';

describe('DashboardContextComponent', () => {
  const accessContext: MyAccessContextDto = {
    email: 'person@example.com',
    enabled: true,
    authorities: [],
    organizations: [],
  };

  const completeProjection: ContextualProjectionDto = {
    version: 'v1',
    identity: { subjectRef: 'subject-1', enabled: true },
    context: { authorities: ['ROLE_USER'], organizationRefs: ['org-1'] },
    capabilities: [{
      organizationRef: 'org-1',
      instrumentAccessRef: 'access-1',
      instrumentRef: 'instrument-1',
      instrumentKey: 'communicator',
    }],
    relationships: [{
      organizationRef: 'org-1',
      organizationName: 'Example Org',
      organizationEnabled: true,
      memberRef: 'member-1',
      role: 'OWNER',
      status: 'ACTIVE',
    }],
    resources: [{
      organizationRef: 'org-1',
      type: 'API',
      key: 'example-api',
      name: 'Example API',
      status: 'ACTIVE',
    }],
    actions: [{ actionKey: 'READ_INSTRUMENT_ACCESS', organizationRef: 'org-1' }],
    results: [{ resultRef: 'result-1', status: 'READY' }],
    evidence: [{ evidenceRef: 'evidence-1', occurredAt: '2026-09-26T12:00:00Z', status: 'RECORDED' }],
  };

  let fixture: ComponentFixture<DashboardContextComponent>;
  let accessStore: {
    loading: ReturnType<typeof signal<boolean>>;
    errorMessage: ReturnType<typeof signal<string | null>>;
    context: ReturnType<typeof signal<MyAccessContextDto | null>>;
    load: jasmine.Spy;
  };
  let projectionStore: {
    state: ReturnType<typeof signal<'LOADING' | 'READY' | 'ERROR'>>;
    loading: ReturnType<typeof signal<boolean>>;
    projection: ReturnType<typeof signal<ContextualProjectionDto | null>>;
    errorMessage: ReturnType<typeof signal<string | null>>;
    load: jasmine.Spy;
  };

  function createComponent(projection: ContextualProjectionDto): void {
    accessStore = {
      loading: signal(false),
      errorMessage: signal(null),
      context: signal(accessContext),
      load: jasmine.createSpy('loadAccessContext').and.returnValue(of(accessContext)),
    };
    projectionStore = {
      state: signal<'LOADING' | 'READY' | 'ERROR'>('READY'),
      loading: signal(false),
      projection: signal<ContextualProjectionDto | null>(projection),
      errorMessage: signal(null),
      load: jasmine.createSpy('loadProjection').and.returnValue(of(projection)),
    };

    TestBed.configureTestingModule({
      imports: [DashboardContextComponent],
      providers: [
        provideRouter([]),
        { provide: AccessContextStore, useValue: accessStore },
        { provide: ContextualProjectionStore, useValue: projectionStore },
      ],
    });
    fixture = TestBed.createComponent(DashboardContextComponent);
    fixture.detectChanges();
  }

  it('renders all eight sections in contract order and shows the action as a descriptor', () => {
    createComponent(completeProjection);

    const container = fixture.nativeElement as HTMLElement;
    const headings = Array.from(container.querySelectorAll('h2'))
      .map((heading: HTMLHeadingElement) => heading.textContent?.trim());
    expect(headings).toEqual([
      'Identidad',
      'Contexto',
      'Capacidades',
      'Relaciones',
      'Recursos',
      'Acciones',
      'Resultados',
      'Evidencia',
    ]);
    expect(fixture.nativeElement.textContent).toContain('subject-1');
    expect(fixture.nativeElement.textContent).toContain('READ_INSTRUMENT_ACCESS');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(accessStore.load).toHaveBeenCalledTimes(1);
    expect(projectionStore.load).toHaveBeenCalledTimes(1);
  });

  it('keeps collection sections visible with explicit empty states and invents no entries', () => {
    const emptyProjection: ContextualProjectionDto = {
      version: 'v1',
      identity: { subjectRef: 'subject-1', enabled: false },
      context: { authorities: [], organizationRefs: [] },
      capabilities: [],
      relationships: [],
      resources: [],
      actions: [],
      results: [],
      evidence: [],
    };
    createComponent(emptyProjection);

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Sin capacidades disponibles en este contexto.');
    expect(content).toContain('Sin relaciones disponibles en este contexto.');
    expect(content).toContain('Sin recursos disponibles en este contexto.');
    expect(content).toContain('Sin acciones disponibles en este contexto.');
    expect(content).toContain('Sin resultados disponibles en este contexto.');
    expect(content).toContain('Sin evidencia disponible en este contexto.');
    expect(fixture.nativeElement.querySelectorAll('h2').length).toBe(8);
    expect(content).not.toContain('READ_INSTRUMENT_ACCESS');
    expect(content).not.toContain('result-1');
    expect(content).not.toContain('evidence-1');
  });
});
