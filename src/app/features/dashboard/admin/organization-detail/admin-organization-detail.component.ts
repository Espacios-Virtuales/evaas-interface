import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, distinctUntilChanged, forkJoin, map, switchMap, throwError } from 'rxjs';
import {
  AdminResourceDto,
  AdminToolAccessDto,
  CreateToolAccessPayload,
  OrganizationDto,
} from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';

interface DetailField {
  label: string;
  value: unknown;
  kind?: 'date' | 'status' | 'url' | 'structured';
}

interface AssignmentForm {
  toolKey: string;
  userId: string;
  externalCommerceActivationId: string;
}

interface OrganizationDetailResult {
  organization: OrganizationDto;
  toolAccess: AdminToolAccessDto[];
  resources: AdminResourceDto[];
}

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
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organization = signal<OrganizationDto | null>(null);
  readonly toolAccess = signal<AdminToolAccessDto[]>([]);
  readonly resources = signal<AdminResourceDto[]>([]);
  readonly assignmentOpen = signal(false);
  readonly assignmentSubmitting = signal(false);
  readonly assignmentSuccess = signal<string | null>(null);
  readonly assignmentError = signal<string | null>(null);
  readonly assignmentValidation = signal<string | null>(null);
  readonly currentOrganizationId = signal<number | null>(null);

  assignmentForm: AssignmentForm = {
    toolKey: '',
    userId: '',
    externalCommerceActivationId: '',
  };

  readonly suggestedToolKeys = [
    'EVAAS_ADMIN',
    'FARQBIM_DASHBOARD',
    'CRYPTO_ANALYTICS_API',
    'ESCUELA_MISTICA_PORTAL',
    'WORDPRESS_SITE',
    'POWER_BI_DASHBOARD',
    'REPOSITORY_ACCESS',
  ];

  readonly organizationFields = computed(() => {
    const organization = this.organization();
    if (!organization) return [];

    return [
      { label: 'ID', value: organization.id },
      { label: 'Nombre', value: organization.name },
      { label: 'Tax ID', value: organization.taxId },
      { label: 'Owner email', value: organization.ownerEmail },
      { label: 'Owner user ID', value: organization.ownerUserId },
      { label: 'Estado', value: organization.status, kind: 'status' as const },
      { label: 'Creada', value: organization.createdAt, kind: 'date' as const },
      { label: 'Actualizada', value: organization.updatedAt, kind: 'date' as const },
    ].filter(field => this.hasValue(field.value));
  });

  readonly hasToolAccess = computed(() => this.toolAccess().length > 0);
  readonly hasResources = computed(() => this.resources().length > 0);
  readonly showToolAccessToolName = computed(() => this.hasToolAccessValue('toolName'));
  readonly showToolAccessGrantedAt = computed(() => this.hasToolAccessValue('grantedAt'));
  readonly showToolAccessRevokedAt = computed(() => this.hasToolAccessValue('revokedAt'));

  readonly operationalStatements = computed(() => [
    this.hasToolAccess()
      ? 'Organizacion con accesos registrados.'
      : 'Organizacion sin accesos registrados.',
    this.hasResources()
      ? 'Organizacion con recursos asociados.'
      : 'Organizacion sin recursos asociados.',
  ]);

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
          this.currentOrganizationId.set(id);
          this.assignmentSuccess.set(null);
          this.closeAssignmentForm();

          return this.loadOrganizationDetail(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.organization.set(result.organization);
          this.toolAccess.set(Array.isArray(result.toolAccess) ? result.toolAccess : []);
          this.resources.set(Array.isArray(result.resources) ? result.resources : []);
          this.loading.set(false);
        },
        error: err => {
          console.error('[AdminOrganizationDetail] organization detail load error', err);
          this.organization.set(null);
          this.toolAccess.set([]);
          this.resources.set([]);
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
  }

  closeAssignmentForm(): void {
    this.assignmentOpen.set(false);
    this.assignmentSubmitting.set(false);
    this.assignmentError.set(null);
    this.assignmentValidation.set(null);
    this.resetAssignmentForm();
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

  useSuggestedToolKey(toolKey: string): void {
    this.assignmentForm.toolKey = toolKey;
    this.assignmentValidation.set(null);
  }

  trackToolAccess(index: number, access: AdminToolAccessDto): string {
    return this.hasValue(access.id) ? String(access.id) : `${access.toolKey}-${index}`;
  }

  trackResource(index: number, resource: AdminResourceDto): string {
    const id = this.valueFromKeys(resource, ['id']);
    return this.hasValue(id) ? String(id) : String(index);
  }

  resourceFields(resource: AdminResourceDto): DetailField[] {
    return [
      { label: 'ID', value: this.valueFromKeys(resource, ['id']) },
      { label: 'Nombre', value: this.valueFromKeys(resource, ['name', 'resourceName']) },
      { label: 'Clave', value: this.valueFromKeys(resource, ['resourceKey', 'key']) },
      { label: 'Tipo', value: this.valueFromKeys(resource, ['type', 'resourceType']) },
      { label: 'Estado', value: this.valueFromKeys(resource, ['status']), kind: 'status' as const },
      { label: 'Visibilidad', value: this.valueFromKeys(resource, ['visibility']) },
      {
        label: 'URL',
        value: this.valueFromKeys(resource, ['url', 'operationalUrl', 'link']),
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

  resourceTitle(resource: AdminResourceDto): string {
    return this.formatValue(
      this.valueFromKeys(resource, ['name', 'resourceName', 'resourceKey', 'key', 'type', 'id']),
    );
  }

  statusClass(value: unknown): string {
    const normalized = this.formatValue(value).toLowerCase();

    if (['active', 'enabled', 'available', 'ready', 'ok'].includes(normalized)) {
      return 'status-pill status-pill--success';
    }

    if (['disabled', 'revoked', 'inactive', 'suspended', 'cancelled', 'failed'].includes(normalized)) {
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
      resources: this.adminAccess.getOrganizationResources(id),
    });
  }

  private buildAssignmentPayload(organizationId: number): CreateToolAccessPayload | null {
    const toolKey = this.assignmentForm.toolKey.trim();
    const userId = this.parseOptionalPositiveInteger(this.assignmentForm.userId, 'userId');
    const externalCommerceActivationId = this.parseOptionalPositiveInteger(
      this.assignmentForm.externalCommerceActivationId,
      'externalCommerceActivationId',
    );

    if (!toolKey) {
      this.assignmentValidation.set('toolKey es requerido.');
      return null;
    }

    if (userId === null || externalCommerceActivationId === null) return null;

    return {
      organizationId,
      toolKey,
      ...(userId !== undefined ? { userId } : {}),
      ...(externalCommerceActivationId !== undefined ? { externalCommerceActivationId } : {}),
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

  private resetAssignmentForm(): void {
    this.assignmentForm = {
      toolKey: '',
      userId: '',
      externalCommerceActivationId: '',
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

  private hasToolAccessValue(
    key: keyof Pick<
      AdminToolAccessDto,
      'toolName' | 'grantedAt' | 'revokedAt'
    >,
  ): boolean {
    return this.toolAccess().some(access => this.hasValue(access[key]));
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
