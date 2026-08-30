import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, distinctUntilChanged, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import {
  AdminResourceDto,
  AdminToolAccessDto,
  AdminUserLookupDto,
  CreateAdminResourcePayload,
  CreateToolAccessPayload,
  OrganizationDto,
} from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';

interface DetailField {
  label: string;
  value: unknown;
  kind?: 'date' | 'status' | 'url' | 'structured';
}

interface AssignmentForm {
  toolKey: string;
  userEmail: string;
  externalCommerceActivationId: string;
}

interface ResourceForm {
  name: string;
  type: string;
  key: string;
  toolAccessId: string;
  url: string;
  status: string;
  visibility: string;
  metadataJson: string;
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-organization-detail.component.html',
  styleUrls: ['./admin-organization-detail.component.scss'],
})
export class AdminOrganizationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminAccess = inject(AdminAccessService);
  private readonly adminResources = inject(AdminResourceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organization = signal<OrganizationDto | null>(null);
  readonly toolAccess = signal<AdminToolAccessDto[]>([]);
  readonly resources = signal<AdminResourceDto[]>([]);
  readonly resourcesState = signal<ResourceCollectionState>('LOADING');
  readonly resourcesError = signal<string | null>(null);
  readonly assignmentOpen = signal(false);
  readonly assignmentSubmitting = signal(false);
  readonly assignmentSuccess = signal<string | null>(null);
  readonly assignmentError = signal<string | null>(null);
  readonly assignmentValidation = signal<string | null>(null);
  readonly userLookupLoading = signal(false);
  readonly userLookupError = signal<string | null>(null);
  readonly selectedUser = signal<AdminUserLookupDto | null>(null);
  readonly selectedUserId = signal<number | null>(null);
  readonly disablingToolAccessId = signal<number | null>(null);
  readonly disableToolAccessSuccess = signal<string | null>(null);
  readonly disableToolAccessError = signal<string | null>(null);
  readonly resourceCreateOpen = signal(false);
  readonly resourceCreateSubmitting = signal(false);
  readonly resourceCreateSuccess = signal<string | null>(null);
  readonly resourceCreateError = signal<string | null>(null);
  readonly resourceCreateValidation = signal<string | null>(null);
  readonly selectedResource = signal<AdminResourceDto | null>(null);
  readonly isResourceDetailOpen = signal(false);
  readonly currentOrganizationId = signal<number | null>(null);

  assignmentForm: AssignmentForm = {
    toolKey: '',
    userEmail: '',
    externalCommerceActivationId: '',
  };

  resourceForm: ResourceForm = {
    name: '',
    type: 'API',
    key: '',
    toolAccessId: '',
    url: '',
    status: 'ACTIVE',
    visibility: 'ADMIN_ONLY',
    metadataJson: '',
  };

  readonly suggestedToolKeys = [
    'EVAAS_ADMIN_OPERATIONS',
    'EVAAS_WORKFLOW',
    'EVAAS_LANDING_LAT',
  ];

  readonly suggestedResourceTypes = [
    'API',
    'WORDPRESS',
    'VPS',
    'POWER_BI',
    'REPOSITORY',
    'DASHBOARD',
    'WORKER',
    'DOCUMENTATION',
    'OTHER',
  ];

  readonly suggestedResourceStatuses = ['PLANNED', 'ACTIVE', 'MAINTENANCE', 'DISABLED'];

  readonly suggestedResourceVisibilities = ['ADMIN_ONLY', 'USER_VISIBLE'];

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
          this.closeAssignmentForm();
          this.closeResourceCreateForm();
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

  openAssignmentForm(): void {
    this.assignmentOpen.set(true);
    this.assignmentSuccess.set(null);
    this.assignmentError.set(null);
    this.assignmentValidation.set(null);
    this.disableToolAccessSuccess.set(null);
    this.disableToolAccessError.set(null);
  }

  closeAssignmentForm(): void {
    this.assignmentOpen.set(false);
    this.assignmentSubmitting.set(false);
    this.assignmentError.set(null);
    this.assignmentValidation.set(null);
    this.userLookupLoading.set(false);
    this.userLookupError.set(null);
    this.selectedUser.set(null);
    this.selectedUserId.set(null);
    this.resetAssignmentForm();
  }

  openResourceCreateForm(): void {
    this.resourceCreateOpen.set(true);
    this.resourceCreateSuccess.set(null);
    this.resourceCreateError.set(null);
    this.resourceCreateValidation.set(null);
  }

  closeResourceCreateForm(): void {
    this.resourceCreateOpen.set(false);
    this.resourceCreateSubmitting.set(false);
    this.resourceCreateError.set(null);
    this.resourceCreateValidation.set(null);
    this.resetResourceForm();
  }

  submitResourceCreate(): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) {
      this.resourceCreateValidation.set('No se pudo determinar la organizacion desde la ruta actual.');
      return;
    }

    const payload = this.buildResourceCreatePayload(organizationId);
    if (!payload) return;

    this.resourceCreateSubmitting.set(true);
    this.resourceCreateError.set(null);
    this.resourceCreateValidation.set(null);
    this.resourceCreateSuccess.set(null);

    this.adminResources.createResource(payload).pipe(
      switchMap(() => this.adminAccess.getOrganizationResources(organizationId)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: resources => {
        const result = Array.isArray(resources) ? resources : [];
        this.resources.set(result);
        this.resourcesState.set(result.length === 0 ? 'EMPTY' : 'POPULATED');
        this.resourcesError.set(null);
        this.resourceCreateSubmitting.set(false);
        this.resourceCreateSuccess.set('Recurso creado correctamente.');
        this.closeResourceCreateForm();
      },
      error: err => {
        this.resourceCreateSubmitting.set(false);
        this.resourceCreateError.set(this.resourceCreateErrorMessage(err));
      },
    });
  }

  submitAssignment(): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) {
      this.assignmentValidation.set('No se pudo determinar la organizacion desde la ruta actual.');
      return;
    }

    const payload = this.buildAssignmentPayload(organizationId);
    if (!payload) return;

    this.assignmentSubmitting.set(true);
    this.assignmentError.set(null);
    this.assignmentValidation.set(null);
    this.assignmentSuccess.set(null);

    this.adminAccess.createToolAccess(payload).pipe(
      switchMap(() => this.adminAccess.getOrganizationToolAccess(organizationId)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: toolAccess => {
        this.toolAccess.set(Array.isArray(toolAccess) ? toolAccess : []);
        this.assignmentSubmitting.set(false);
        this.assignmentSuccess.set('Acceso asignado correctamente.');
        this.closeAssignmentForm();
      },
      error: err => {
        this.assignmentSubmitting.set(false);
        this.assignmentError.set(this.assignmentErrorMessage(err));
      },
    });
  }

  searchUserByEmail(): void {
    const email = this.assignmentForm.userEmail.trim();
    this.userLookupError.set(null);
    this.assignmentValidation.set(null);
    this.selectedUser.set(null);
    this.selectedUserId.set(null);

    if (!this.isValidEmail(email)) {
      this.userLookupError.set('Ingresa un correo valido antes de buscar.');
      return;
    }

    this.userLookupLoading.set(true);
    this.adminAccess.findUserByEmail(email).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: user => {
        this.userLookupLoading.set(false);
        if (!user?.id) {
          this.userLookupError.set('No encontramos un usuario con ese correo.');
          return;
        }

        this.selectedUser.set(user);
        this.selectedUserId.set(user.id);
      },
      error: err => {
        this.userLookupLoading.set(false);
        this.userLookupError.set(this.userLookupErrorMessage(err));
      },
    });
  }

  clearSelectedUser(): void {
    this.selectedUser.set(null);
    this.selectedUserId.set(null);
    this.userLookupError.set(null);
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

  useSuggestedToolKey(toolKey: string): void {
    this.assignmentForm.toolKey = toolKey;
    this.assignmentValidation.set(null);
  }

  toolAccessLabel(access: AdminToolAccessDto): string {
    const status = this.hasValue(access.status) ? ` - ${access.status}` : '';
    return `${access.toolKey}${status} - ID ${access.id}`;
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

  private buildAssignmentPayload(organizationId: number): CreateToolAccessPayload | null {
    const toolKey = this.assignmentForm.toolKey.trim();
    const selectedUserId = this.selectedUserId();
    const externalCommerceActivationId = this.parseOptionalPositiveInteger(
      this.assignmentForm.externalCommerceActivationId,
      'externalCommerceActivationId',
    );

    if (!toolKey) {
      this.assignmentValidation.set('toolKey es requerido.');
      return null;
    }

    if (!selectedUserId) {
      this.assignmentValidation.set('Busca y selecciona un usuario antes de asignar acceso.');
      return null;
    }

    if (externalCommerceActivationId === null) return null;

    return {
      organizationId,
      toolKey,
      userId: selectedUserId,
      ...(externalCommerceActivationId !== undefined ? { externalCommerceActivationId } : {}),
    };
  }

  private buildResourceCreatePayload(organizationId: number): CreateAdminResourcePayload | null {
    const name = this.resourceForm.name.trim();
    const type = this.resourceForm.type.trim();
    const key = this.resourceForm.key.trim();
    const url = this.resourceForm.url.trim();
    const status = this.resourceForm.status.trim();
    const visibility = this.resourceForm.visibility.trim();
    const metadataJson = this.resourceForm.metadataJson.trim();
    const toolAccessId = this.parseResourceOptionalPositiveInteger(this.resourceForm.toolAccessId, 'toolAccessId');

    if (!name) {
      this.resourceCreateValidation.set('name es requerido.');
      return null;
    }

    if (!type) {
      this.resourceCreateValidation.set('type es requerido.');
      return null;
    }

    if (toolAccessId === null) return null;

    if (toolAccessId !== undefined && !this.toolAccess().some(access => access.id === toolAccessId)) {
      this.resourceCreateValidation.set('toolAccessId debe seleccionarse desde los accesos cargados de esta organizacion.');
      return null;
    }

    if (url && !this.isValidUrl(url)) {
      this.resourceCreateValidation.set('url debe tener formato URL valido.');
      return null;
    }

    if (metadataJson) {
      if (!this.isValidJson(metadataJson)) {
        this.resourceCreateValidation.set('metadataJson debe ser JSON valido.');
        return null;
      }

      if (this.containsSecretLikeContent(metadataJson)) {
        this.resourceCreateValidation.set('metadataJson no debe contener secretos, tokens ni credenciales.');
        return null;
      }
    }

    return {
      organizationId,
      name,
      type,
      ...(key ? { key } : {}),
      ...(toolAccessId !== undefined ? { toolAccessId } : {}),
      ...(url ? { url } : {}),
      ...(status ? { status } : {}),
      ...(visibility ? { visibility } : {}),
      ...(metadataJson ? { metadataJson } : {}),
    };
  }

  private parseOptionalPositiveInteger(value: string, label: string): number | undefined | null {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      this.assignmentValidation.set(`${label} debe ser numerico.`);
      return null;
    }

    return parsed;
  }

  private parseResourceOptionalPositiveInteger(value: string, label: string): number | undefined | null {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      this.resourceCreateValidation.set(`${label} debe ser numerico.`);
      return null;
    }

    return parsed;
  }

  private resetAssignmentForm(): void {
    this.assignmentForm = {
      toolKey: '',
      userEmail: '',
      externalCommerceActivationId: '',
    };
  }

  private resetResourceForm(): void {
    this.resourceForm = {
      name: '',
      type: 'API',
      key: '',
      toolAccessId: '',
      url: '',
      status: 'ACTIVE',
      visibility: 'ADMIN_ONLY',
      metadataJson: '',
    };
  }

  private assignmentErrorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return 'No fue posible asignar el acceso. Intenta nuevamente.';
    }

    if (err.status === 400) {
      return 'El backend rechazo el payload. Revisa toolKey, userId y activationId.';
    }

    if (err.status === 401 || err.status === 403) {
      return 'No tienes permisos suficientes para asignar este acceso.';
    }

    if (err.status === 404) {
      return 'No se encontro la organizacion, el usuario o la activacion indicada.';
    }

    if (err.status === 409) {
      return 'El acceso ya existe o entra en conflicto con el estado actual.';
    }

    return 'No fue posible asignar el acceso. Intenta nuevamente.';
  }

  private userLookupErrorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      if (err instanceof Error && err.message === 'Invalid user lookup response') {
        return 'No pudimos interpretar la respuesta del usuario.';
      }

      return 'No fue posible buscar el usuario. Intenta nuevamente.';
    }

    if (err.status === 404) {
      return 'No encontramos un usuario con ese correo.';
    }

    if (err.status === 401 || err.status === 403) {
      return 'No tienes permisos suficientes para buscar usuarios.';
    }

    return 'No fue posible buscar el usuario. Intenta nuevamente.';
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

  private resourceCreateErrorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return 'No fue posible crear el recurso. Intenta nuevamente.';
    }

    if (err.status === 400) {
      return 'El backend rechazo el payload. Revisa name, type, toolAccessId, url y metadataJson.';
    }

    if (err.status === 401 || err.status === 403) {
      return 'No tienes permisos suficientes para crear recursos en esta organizacion.';
    }

    if (err.status === 404) {
      return 'No se encontro la organizacion o el acceso asociado indicado.';
    }

    if (err.status === 409) {
      return 'El recurso ya existe o entra en conflicto con el estado actual.';
    }

    return 'No fue posible crear el recurso. Intenta nuevamente.';
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isValidJson(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  private containsSecretLikeContent(value: string): boolean {
    return /\b(password|passwd|secret|token|access[_-]?token|api[_-]?key|private[_-]?key|credential|authorization|bearer)\b/i.test(value);
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
