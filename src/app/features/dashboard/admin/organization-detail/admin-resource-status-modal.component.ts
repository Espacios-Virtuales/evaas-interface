import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminResourceDto,
  ResourceStatus,
} from '../../../../core/models/evaas-contracts.model';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';

@Component({
  standalone: true,
  selector: 'evaas-admin-resource-status-modal',
  imports: [CommonModule, FormsModule, ModalInteractionDirective],
  templateUrl: './admin-resource-status-modal.component.html',
  styleUrls: ['./organization-request-modal.component.scss'],
})
export class AdminResourceStatusModalComponent {
  private readonly adminResources = inject(AdminResourceService);

  private selectedResource: AdminResourceDto | null = null;

  @Input({ required: true })
  set resource(resource: AdminResourceDto) {
    this.selectedResource = resource;
    this.status = resource.status ?? 'PLANNED';
    this.requestState.set('IDLE');
    this.error.set(null);
  }

  get resource(): AdminResourceDto | null {
    return this.selectedResource;
  }

  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly updated = new EventEmitter<void>();

  readonly statuses: readonly ResourceStatus[] = [
    'PLANNED',
    'ACTIVE',
    'MAINTENANCE',
    'DISABLED',
  ];
  readonly requestState = signal<OperationRequestState>('IDLE');
  readonly submitting = computed(() => this.requestState() === 'SUBMITTING');
  readonly error = signal<string | null>(null);
  status: ResourceStatus = 'PLANNED';

  cancel(): void {
    if (!this.submitting()) this.cancelled.emit();
  }

  submit(): void {
    if (this.submitting()) return;

    const id = this.resourceId();
    if (id === null) {
      this.requestState.set('ERROR');
      this.error.set('El recurso ya no está disponible.');
      return;
    }

    this.requestState.set('SUBMITTING');
    this.error.set(null);
    this.adminResources.updateResourceStatus(id, { status: this.status }).subscribe({
      next: () => {
        this.requestState.set('SUCCESS');
        this.updated.emit();
      },
      error: err => {
        const presentation = mapOperationHttpError(err, {
          fallback: 'No fue posible actualizar el estado del recurso. Intenta nuevamente.',
          badRequest: 'El estado solicitado no es válido para este recurso.',
          unauthorized: 'Tu sesión no está autorizada para administrar este recurso.',
          forbidden: 'No tienes permisos suficientes para administrar este recurso.',
          notFound: 'El recurso ya no está disponible.',
          conflict: 'El recurso entra en conflicto con el estado solicitado.',
        });
        this.requestState.set(presentation.state);
        this.error.set(presentation.message);
      },
    });
  }

  resourceTitle(): string {
    const resource = this.resource;
    return resource?.name ?? resource?.key ?? (resource?.id ? `Resource ${resource.id}` : 'Resource');
  }

  private resourceId(): number | null {
    const id = this.resource?.id;
    return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null;
  }
}
