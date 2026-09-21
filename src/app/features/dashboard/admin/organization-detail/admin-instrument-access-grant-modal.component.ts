import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminInstrumentDto } from '../../../../core/models/evaas-contracts.model';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { AdminInstrumentAccessService } from '../../../../core/services/admin-instrument-access.service';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';

@Component({
  standalone: true,
  selector: 'evaas-admin-instrument-access-grant-modal',
  imports: [CommonModule, FormsModule, ModalInteractionDirective],
  templateUrl: './admin-instrument-access-grant-modal.component.html',
  styleUrls: ['./organization-request-modal.component.scss'],
})
export class AdminInstrumentAccessGrantModalComponent {
  private readonly instrumentAccess = inject(AdminInstrumentAccessService);

  @Input({ required: true }) organizationRef = '';
  @Input({ required: true }) organizationName = '';
  @Input({ required: true }) instruments: AdminInstrumentDto[] = [];
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly requestState = signal<OperationRequestState>('IDLE');
  readonly error = signal<string | null>(null);
  readonly validation = signal<string | null>(null);
  readonly submitting = computed(() => this.requestState() === 'SUBMITTING');
  instrumentRef = '';

  cancel(): void {
    if (!this.submitting()) this.cancelled.emit();
  }

  submit(): void {
    if (this.submitting()) return;
    const instrumentRef = this.instrumentRef.trim();
    if (!instrumentRef) {
      this.requestState.set('VALIDATION_ERROR');
      this.validation.set('Selecciona un instrumento para habilitar.');
      return;
    }

    this.requestState.set('SUBMITTING');
    this.error.set(null);
    this.validation.set(null);
    this.instrumentAccess.grantInstrumentAccess(this.organizationRef, { instrumentRef }).subscribe({
      next: () => {
        this.requestState.set('SUCCESS');
        this.created.emit();
      },
      error: error => {
        const presentation = mapOperationHttpError(error, {
          fallback: 'No fue posible habilitar el instrumento. Intenta nuevamente.',
          badRequest: 'La solicitud para habilitar el instrumento no es válida.',
          unauthorized: 'Tu sesión no está autorizada para habilitar instrumentos.',
          forbidden: 'No tienes permisos administrativos para habilitar instrumentos.',
          notFound: 'La organización o el instrumento no existe.',
          conflict: 'La organización ya posee una relación InstrumentAccess para este instrumento.',
        });
        this.requestState.set(presentation.state);
        this.error.set(presentation.message);
      },
    });
  }
}
