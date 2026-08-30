import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUserLookupDto, CreateToolAccessPayload } from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';

@Component({
  standalone: true,
  selector: 'evaas-admin-tool-access-create-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tool-access-create-modal.component.html',
  styleUrls: ['./organization-request-modal.component.scss'],
})
export class AdminToolAccessCreateModalComponent {
  private readonly adminAccess = inject(AdminAccessService);

  @Input({ required: true }) organizationId!: number;
  @Input({ required: true }) organizationName = '';
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly submitting = signal(false);
  readonly validation = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly userLookupLoading = signal(false);
  readonly userLookupError = signal<string | null>(null);
  readonly selectedUser = signal<AdminUserLookupDto | null>(null);

  toolKey = '';
  userEmail = '';
  externalCommerceActivationId = '';
  readonly suggestedToolKeys = ['EVAAS_ADMIN_OPERATIONS', 'EVAAS_WORKFLOW', 'EVAAS_LANDING_LAT'];

  cancel(): void {
    if (!this.submitting()) this.cancelled.emit();
  }

  searchUserByEmail(): void {
    const email = this.userEmail.trim();
    this.userLookupError.set(null);
    this.validation.set(null);
    this.selectedUser.set(null);
    if (!this.isValidEmail(email)) { this.userLookupError.set('Ingresa un correo valido antes de buscar.'); return; }

    this.userLookupLoading.set(true);
    this.adminAccess.findUserByEmail(email).subscribe({
      next: user => {
        this.userLookupLoading.set(false);
        if (!user?.id) { this.userLookupError.set('No encontramos un usuario con ese correo.'); return; }
        this.selectedUser.set(user);
      },
      error: err => { this.userLookupLoading.set(false); this.userLookupError.set(this.userLookupErrorMessage(err)); },
    });
  }

  clearSelectedUser(): void {
    this.selectedUser.set(null);
    this.userLookupError.set(null);
  }

  useSuggestedToolKey(toolKey: string): void {
    this.toolKey = toolKey;
    this.validation.set(null);
  }

  submit(): void {
    const payload = this.buildPayload();
    if (!payload) return;
    this.submitting.set(true);
    this.error.set(null);
    this.validation.set(null);
    this.adminAccess.createToolAccess(payload).subscribe({
      next: () => { this.submitting.set(false); this.created.emit(); },
      error: err => { this.submitting.set(false); this.error.set(this.errorMessage(err)); },
    });
  }

  private buildPayload(): CreateToolAccessPayload | null {
    const toolKey = this.toolKey.trim();
    const userId = this.selectedUser()?.id;
    const activationId = this.parseOptionalPositiveInteger(this.externalCommerceActivationId);
    if (!toolKey) return this.invalid('toolKey es requerido.');
    if (!userId) return this.invalid('Busca y selecciona un usuario antes de asignar acceso.');
    if (activationId === null) return null;
    return { organizationId: this.organizationId, toolKey, userId, ...(activationId !== undefined ? { externalCommerceActivationId: activationId } : {}) };
  }

  private invalid(message: string): null { this.validation.set(message); return null; }

  private parseOptionalPositiveInteger(value: string): number | undefined | null {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) { this.validation.set('externalCommerceActivationId debe ser numerico.'); return null; }
    return parsed;
  }

  private errorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) return 'No fue posible asignar el acceso. Intenta nuevamente.';
    if (err.status === 400) return 'El backend rechazo el payload. Revisa toolKey, userId y activationId.';
    if (err.status === 401 || err.status === 403) return 'No tienes permisos suficientes para asignar este acceso.';
    if (err.status === 404) return 'No se encontro la organizacion, el usuario o la activacion indicada.';
    if (err.status === 409) return 'El acceso ya existe o entra en conflicto con el estado actual.';
    return 'No fue posible asignar el acceso. Intenta nuevamente.';
  }

  private userLookupErrorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) return err instanceof Error && err.message === 'Invalid user lookup response' ? 'No pudimos interpretar la respuesta del usuario.' : 'No fue posible buscar el usuario. Intenta nuevamente.';
    if (err.status === 404) return 'No encontramos un usuario con ese correo.';
    if (err.status === 401 || err.status === 403) return 'No tienes permisos suficientes para buscar usuarios.';
    return 'No fue posible buscar el usuario. Intenta nuevamente.';
  }

  private isValidEmail(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
}
