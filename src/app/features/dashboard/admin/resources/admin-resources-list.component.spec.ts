import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { AdminResourceDto } from '../../../../core/models/evaas-contracts.model';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { AdminResourcesListComponent } from './admin-resources-list.component';

describe('AdminResourcesListComponent', () => {
  const firstResource: AdminResourceDto = {
    id: 1,
    organizationId: 1,
    organizationName: 'Alpha',
    type: 'API',
    key: 'H08_E2E_RESOURCE',
    name: 'E2E Resource',
    status: 'PLANNED',
    visibility: 'PRIVATE',
  };
  const secondResource: AdminResourceDto = {
    id: 2,
    organizationId: 2,
    organizationName: 'Beta',
    type: 'STORAGE',
    key: 'SECOND_RESOURCE',
    name: 'Second Resource',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
  };

  let service: jasmine.SpyObj<AdminResourceService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['getResources']);
    service.getResources.and.returnValue(of([firstResource, secondResource]));

    await TestBed.configureTestingModule({
      imports: [AdminResourcesListComponent],
      providers: [
        { provide: AdminResourceService, useValue: service },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('renders every returned Resource through the template trackBy path', () => {
    const fixture = TestBed.createComponent(AdminResourcesListComponent);

    expect(() => fixture.detectChanges()).not.toThrow();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>;
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('H08_E2E_RESOURCE');
    expect(rows[0].textContent).toContain('E2E Resource');
    expect(rows[1].textContent).toContain('SECOND_RESOURCE');
    expect(rows[1].textContent).toContain('Second Resource');
  });

  it('tracks Resources by their stable canonical numeric id', () => {
    const fixture = TestBed.createComponent(AdminResourcesListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.trackResource(0, firstResource)).toBe(1);
    expect(component.trackResource(99, { ...firstResource, name: 'Updated name' })).toBe(1);
    expect(component.trackResource(0, secondResource)).toBe(2);
  });

  it('keeps absent detail values explicit', () => {
    const fixture = TestBed.createComponent(AdminResourcesListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const resource: AdminResourceDto = {
      id: 7,
      name: 'Gateway',
      key: 'GATEWAY',
      type: 'API',
      status: 'ACTIVE',
    };

    component.openResourceDetail(resource);

    expect(component.selectedResource()).toEqual(resource);
    expect(component.resourceFields(resource).find(field => field.label === 'Visibilidad')?.value).toBeUndefined();
  });

  it('preserves loading and empty collection states', () => {
    const response = new Subject<AdminResourceDto[]>();
    service.getResources.and.returnValue(response);
    const fixture = TestBed.createComponent(AdminResourcesListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cargando recursos...');

    response.next([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay recursos registrados todavía.');
    expect(fixture.nativeElement.querySelector('tbody')).toBeNull();
  });

  it('preserves the error collection state', () => {
    service.getResources.and.returnValue(throwError(() => new Error('offline')));
    spyOn(console, 'error');
    const fixture = TestBed.createComponent(AdminResourcesListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No fue posible cargar los recursos.');
    expect(fixture.nativeElement.querySelector('tbody')).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('replaces the collection item with the confirmed lifecycle response', () => {
    const fixture = TestBed.createComponent(AdminResourcesListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const disabled: AdminResourceDto = { ...firstResource, status: 'DISABLED' };
    component.onResourceStatusUpdated(disabled);

    expect(service.getResources).toHaveBeenCalledTimes(1);
    expect(component.resources()).toEqual([disabled, secondResource]);
    expect(component.resourceStatusSuccess()).toContain('actualizado');
  });

  it('keeps the confirmed collection until a status response is received', () => {
    const fixture = TestBed.createComponent(AdminResourcesListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.openResourceStatusModal(firstResource);

    expect(component.resources()).toEqual([firstResource, secondResource]);
    expect(component.resourceStatusModalResource()).toEqual(firstResource);
  });
});
