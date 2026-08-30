import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { AdminResourceCreateModalComponent } from './admin-resource-create-modal.component';

describe('AdminResourceCreateModalComponent', () => {
  let component: AdminResourceCreateModalComponent;
  let fixture: ComponentFixture<AdminResourceCreateModalComponent>;
  let service: jasmine.SpyObj<AdminResourceService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<AdminResourceService>('AdminResourceService', ['createResource']);
    await TestBed.configureTestingModule({
      imports: [AdminResourceCreateModalComponent],
      providers: [{ provide: AdminResourceService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminResourceCreateModalComponent);
    component = fixture.componentInstance;
    component.organizationId = 7;
    component.organizationName = 'EVAAS Operations';
  });

  it('sends the preserved resource payload and emits success', () => {
    service.createResource.and.returnValue(of({}));
    const created = spyOn(component.created, 'emit');
    component.form = {
      name: 'Gateway', type: 'API', key: 'GATEWAY', toolAccessId: '',
      url: 'https://example.com', status: 'ACTIVE', visibility: 'ADMIN_ONLY', metadataJson: '{"owner":"ops"}',
    };

    component.submit();

    expect(service.createResource).toHaveBeenCalledWith({
      organizationId: 7, name: 'Gateway', type: 'API', key: 'GATEWAY',
      url: 'https://example.com', status: 'ACTIVE', visibility: 'ADMIN_ONLY', metadataJson: '{"owner":"ops"}',
    });
    expect(created).toHaveBeenCalled();
  });

  it('keeps the modal operation open on request error', () => {
    service.createResource.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const created = spyOn(component.created, 'emit');
    component.form.name = 'Gateway';

    component.submit();

    expect(created).not.toHaveBeenCalled();
    expect(component.error()).toContain('conflicto');
    expect(component.submitting()).toBeFalse();
  });
});
