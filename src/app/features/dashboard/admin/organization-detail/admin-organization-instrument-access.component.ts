import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, computed, inject, signal } from '@angular/core';
import { switchMap } from 'rxjs';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import {
  AdminInstrumentDto,
  InstrumentAccessDto,
  InstrumentAccessStatus,
} from '../../../../core/models/evaas-contracts.model';
import { AdminInstrumentService } from '../../../../core/services/admin-instrument.service';
import { AdminInstrumentAccessService } from '../../../../core/services/admin-instrument-access.service';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { AdminInstrumentAccessGrantModalComponent } from './admin-instrument-access-grant-modal.component';

export type InstrumentAccessCollectionState =
  | 'LOADING'
  | 'EMPTY'
  | 'READY'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'ERROR';

@Component({
  standalone: true,
  selector: 'evaas-admin-organization-instrument-access',
  imports: [CommonModule, ConfirmationModalComponent, AdminInstrumentAccessGrantModalComponent],
  templateUrl: './admin-organization-instrument-access.component.html',
  styleUrls: ['./admin-organization-instrument-access.component.scss'],
})
export class AdminOrganizationInstrumentAccessComponent {
  private readonly instrumentAccess = inject(AdminInstrumentAccessService);
  private readonly instrumentsService = inject(AdminInstrumentService);
  organizationRefValue = '';
  private organizationRefInitialized = false;

  @Input({ required: true }) set organizationRef(value: string | null | undefined) {
    const next = value?.trim() ?? '';
    if (this.organizationRefInitialized && next === this.organizationRefValue) return;
    this.organizationRefInitialized = true;
    this.organizationRefValue = next;
    this.resetAndLoad();
  }
  @Input({ required: true }) organizationName = '';

  readonly state = signal<InstrumentAccessCollectionState>('LOADING');
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly accesses = signal<InstrumentAccessDto[]>([]);
  readonly grantOpen = signal(false);
  readonly catalogLoading = signal(false);
  readonly catalogError = signal<string | null>(null);
  readonly catalog = signal<AdminInstrumentDto[]>([]);
  readonly lifecycleState = signal<OperationRequestState>('IDLE');
  readonly lifecycleError = signal<string | null>(null);
  readonly updatingRef = signal<string | null>(null);
  readonly revokeConfirmation = signal<InstrumentAccessDto | null>(null);

  readonly hasAccesses = computed(() => this.accesses().length > 0);
  readonly availableInstruments = computed(() => {
    const persisted = new Set(this.accesses().map(access => access.instrumentRef));
    return this.catalog().filter(instrument => !persisted.has(instrument.canonicalId));
  });

  openGrant(): void {
    if (!this.organizationRefValue) return;
    this.success.set(null);
    this.catalogError.set(null);
    this.grantOpen.set(true);
    this.catalogLoading.set(true);
    this.instrumentsService.getInstruments().subscribe({
      next: instruments => {
        this.catalog.set(Array.isArray(instruments) ? instruments : []);
        this.catalogLoading.set(false);
      },
      error: () => {
        this.catalogLoading.set(false);
        this.grantOpen.set(false);
        this.catalogError.set('No fue posible cargar el catálogo de instrumentos.');
      },
    });
  }

  closeGrant(): void { this.grantOpen.set(false); }

  onGranted(): void {
    this.closeGrant();
    this.load('Instrumento habilitado correctamente.');
  }

  requestStatus(access: InstrumentAccessDto, status: InstrumentAccessStatus): void {
    if (this.updatingRef()) return;
    this.lifecycleError.set(null);
    this.success.set(null);
    if (status === 'REVOKED') {
      this.revokeConfirmation.set(access);
      return;
    }
    this.updateStatus(access, status);
  }

  cancelRevoke(): void { this.revokeConfirmation.set(null); }

  confirmRevoke(): void {
    const access = this.revokeConfirmation();
    if (!access) return;
    this.revokeConfirmation.set(null);
    this.updateStatus(access, 'REVOKED');
  }

  readonly trackAccess = (_: number, access: InstrumentAccessDto): string => access.canonicalId;

  private resetAndLoad(): void {
    this.accesses.set([]);
    this.success.set(null);
    this.error.set(null);
    this.lifecycleError.set(null);
    this.grantOpen.set(false);
    if (!this.organizationRefValue) {
      this.state.set('ERROR');
      this.error.set('La organización no expone una referencia canónica utilizable.');
      return;
    }
    this.load();
  }

  private load(successMessage?: string): void {
    if (!this.organizationRefValue) return;
    this.state.set('LOADING');
    this.error.set(null);
    this.instrumentAccess.getOrganizationInstrumentAccess(this.organizationRefValue).subscribe({
      next: accesses => {
        const result = Array.isArray(accesses) ? accesses : [];
        this.accesses.set(result);
        this.state.set(result.length ? 'READY' : 'EMPTY');
        if (successMessage) this.success.set(successMessage);
      },
      error: error => {
        this.state.set(this.collectionErrorState(error));
        this.error.set(this.collectionErrorMessage(error));
      },
    });
  }

  private updateStatus(access: InstrumentAccessDto, status: InstrumentAccessStatus): void {
    if (!this.organizationRefValue || this.updatingRef()) return;
    this.updatingRef.set(access.canonicalId);
    this.lifecycleState.set('SUBMITTING');
    this.instrumentAccess.updateInstrumentAccessStatus(
      this.organizationRefValue,
      access.canonicalId,
      { status },
    ).pipe(
      switchMap(() => this.instrumentAccess.getOrganizationInstrumentAccess(this.organizationRefValue)),
    ).subscribe({
      next: accesses => {
        const result = Array.isArray(accesses) ? accesses : [];
        this.accesses.set(result);
        this.state.set(result.length ? 'READY' : 'EMPTY');
        this.updatingRef.set(null);
        this.lifecycleState.set('SUCCESS');
        this.success.set('Estado de InstrumentAccess actualizado correctamente.');
      },
      error: error => {
        this.updatingRef.set(null);
        const presentation = mapOperationHttpError(error, {
          fallback: 'No fue posible actualizar InstrumentAccess. Intenta nuevamente.',
          badRequest: 'La solicitud o transición de InstrumentAccess no es válida.',
          unauthorized: 'Tu sesión no está autorizada para administrar InstrumentAccess.',
          forbidden: 'No tienes permisos administrativos para administrar InstrumentAccess.',
          notFound: 'La organización o InstrumentAccess no existe.',
          conflict: 'InstrumentAccess entra en conflicto con su estado actual.',
        });
        this.lifecycleState.set(presentation.state);
        this.lifecycleError.set(presentation.message);
      },
    });
  }

  private collectionErrorState(error: unknown): InstrumentAccessCollectionState {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    return 'ERROR';
  }

  private collectionErrorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'Tu sesión no está autorizada para consultar InstrumentAccess.';
    if (status === 403) return 'No tienes permisos administrativos para consultar InstrumentAccess.';
    if (status === 404) return 'La organización o la colección InstrumentAccess no existe.';
    return 'No fue posible cargar InstrumentAccess de esta organización.';
  }
}
