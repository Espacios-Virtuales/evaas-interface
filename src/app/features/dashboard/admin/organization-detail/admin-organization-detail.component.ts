import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, distinctUntilChanged, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import {
  AdminResourceDto,
  AdminToolAccessDto,
  CommunicationActionDto,
  OrganizationMemberDto,
  OrganizationMemberStatus,
  OrganizationDto,
} from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { AdminCommunicationActionService } from '../../../../core/services/admin-communication-action.service';
import { AdminResourceCreateModalComponent } from './admin-resource-create-modal.component';
import { AdminResourceStatusModalComponent } from './admin-resource-status-modal.component';
import { AdminToolAccessCreateModalComponent } from './admin-tool-access-create-modal.component';
import { AdminOrganizationEditModalComponent } from './admin-organization-edit-modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';
import { AdminOwnerTransferModalComponent } from './admin-owner-transfer-modal.component';
import { AdminOrganizationMemberCreateModalComponent } from './admin-organization-member-create-modal.component';
import { AdminOrganizationInstrumentAccessComponent } from './admin-organization-instrument-access.component';

interface DetailField {
  label: string;
  value: unknown;
  kind?: 'date' | 'status' | 'url';
}

interface OrganizationDetailResult {
  organization: OrganizationDto;
  communicationActions: CommunicationActionDto[];
  communicationActionsError: unknown | null;
  members: OrganizationMemberDto[];
  membersError: unknown | null;
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

type MembersCollectionState = 'LOADING' | 'EMPTY' | 'READY' | 'ERROR';
type CommunicationActionsCollectionState = 'LOADING' | 'EMPTY' | 'READY' | 'ERROR';

interface OrganizationBranding {
  logoUrl: string | null;
  brandColor: string | null;
  configured: boolean;
}

@Component({
  standalone: true,
  selector: 'evaas-admin-organization-detail',
  imports: [
    CommonModule,
    RouterLink,
    AdminResourceCreateModalComponent,
    AdminResourceStatusModalComponent,
    AdminToolAccessCreateModalComponent,
    AdminOrganizationEditModalComponent,
    ConfirmationModalComponent,
    ModalInteractionDirective,
    AdminOwnerTransferModalComponent,
    AdminOrganizationMemberCreateModalComponent,
    AdminOrganizationInstrumentAccessComponent,
  ],
  templateUrl: './admin-organization-detail.component.html',
  styleUrls: ['./admin-organization-detail.component.scss'],
})
export class AdminOrganizationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminAccess = inject(AdminAccessService);
  private readonly adminCommunicationActions = inject(AdminCommunicationActionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organization = signal<OrganizationDto | null>(null);
  readonly communicationActions = signal<CommunicationActionDto[]>([]);
  readonly communicationActionsState = signal<CommunicationActionsCollectionState>('LOADING');
  readonly communicationActionsError = signal<string | null>(null);
  readonly members = signal<OrganizationMemberDto[]>([]);
  readonly membersState = signal<MembersCollectionState>('LOADING');
  readonly membersError = signal<string | null>(null);
  readonly toolAccess = signal<AdminToolAccessDto[]>([]);
  readonly resources = signal<AdminResourceDto[]>([]);
  readonly resourcesState = signal<ResourceCollectionState>('LOADING');
  readonly resourcesError = signal<string | null>(null);
  readonly assignmentModalOpen = signal(false);
  readonly organizationEditModalOpen = signal(false);
  readonly organizationEditSuccess = signal<string | null>(null);
  readonly assignmentSuccess = signal<string | null>(null);
  readonly assignmentRefreshError = signal<string | null>(null);
  readonly disablingToolAccessId = signal<number | null>(null);
  readonly disableRequestState = signal<OperationRequestState>('IDLE');
  readonly toolAccessDisableConfirmation = signal<AdminToolAccessDto | null>(null);
  readonly disableToolAccessSuccess = signal<string | null>(null);
  readonly disableToolAccessError = signal<string | null>(null);
  readonly resourceCreateModalOpen = signal(false);
  readonly resourceCreateSuccess = signal<string | null>(null);
  readonly resourceStatusModalResource = signal<AdminResourceDto | null>(null);
  readonly resourceStatusSuccess = signal<string | null>(null);
  readonly resourceStatusError = signal<string | null>(null);
  readonly selectedResource = signal<AdminResourceDto | null>(null);
  readonly isResourceDetailOpen = signal(false);
  readonly currentOrganizationId = signal<number | null>(null);
  readonly ownerTransferModalOpen = signal(false);
  readonly ownerTransferState = signal<OperationRequestState>('IDLE');
  readonly ownerTransferSuccess = signal<string | null>(null);
  readonly ownerTransferError = signal<string | null>(null);
  readonly memberCreateModalOpen = signal(false);
  readonly memberCreateState = signal<OperationRequestState>('IDLE');
  readonly memberCreateSuccess = signal<string | null>(null);
  readonly memberCreateError = signal<string | null>(null);
  readonly memberStatusState = signal<OperationRequestState>('IDLE');
  readonly memberStatusError = signal<string | null>(null);
  readonly memberStatusSuccess = signal<string | null>(null);
  readonly updatingMemberRef = signal<string | null>(null);
  readonly memberStatusConfirmation = signal<{ member: OrganizationMemberDto; status: OrganizationMemberStatus } | null>(null);

  readonly organizationIdentityFields = computed(() => {
    const organization = this.organization();
    if (!organization) return [];

    return [
      { label: 'Nombre', value: organization.name },
      { label: 'Tax ID', value: organization.taxId },
      { label: 'Enabled', value: organization.enabled, kind: 'status' as const },
      { label: 'Creada', value: organization.createdAt, kind: 'date' as const },
    ];
  });

  readonly branding = computed<OrganizationBranding>(() => {
    const organization = this.organization();
    const logoUrl = this.optionalText(organization?.logoUrl);
    const brandColor = this.optionalText(organization?.brandColor);

    return { logoUrl, brandColor, configured: logoUrl !== null || brandColor !== null };
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
  readonly hasCommunicationActions = computed(() => this.communicationActions().length > 0);
  readonly hasMembers = computed(() => this.members().length > 0);
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
          this.communicationActions.set([]);
          this.communicationActionsState.set('LOADING');
          this.communicationActionsError.set(null);
          this.members.set([]);
          this.membersState.set('LOADING');
          this.membersError.set(null);
          this.toolAccess.set([]);
          this.resources.set([]);
          this.resourcesState.set('LOADING');
          this.resourcesError.set(null);
          this.currentOrganizationId.set(id);
          this.assignmentSuccess.set(null);
          this.resourceCreateSuccess.set(null);
          this.resourceStatusModalResource.set(null);
          this.resourceStatusSuccess.set(null);
          this.resourceStatusError.set(null);
          this.assignmentModalOpen.set(false);
          this.organizationEditModalOpen.set(false);
          this.organizationEditSuccess.set(null);
          this.ownerTransferModalOpen.set(false);
          this.memberCreateModalOpen.set(false);
          this.ownerTransferSuccess.set(null);
          this.ownerTransferError.set(null);
          this.memberCreateSuccess.set(null);
          this.memberCreateError.set(null);
          this.memberStatusError.set(null);
          this.memberStatusSuccess.set(null);
          this.resourceCreateModalOpen.set(false);
          this.closeResourceDetail();

          return this.loadOrganizationDetail(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.organization.set(result.organization);
          this.communicationActions.set(result.communicationActions);
          if (result.communicationActionsError) {
            this.communicationActionsError.set(this.communicationActionsCollectionErrorMessage());
            this.communicationActionsState.set('ERROR');
          } else {
            this.communicationActionsState.set(
              result.communicationActions.length === 0 ? 'EMPTY' : 'READY',
            );
          }
          this.members.set(Array.isArray(result.members) ? result.members : []);
          if (result.membersError) {
            this.membersError.set(this.membersCollectionErrorMessage());
            this.membersState.set('ERROR');
          } else {
            this.membersState.set(result.members.length === 0 ? 'EMPTY' : 'READY');
          }
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
          this.communicationActions.set([]);
          this.communicationActionsState.set('ERROR');
          this.communicationActionsError.set(this.communicationActionsCollectionErrorMessage());
          this.members.set([]);
          this.membersState.set('ERROR');
          this.membersError.set(this.membersCollectionErrorMessage());
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

  openOrganizationEditModal(): void {
    this.organizationEditModalOpen.set(true);
    this.organizationEditSuccess.set(null);
  }

  closeOrganizationEditModal(): void {
    this.organizationEditModalOpen.set(false);
  }

  onOrganizationUpdated(organization: OrganizationDto): void {
    this.organization.set(organization);
    this.organizationEditModalOpen.set(false);
    this.organizationEditSuccess.set('Organización actualizada correctamente.');
  }

  closeAssignmentModal(): void {
    this.assignmentModalOpen.set(false);
  }

  openOwnerTransferModal(): void {
    this.ownerTransferModalOpen.set(true);
    this.ownerTransferState.set('IDLE');
    this.ownerTransferSuccess.set(null);
    this.ownerTransferError.set(null);
  }

  closeOwnerTransferModal(): void { this.ownerTransferModalOpen.set(false); }

  onOwnerTransferFailed(message: string): void {
    this.ownerTransferState.set('ERROR');
    this.ownerTransferError.set(message);
  }

  onOwnerTransferred(organization: OrganizationDto): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) return;
    this.organization.set(organization);
    this.ownerTransferModalOpen.set(false);
    this.ownerTransferState.set('SUCCESS');
    this.ownerTransferSuccess.set('Owner actualizado correctamente.');
    this.adminAccess.getOrganizationMembers(organizationId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: members => this.replaceMembers(members),
      error: error => {
        this.ownerTransferError.set('El owner fue actualizado, pero no se pudieron refrescar los miembros.');
        console.error('[AdminOrganizationDetail] member refresh after owner transfer failed', error);
      },
    });
  }

  openMemberCreateModal(): void {
    this.memberCreateModalOpen.set(true);
    this.memberCreateState.set('IDLE');
    this.memberCreateSuccess.set(null);
    this.memberCreateError.set(null);
  }

  closeMemberCreateModal(): void { this.memberCreateModalOpen.set(false); }

  onMemberCreated(): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) return;
    this.memberCreateModalOpen.set(false);
    this.memberCreateState.set('SUBMITTING');
    this.adminAccess.getOrganizationMembers(organizationId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: members => { this.replaceMembers(members); this.memberCreateState.set('SUCCESS'); this.memberCreateSuccess.set('Miembro agregado correctamente.'); },
      error: error => { this.memberCreateState.set('ERROR'); this.memberCreateError.set('El miembro fue agregado, pero no se pudieron refrescar los memberships.'); console.error('[AdminOrganizationDetail] member refresh after create failed', error); },
    });
  }

  requestMemberStatus(member: OrganizationMemberDto, status: OrganizationMemberStatus): void {
    if (member.role !== 'MEMBER' || this.updatingMemberRef()) return;
    this.memberStatusError.set(null);
    this.memberStatusSuccess.set(null);
    if (status === 'REVOKED') { this.memberStatusConfirmation.set({ member, status }); return; }
    this.updateMemberStatus(member, status);
  }

  cancelMemberStatus(): void { this.memberStatusConfirmation.set(null); }
  confirmMemberStatus(): void {
    const request = this.memberStatusConfirmation();
    if (!request) return;
    this.memberStatusConfirmation.set(null);
    this.updateMemberStatus(request.member, request.status);
  }

  private updateMemberStatus(member: OrganizationMemberDto, status: OrganizationMemberStatus): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId || !member.canonicalId || this.updatingMemberRef()) return;
    this.updatingMemberRef.set(member.canonicalId);
    this.memberStatusState.set('SUBMITTING');
    this.adminAccess.updateOrganizationMemberStatus(organizationId, member.canonicalId, { status }).pipe(
      switchMap(() => this.adminAccess.getOrganizationMembers(organizationId)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: members => { this.replaceMembers(members); this.updatingMemberRef.set(null); this.memberStatusState.set('SUCCESS'); this.memberStatusSuccess.set('Estado del miembro actualizado correctamente.'); },
      error: error => { this.updatingMemberRef.set(null); const p = mapOperationHttpError(error, { fallback: 'No fue posible actualizar el estado del miembro. Intenta nuevamente.', badRequest: 'La solicitud de estado no es válida.', unauthorized: 'Tu sesión no está autorizada para administrar miembros.', forbidden: 'No tienes permisos suficientes para administrar miembros.', notFound: 'La organización o membership no existe.', conflict: 'La membership entra en conflicto con su estado actual.' }); this.memberStatusState.set(p.state); this.memberStatusError.set(p.message); },
    });
  }

  private replaceMembers(members: OrganizationMemberDto[]): void {
    const result = Array.isArray(members) ? members : [];
    this.members.set(result); this.membersState.set(result.length === 0 ? 'EMPTY' : 'READY'); this.membersError.set(null);
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

  openResourceStatusModal(resource: AdminResourceDto): void {
    this.resourceStatusModalResource.set(resource);
    this.resourceStatusSuccess.set(null);
    this.resourceStatusError.set(null);
  }

  closeResourceStatusModal(): void {
    this.resourceStatusModalResource.set(null);
  }

  onResourceStatusUpdated(): void {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) return;

    this.closeResourceStatusModal();
    this.resourceStatusError.set(null);
    this.adminAccess.getOrganizationResources(organizationId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: resources => {
        const result = Array.isArray(resources) ? resources : [];
        this.resources.set(result);
        this.resourcesState.set(result.length === 0 ? 'EMPTY' : 'POPULATED');
        this.resourcesError.set(null);
        this.resourceStatusSuccess.set('Estado del recurso actualizado correctamente.');
      },
      error: err => {
        console.error('[AdminOrganizationDetail] resource status refresh error', err);
        this.resourceStatusError.set(
          'El estado fue actualizado, pero no se pudo refrescar la colección de recursos.',
        );
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

  requestToolAccessDisable(access: AdminToolAccessDto): void {
    if (this.disableRequestState() === 'SUBMITTING' || !access.id) return;
    this.toolAccessDisableConfirmation.set(access);
    this.disableToolAccessError.set(null);
    this.disableToolAccessSuccess.set(null);
  }

  cancelToolAccessDisable(): void {
    this.toolAccessDisableConfirmation.set(null);
  }

  confirmToolAccessDisable(): void {
    const access = this.toolAccessDisableConfirmation();
    const organizationId = this.currentOrganizationId();
    if (!organizationId || !access?.id || this.disableRequestState() === 'SUBMITTING') return;

    this.toolAccessDisableConfirmation.set(null);
    this.disablingToolAccessId.set(access.id);
    this.disableRequestState.set('SUBMITTING');
    this.disableToolAccessError.set(null);
    this.disableToolAccessSuccess.set(null);

    this.adminAccess.disableToolAccess(access.id).pipe(
      switchMap(() => this.adminAccess.getOrganizationToolAccess(organizationId)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: toolAccess => {
        this.toolAccess.set(Array.isArray(toolAccess) ? toolAccess : []);
        this.disablingToolAccessId.set(null);
        this.disableRequestState.set('SUCCESS');
        this.disableToolAccessSuccess.set('Acceso deshabilitado correctamente.');
      },
      error: err => {
        this.disablingToolAccessId.set(null);
        const presentation = mapOperationHttpError(err, {
          fallback: 'No fue posible deshabilitar el acceso. Intenta nuevamente.',
          unauthorized: 'Tu sesión no está autorizada para deshabilitar este acceso.',
          forbidden: 'No tienes permisos suficientes para deshabilitar este acceso.',
          notFound: 'No se encontro el acceso indicado.',
          conflict: 'El acceso no puede deshabilitarse en su estado actual.',
        });
        this.disableRequestState.set(presentation.state);
        this.disableToolAccessError.set(presentation.message);
      },
    });
  }

  readonly trackToolAccess = (
    index: number,
    access: AdminToolAccessDto | null | undefined,
  ): string | number => access?.id ?? access?.toolKey ?? index;

  readonly trackMember = (
    index: number,
    member: OrganizationMemberDto | null | undefined,
  ): string | number => member?.canonicalId ?? member?.userId ?? index;

  readonly trackCommunicationAction = (
    index: number,
    action: CommunicationActionDto | null | undefined,
  ): string | number => action?.id ?? index;

  communicationCorrelation(action: CommunicationActionDto): string {
    return this.formatValue(action.requestId ?? action.idempotencyKey);
  }

  communicationEvidence(action: CommunicationActionDto): string {
    return this.formatValue(
      action.providerMessageId ?? action.lioraCommunicationId ?? action.lioraRequestId,
    );
  }

  communicationError(action: CommunicationActionDto): string {
    return this.formatValue(action.errorMessage ?? action.lioraLastErrorMessage);
  }

  readonly trackResource = (
    index: number,
    resource: AdminResourceDto | null | undefined,
  ): string | number => {
    const id = resource?.['id'];
    const key = resource?.['key'];
    return typeof id === 'string' || typeof id === 'number'
      ? id
      : typeof key === 'string' || typeof key === 'number'
        ? key
        : index;
  };

  resourceFields(resource: AdminResourceDto): DetailField[] {
    return [
      { label: 'ID', value: this.valueFromKeys(resource, ['id']) },
      { label: 'Nombre', value: this.valueFromKeys(resource, ['name']) },
      { label: 'Clave', value: this.valueFromKeys(resource, ['key']) },
      { label: 'Tipo', value: this.valueFromKeys(resource, ['type']) },
      { label: 'Proveedor', value: this.valueFromKeys(resource, ['provider']) },
      { label: 'Tool access ID', value: this.valueFromKeys(resource, ['toolAccessId']) },
      { label: 'Organization ID', value: this.valueFromKeys(resource, ['organizationId']) },
      { label: 'Organization name', value: this.valueFromKeys(resource, ['organizationName']) },
      { label: 'Estado', value: this.valueFromKeys(resource, ['status']), kind: 'status' as const },
      { label: 'Visibilidad', value: this.valueFromKeys(resource, ['visibility']) },
      {
        label: 'URL',
        value: this.valueFromKeys(resource, ['url']),
        kind: 'url' as const,
      },
      { label: 'Creado', value: this.valueFromKeys(resource, ['createdAt']), kind: 'date' as const },
      { label: 'Actualizado', value: this.valueFromKeys(resource, ['updatedAt']), kind: 'date' as const },
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
    return this.formatValue(this.valueFromKeys(resource, ['key']));
  }

  resourceType(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['type']));
  }

  resourceProvider(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['provider']));
  }

  resourceStatus(resource: AdminResourceDto): unknown {
    return this.valueFromKeys(resource, ['status']);
  }

  resourceVisibility(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['visibility']));
  }

  resourceToolAccessId(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['toolAccessId']));
  }

  resourceUrl(resource: AdminResourceDto | null): string | null {
    if (!resource) return null;

    const value = this.valueFromKeys(resource, ['url']);
    return typeof value === 'string' && value ? value : null;
  }

  resourceTitle(resource: AdminResourceDto): string {
    return this.formatValue(
      this.valueFromKeys(resource, ['name', 'key', 'type', 'id']),
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
    if (typeof value === 'object') return '-';
    return String(value);
  }

  formatDate(value: string | undefined | null): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  private loadOrganizationDetail(id: number): Observable<OrganizationDetailResult> {
    return forkJoin({
      organization: this.adminAccess.getOrganizationById(id),
      communicationActionsResult: this.adminCommunicationActions.getCommunicationActions().pipe(
        map(actions => ({
          communicationActions: (Array.isArray(actions) ? actions : [])
            .filter(action => action.organizationId === id),
          communicationActionsError: null,
        })),
        catchError(communicationActionsError => of({
          communicationActions: [],
          communicationActionsError,
        })),
      ),
      membersResult: this.adminAccess.getOrganizationMembers(id).pipe(
        map(members => ({ members: Array.isArray(members) ? members : [], membersError: null })),
        catchError(membersError => of({ members: [], membersError })),
      ),
      toolAccess: this.adminAccess.getOrganizationToolAccess(id),
      resourceResult: this.adminAccess.getOrganizationResources(id).pipe(
        map(resources => ({ resources: Array.isArray(resources) ? resources : [], resourceError: null })),
        catchError(resourceError => of({ resources: [], resourceError })),
      ),
    }).pipe(
      map(({ organization, communicationActionsResult, membersResult, toolAccess, resourceResult }) => ({
        organization,
        ...communicationActionsResult,
        ...membersResult,
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

  private membersCollectionErrorMessage(): string {
    return 'No fue posible cargar los miembros de esta organización.';
  }

  private communicationActionsCollectionErrorMessage(): string {
    return 'No fue posible cargar la evidencia comunicacional de esta organización.';
  }

  private optionalText(value: string | null | undefined): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
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
