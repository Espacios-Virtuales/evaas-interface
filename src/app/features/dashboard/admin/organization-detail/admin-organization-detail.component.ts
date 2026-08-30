import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, distinctUntilChanged, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import {
  AdminResourceDto,
  AdminToolAccessDto,
  OrganizationDto,
} from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminResourceCreateModalComponent } from './admin-resource-create-modal.component';
import { AdminToolAccessCreateModalComponent } from './admin-tool-access-create-modal.component';

interface DetailField {
  label: string;
  value: unknown;
  kind?: 'date' | 'status' | 'url' | 'structured';
}

interface OrganizationDetailResult {
  organization: OrganizationDto;
  toolAccess: AdminToolAccessDto[];
  resources: AdminResourceDto[];
  resourceError: unknown | null;
}

type ResourceCollectionState =
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
  selector: 'evaas-admin-organization-detail',
  imports: [
    CommonModule,
    RouterLink,
    AdminResourceCreateModalComponent,
    AdminToolAccessCreateModalComponent,
  ],
  templateUrl: './admin-organization-detail.component.html',
  styleUrls: ['./admin-organization-detail.component.scss'],
})
export class AdminOrganizationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminAccess = inject(AdminAccessService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organization = signal<OrganizationDto | null>(null);
  readonly toolAccess = signal<AdminToolAccessDto[]>([]);
  readonly resources = signal<AdminResourceDto[]>([]);
  readonly resourcesState = signal<ResourceCollectionState>('LOADING');
  readonly resourcesError = signal<string | null>(null);
  readonly assignmentModalOpen = signal(false);
  readonly assignmentSuccess = signal<string | null>(null);
  readonly assignmentRefreshError = signal<string | null>(null);
  readonly disablingToolAccessId = signal<number | null>(null);
  readonly disableToolAccessSuccess = signal<string | null>(null);
  readonly disableToolAccessError = signal<string | null>(null);
  readonly resourceCreateModalOpen = signal(false);
  readonly resourceCreateSuccess = signal<string | null>(null);
  readonly selectedResource = signal<AdminResourceDto | null>(null);
  readonly isResourceDetailOpen = signal(false);
  readonly currentOrganizationId = signal<number | null>(null);

  readonly organizationIdentityFields = computed(() => {
    const organization = this.organization();
    if (!organization) return [];

    return [
      { label: 'ID', value: organization.id },
      { label: 'Nombre', value: organization.name },
      { label: 'Tax ID', value: organization.taxId },
      { label: 'Enabled', value: organization.enabled, kind: 'status' as const },
      { label: 'Creada', value: organization.createdAt, kind: 'date' as const },
      { label: 'Actualizada', value: organization.updatedAt, kind: 'date' as const },
    ];
  });

  readonly ownershipFields = computed(() => {
    const organization = this.organization();
    if (!organization) return [];

    return [
      { label: 'Email del responsable (owner)', value: organization.ownerEmail },
      { label: 'ID de usuario responsable (owner)', value: organization.ownerUserId },
    ].filter(field => this.hasValue(field.value));
  });

  readonly hasToolAccess = computed(() => this.toolAccess().length > 0);
  readonly hasResources = computed(() => this.resources().length > 0);
  readonly resourcesAreUnavailable = computed(() =>
    ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'ERROR'].includes(this.resourcesState()),
  );
  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => Number(params.get('id'))),
        distinctUntilChanged(),
        switchMap(id => {
          if (!Number.isInteger(id) || id <= 0) {
            return throwError(() => new Error('Invalid organization id'));
          }

          this.loading.set(true);
          this.error.set(null);
          this.organization.set(null);
          this.toolAccess.set([]);
          this.resources.set([]);
          this.resourcesState.set('LOADING');
          this.resourcesError.set(null);
          this.currentOrganizationId.set(id);
          this.assignmentSuccess.set(null);
          this.resourceCreateSuccess.set(null);
          this.assignmentModalOpen.set(false);
          this.resourceCreateModalOpen.set(false);
          this.closeResourceDetail();

          return this.loadOrganizationDetail(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.organization.set(result.organization);
          this.toolAccess.set(Array.isArray(result.toolAccess) ? result.toolAccess : []);
          this.resources.set(Array.isArray(result.resources) ? result.resources : []);
          if (result.resourceError) {
            this.resourcesError.set(this.resourceCollectionErrorMessage(result.resourceError));
            this.resourcesState.set(this.resourceCollectionErrorState(result.resourceError));
          } else {
            this.resourcesState.set(result.resources.length === 0 ? 'EMPTY' : 'POPULATED');
          }
          this.loading.set(false);
        },
        error: err => {
          console.error('[AdminOrganizationDetail] organization detail load error', err);
          this.organization.set(null);
          this.toolAccess.set([]);
          this.resources.set([]);
          this.resourcesState.set('ERROR');
          this.error.set('No fue posible cargar el detalle de la organizacion.');
          this.loading.set(false);
        },
      });
  }

  openAssignmentModal(): void {
    this.assignmentModalOpen.set(true);
    this.assignmentSuccess.set(null);
    this.assignmentRefreshError.set(null);
    this.disableToolAccessSuccess.set(null);
    this.disableToolAccessError.set(null);
  }

  closeAssignmentModal(): void {
    this.assignmentModalOpen.set(false);
  }

  openResourceCreateModal(): void {
    this.resourceCreateModalOpen.set(true);
    this.resourceCreateSuccess.set(null);
  }

  closeResourceCreateModal(): void {
    this.resourceCreateModalOpen.set(false);
  }

  onResourceCreated(): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) return;
    this.closeResourceCreateModal();
    this.adminAccess.getOrganizationResources(organizationId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: resources => {
        const result = Array.isArray(resources) ? resources : [];
        this.resources.set(result);
        this.resourcesState.set(result.length === 0 ? 'EMPTY' : 'POPULATED');
        this.resourcesError.set(null);
        this.resourceCreateSuccess.set('Recurso creado correctamente.');
      },
      error: err => {
        this.resourcesError.set(this.resourceCollectionErrorMessage(err));
        this.resourcesState.set(this.resourceCollectionErrorState(err));
      },
    });
  }

  onToolAccessCreated(): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) return;
    this.closeAssignmentModal();
    this.adminAccess.getOrganizationToolAccess(organizationId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: toolAccess => {
        this.toolAccess.set(Array.isArray(toolAccess) ? toolAccess : []);
        this.assignmentSuccess.set('Acceso asignado correctamente.');
      },
      error: err => {
        console.error('[AdminOrganizationDetail] tool access refresh error', err);
        this.assignmentRefreshError.set('El acceso fue creado, pero no se pudo actualizar la colección. Recarga la vista para verificarlo.');
      },
    });
  }

  disableToolAccess(access: AdminToolAccessDto): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId || !access.id) return;

    const confirmed = window.confirm(
      '¿Deshabilitar este acceso?\nEsta accion no borra el historial. Solo deshabilita el acceso operativo.',
    );
    if (!confirmed) return;

    this.disablingToolAccessId.set(access.id);
    this.disableToolAccessError.set(null);
    this.disableToolAccessSuccess.set(null);

    this.adminAccess.disableToolAccess(access.id).pipe(
      switchMap(() => this.adminAccess.getOrganizationToolAccess(organizationId)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: toolAccess => {
        this.toolAccess.set(Array.isArray(toolAccess) ? toolAccess : []);
        this.disablingToolAccessId.set(null);
        this.disableToolAccessSuccess.set('Acceso deshabilitado correctamente.');
      },
      error: err => {
        this.disablingToolAccessId.set(null);
        this.disableToolAccessError.set(this.disableToolAccessErrorMessage(err));
      },
    });
  }

  readonly trackToolAccess = (
    index: number,
    access: AdminToolAccessDto | null | undefined,
  ): string | number => access?.id ?? access?.toolKey ?? index;

  readonly trackResource = (
    index: number,
    resource: AdminResourceDto | null | undefined,
  ): string | number => {
    const id = resource?.['id'];
    const key = resource?.['key'] ?? resource?.['resourceKey'];
    return typeof id === 'string' || typeof id === 'number'
      ? id
      : typeof key === 'string' || typeof key === 'number'
        ? key
        : index;
  };

  resourceFields(resource: AdminResourceDto): DetailField[] {
    return [
      { label: 'ID', value: this.valueFromKeys(resource, ['id']) },
      { label: 'Nombre', value: this.valueFromKeys(resource, ['name', 'resourceName']) },
      { label: 'Clave', value: this.valueFromKeys(resource, ['key']) },
      { label: 'Resource key', value: this.valueFromKeys(resource, ['resourceKey']) },
      { label: 'Tipo', value: this.valueFromKeys(resource, ['type', 'resourceType']) },
      { label: 'Tool access ID', value: this.valueFromKeys(resource, ['toolAccessId', 'accessId']) },
      { label: 'Organization ID', value: this.valueFromKeys(resource, ['organizationId']) },
      { label: 'Organization name', value: this.valueFromKeys(resource, ['organizationName']) },
      { label: 'Estado', value: this.valueFromKeys(resource, ['status']), kind: 'status' as const },
      { label: 'Visibilidad', value: this.valueFromKeys(resource, ['visibility']) },
      {
        label: 'URL',
        value: this.valueFromKeys(resource, ['url']),
        kind: 'url' as const,
      },
      {
        label: 'Operational URL',
        value: this.valueFromKeys(resource, ['operationalUrl']),
        kind: 'url' as const,
      },
      { label: 'Creado', value: this.valueFromKeys(resource, ['createdAt']), kind: 'date' as const },
      { label: 'Actualizado', value: this.valueFromKeys(resource, ['updatedAt']), kind: 'date' as const },
      {
        label: 'Metadata / config',
        value: this.valueFromKeys(resource, ['metadataJson', 'metadata', 'config', 'configuration']),
        kind: 'structured' as const,
      },
    ].filter(field => this.hasValue(field.value));
  }

  openResourceDetail(resource: AdminResourceDto): void {
    this.selectedResource.set(resource);
    this.isResourceDetailOpen.set(true);
  }

  closeResourceDetail(): void {
    this.isResourceDetailOpen.set(false);
    this.selectedResource.set(null);
  }

  resourceKey(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['key', 'resourceKey']));
  }

  resourceType(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['type', 'resourceType']));
  }

  resourceStatus(resource: AdminResourceDto): unknown {
    return this.valueFromKeys(resource, ['status']);
  }

  resourceVisibility(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['visibility']));
  }

  resourceToolAccessId(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['toolAccessId', 'accessId']));
  }

  resourceUrl(resource: AdminResourceDto | null): string | null {
    if (!resource) return null;

    const value = this.valueFromKeys(resource, ['url', 'operationalUrl', 'link']);
    return typeof value === 'string' && value ? value : null;
  }

  resourceTitle(resource: AdminResourceDto): string {
    return this.formatValue(
      this.valueFromKeys(resource, ['name', 'resourceName', 'resourceKey', 'key', 'type', 'id']),
    );
  }

  statusClass(value: unknown): string {
    const normalized = this.formatValue(value).toLowerCase();

    if (['true', 'active', 'enabled', 'available', 'ready', 'ok'].includes(normalized)) {
      return 'status-pill status-pill--success';
    }

    if (['false', 'disabled', 'revoked', 'inactive', 'suspended', 'cancelled', 'failed'].includes(normalized)) {
      return 'status-pill status-pill--muted';
    }

    if (['pending', 'processing', 'received'].includes(normalized)) {
      return 'status-pill status-pill--pending';
    }

    return 'status-pill';
  }

  formatValue(value: unknown): string {
    if (!this.hasValue(value)) return '-';
    if (typeof value === 'object') return this.formatStructuredValue(value);
    return String(value);
  }

  formatDate(value: string | undefined | null): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  formatStructuredValue(value: unknown): string {
    if (!this.hasValue(value)) return '-';

    if (typeof value === 'string') {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }

    if (typeof value !== 'object') return String(value);

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  private loadOrganizationDetail(id: number): Observable<OrganizationDetailResult> {
    return forkJoin({
      organization: this.adminAccess.getOrganizationById(id),
      toolAccess: this.adminAccess.getOrganizationToolAccess(id),
      resourceResult: this.adminAccess.getOrganizationResources(id).pipe(
        map(resources => ({ resources: Array.isArray(resources) ? resources : [], resourceError: null })),
        catchError(resourceError => of({ resources: [], resourceError })),
      ),
    }).pipe(
      map(({ organization, toolAccess, resourceResult }) => ({
        organization,
        toolAccess,
        ...resourceResult,
      })),
    );
  }

  private resourceCollectionErrorState(error: unknown): ResourceCollectionState {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    return 'ERROR';
  }

  private resourceCollectionErrorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'Tu sesión no está autorizada para consultar recursos.';
    if (status === 403) return 'No tienes permisos para consultar recursos de esta organización.';
    if (status === 404) return 'La colección de recursos no está disponible para esta organización.';
    if (status === 409) return 'La colección de recursos está en conflicto. Intenta nuevamente.';
    return 'No fue posible cargar los recursos de esta organización.';
  }

  private disableToolAccessErrorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return 'No fue posible deshabilitar el acceso. Intenta nuevamente.';
    }

    if (err.status === 401 || err.status === 403) {
      return 'No tienes permisos suficientes para deshabilitar este acceso.';
    }

    if (err.status === 404) {
      return 'No se encontro el acceso indicado.';
    }

    if (err.status === 409) {
      return 'El acceso no puede deshabilitarse en su estado actual.';
    }

    return 'No fue posible deshabilitar el acceso. Intenta nuevamente.';
  }

  private valueFromKeys(source: AdminResourceDto, keys: string[]): unknown {
    for (const key of keys) {
      const value = source[key];
      if (this.hasValue(value)) return value;
    }

    return undefined;
  }

  private hasValue(value: unknown): boolean {
    return value !== undefined && value !== null && value !== '';
  }
}
