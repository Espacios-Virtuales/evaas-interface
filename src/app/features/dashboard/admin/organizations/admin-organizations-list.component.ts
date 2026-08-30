import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  CreateOrganizationRequest,
  OrganizationDto,
} from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';

type OrganizationFilter = 'ALL' | 'ENABLED' | 'DISABLED';
type OrganizationCollectionState =
  | 'LOADING'
  | 'EMPTY'
  | 'POPULATED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'ERROR';

@Component({
  standalone: true,
  selector: 'evaas-admin-organizations-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-organizations-list.component.html',
  styleUrls: ['./admin-organizations-list.component.scss'],
})
export class AdminOrganizationsListComponent implements OnInit {
  private readonly adminAccess = inject(AdminAccessService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly collectionState = signal<OrganizationCollectionState>('LOADING');
  readonly error = signal<string | null>(null);
  readonly organizations = signal<OrganizationDto[]>([]);
  readonly activeFilter = signal<OrganizationFilter>('ALL');
  readonly updatingOrganizationId = signal<number | null>(null);
  readonly statusError = signal<string | null>(null);
  readonly statusSuccess = signal<string | null>(null);
  readonly createModalOpen = signal(false);
  readonly createState = signal<OperationRequestState>('IDLE');
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    taxId: [''],
    ownerUserId: this.fb.control<number | null>(null),
  });

  readonly loading = computed(() => this.collectionState() === 'LOADING');
  readonly isEmpty = computed(() => this.collectionState() === 'EMPTY');
  readonly isError = computed(() =>
    ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'ERROR'].includes(this.collectionState()),
  );

  readonly showId = computed(() => this.hasKnownValue('id'));
  readonly showName = computed(() => this.hasKnownValue('name'));
  readonly showStatus = computed(() => this.hasKnownValue('status'));
  readonly showCreatedAt = computed(() => this.hasKnownValue('createdAt'));
  readonly showUpdatedAt = computed(() => this.hasKnownValue('updatedAt'));

  ngOnInit(): void {
    this.load();
  }

  load(filter = this.activeFilter()): void {
    this.activeFilter.set(filter);
    this.collectionState.set('LOADING');
    this.error.set(null);

    this.adminAccess.getOrganizations(this.filterEnabledValue(filter)).subscribe({
      next: organizations => {
        const result = Array.isArray(organizations) ? organizations : [];
        this.organizations.set(result);
        this.collectionState.set(result.length === 0 ? 'EMPTY' : 'POPULATED');
      },
      error: err => {
        console.error('[AdminOrganizationsList] organizations load error', err);
        this.organizations.set([]);
        this.error.set(this.collectionErrorMessage(err));
        this.collectionState.set(this.collectionErrorState(err));
      },
    });
  }

  updateOrganizationStatus(organization: OrganizationDto, enabled: boolean): void {
    this.updatingOrganizationId.set(organization.id);
    this.statusError.set(null);
    this.statusSuccess.set(null);

    this.adminAccess.updateOrganizationStatus(organization.id, enabled).subscribe({
      next: updated => {
        this.organizations.update(organizations => organizations.map(item =>
          item.id === organization.id ? { ...item, ...updated, enabled } : item,
        ));
        this.updatingOrganizationId.set(null);
        this.statusSuccess.set(enabled ? 'Organización habilitada correctamente.' : 'Organización deshabilitada correctamente.');
      },
      error: err => {
        console.error('[AdminOrganizationsList] organization status update error', err);
        this.updatingOrganizationId.set(null);
        this.statusError.set(this.statusErrorMessage(err));
      },
    });
  }

  isEnabled(organization: OrganizationDto): boolean {
    return organization.enabled === true;
  }

  openCreateModal(): void {
    this.createForm.reset({ name: '', taxId: '', ownerUserId: null });
    this.createState.set('IDLE');
    this.createError.set(null);
    this.createSuccess.set(null);
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    if (this.createState() === 'SUBMITTING') return;
    this.createModalOpen.set(false);
    this.createState.set('IDLE');
    this.createError.set(null);
  }

  createOrganization(): void {
    if (this.createState() === 'SUBMITTING') return;
    if (!this.createForm.controls.name.value.trim()) {
      this.createForm.controls.name.setErrors({ required: true });
    }

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.createState.set('VALIDATION_ERROR');
      this.createError.set(null);
      return;
    }

    this.createState.set('SUBMITTING');
    this.createError.set(null);
    this.createSuccess.set(null);

    this.adminAccess.createOrganization(this.createPayload()).subscribe({
      next: organization => {
        this.createState.set('SUCCESS');
        this.createModalOpen.set(false);
        this.createSuccess.set('Organizacion creada correctamente.');
        this.load();

        if (organization?.id) {
          this.router.navigate(['/dashboard/admin/organizations', organization.id]);
        }
      },
      error: err => {
        console.error('[AdminOrganizationsList] organization create error', err);
        const presentation = mapOperationHttpError(err, {
          fallback: 'No fue posible crear la organizacion.',
          unauthorized: 'Tu sesión no está autorizada para crear organizaciones.',
          forbidden: 'No tienes permisos para crear organizaciones.',
          notFound: 'El contexto requerido para crear la organización ya no está disponible.',
          conflict: 'La organización entra en conflicto con el estado actual.',
        });
        this.createState.set(presentation.state);
        this.createError.set(presentation.message);
      },
    });
  }

  trackOrganization(index: number, organization: OrganizationDto): string {
    return organization.id === undefined || organization.id === null ? String(index) : String(organization.id);
  }

  formatValue(value: string | number | undefined): string {
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
  }

  formatDate(value: string | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  private hasKnownValue(key: keyof Pick<OrganizationDto, 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'>): boolean {
    return this.organizations().some(organization => {
      const value = organization[key];
      return value !== undefined && value !== null && value !== '';
    });
  }

  private filterEnabledValue(filter: OrganizationFilter): boolean | undefined {
    if (filter === 'ENABLED') return true;
    if (filter === 'DISABLED') return false;
    return undefined;
  }

  private collectionErrorState(error: unknown): OrganizationCollectionState {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    return 'ERROR';
  }

  private collectionErrorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'Tu sesión no está autorizada para consultar organizaciones.';
    if (status === 403) return 'No tienes permisos para consultar organizaciones.';
    if (status === 404) return 'La colección de organizaciones no está disponible.';
    if (status === 409) return 'La colección de organizaciones está en conflicto. Intenta nuevamente.';
    return 'No fue posible cargar las organizaciones.';
  }

  private statusErrorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 400) return 'La solicitud de cambio de estado es inválida.';
    if (status === 401) return 'Tu sesión no está autorizada para cambiar el estado.';
    if (status === 403) return 'No tienes permisos para cambiar el estado de esta organización.';
    if (status === 404) return 'La organización ya no existe o no está disponible.';
    if (status === 409) return 'No se puede cambiar el estado mientras existan dependencias activas. Revisa la operación y reintenta.';
    return 'No fue posible cambiar el estado de la organización.';
  }

  private createPayload(): CreateOrganizationRequest {
    const value = this.createForm.getRawValue();
    const payload: CreateOrganizationRequest = { name: value.name.trim() };
    const taxId = value.taxId.trim();

    if (taxId) {
      payload.taxId = taxId;
    }

    if (value.ownerUserId !== null && value.ownerUserId !== undefined) {
      payload.ownerUserId = value.ownerUserId;
    }

    return payload;
  }
}
