import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUserLookupDto } from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';
@Component({ standalone: true, selector: 'evaas-admin-organization-member-create-modal', imports: [CommonModule, FormsModule, ModalInteractionDirective], templateUrl: './admin-organization-member-create-modal.component.html', styleUrls: ['./organization-request-modal.component.scss'] })
export class AdminOrganizationMemberCreateModalComponent {
  private readonly adminAccess = inject(AdminAccessService);
  @Input({ required: true }) organizationId!: number; @Input({ required: true }) organizationName = '';
  @Output() readonly cancelled = new EventEmitter<void>(); @Output() readonly created = new EventEmitter<void>();
  readonly requestState = signal<OperationRequestState>('IDLE'); readonly submitting = computed(() => this.requestState() === 'SUBMITTING'); readonly selectedUser = signal<AdminUserLookupDto | null>(null); readonly lookupLoading = signal(false); readonly error = signal<string | null>(null); userEmail = '';
  cancel(): void { if (!this.submitting()) this.cancelled.emit(); }
  clearSelectedUser(): void { this.selectedUser.set(null); this.error.set(null); }
  searchUserByEmail(): void { const email = this.userEmail.trim(); this.selectedUser.set(null); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.error.set('Ingresa un correo válido antes de buscar.'); return; } this.lookupLoading.set(true); this.error.set(null); this.adminAccess.findUserByEmail(email).subscribe({ next: user => { this.lookupLoading.set(false); this.selectedUser.set(user); }, error: () => { this.lookupLoading.set(false); this.error.set('No fue posible buscar el usuario.'); } }); }
  submit(): void { const user = this.selectedUser(); if (this.submitting()) return; if (!user) { this.requestState.set('VALIDATION_ERROR'); this.error.set('Busca y selecciona un usuario antes de agregarlo.'); return; } this.requestState.set('SUBMITTING'); this.error.set(null); this.adminAccess.addOrganizationMember(this.organizationId, { userId: user.id }).subscribe({ next: () => { this.requestState.set('SUCCESS'); this.created.emit(); }, error: error => { const p = mapOperationHttpError(error, { fallback: 'No fue posible agregar el miembro. Intenta nuevamente.', badRequest: 'La solicitud para agregar el miembro no es válida.', unauthorized: 'Tu sesión no está autorizada para agregar miembros.', forbidden: 'No tienes permisos suficientes para agregar miembros.', notFound: 'La organización o el usuario no existe.', conflict: 'La membership entra en conflicto con su estado actual.' }); this.requestState.set(p.state); this.error.set(p.message); } }); }
}
