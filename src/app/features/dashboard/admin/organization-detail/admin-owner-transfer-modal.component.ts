import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUserLookupDto, OrganizationDto } from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';

@Component({
  standalone: true,
  selector: 'evaas-admin-owner-transfer-modal',
  imports: [CommonModule, FormsModule, ModalInteractionDirective],
  templateUrl: './admin-owner-transfer-modal.component.html',
  styleUrls: ['./organization-request-modal.component.scss'],
})
export class AdminOwnerTransferModalComponent {
  private readonly adminAccess = inject(AdminAccessService);
  @Input({ required: true }) organization!: OrganizationDto;
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly transferred = new EventEmitter<OrganizationDto>();
  @Output() readonly failed = new EventEmitter<string>();
  readonly requestState = signal<OperationRequestState>('IDLE');
  readonly submitting = computed(() => this.requestState() === 'SUBMITTING');
  readonly userLookupLoading = signal(false);
  readonly userLookupError = signal<string | null>(null);
  readonly validation = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly selectedUser = signal<AdminUserLookupDto | null>(null);
  userEmail = '';

  cancel(): void { if (!this.submitting()) this.cancelled.emit(); }
  clearSelectedUser(): void { this.selectedUser.set(null); this.userLookupError.set(null); }
  searchUserByEmail(): void {
    const email = this.userEmail.trim(); this.selectedUser.set(null); this.userLookupError.set(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.userLookupError.set('Ingresa un correo válido antes de buscar.'); return; }
    this.userLookupLoading.set(true);
    this.adminAccess.findUserByEmail(email).subscribe({
      next: user => { this.userLookupLoading.set(false); this.selectedUser.set(user); },
      error: error => { this.userLookupLoading.set(false); this.userLookupError.set(this.lookupError(error)); },
    });
  }
  submit(): void {
    const user = this.selectedUser();
    if (this.submitting()) return;
    if (!user) { this.requestState.set('VALIDATION_ERROR'); this.validation.set('Busca y selecciona un usuario antes de transferir.'); return; }
    this.requestState.set('SUBMITTING'); this.error.set(null); this.validation.set(null);
    this.adminAccess.updateOrganizationOwner(this.organization.id, { ownerUserId: user.id }).subscribe({
      next: organization => { this.requestState.set('SUCCESS'); this.transferred.emit(organization); },
      error: error => { const p = mapOperationHttpError(error, { fallback: 'No fue posible cambiar el owner. Intenta nuevamente.', badRequest: 'La solicitud de transferencia no es válida.', unauthorized: 'Tu sesión no está autorizada para cambiar el owner.', forbidden: 'No tienes permisos suficientes para cambiar el owner.', notFound: 'La organización o el usuario no existe.', conflict: 'Existe un conflicto de ownership o membership.' }); this.requestState.set(p.state); this.error.set(p.message); this.failed.emit(p.message); },
    });
  }
  private lookupError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 404) return 'No encontramos un usuario con ese correo.';
    return 'No fue posible buscar el usuario. Intenta nuevamente.';
  }
}
