import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  OrganizationDto,
  UpdateOrganizationRequest,
} from '../../../../core/models/evaas-contracts.model';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { AdminAccessService } from '../../../../core/services/admin-access.service';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';

interface OrganizationProfileForm {
  name: string;
  taxId: string;
  logoUrl: string;
  brandColor: string;
}

@Component({
  standalone: true,
  selector: 'evaas-admin-organization-edit-modal',
  imports: [CommonModule, FormsModule, ModalInteractionDirective],
  templateUrl: './admin-organization-edit-modal.component.html',
  styleUrls: ['./organization-request-modal.component.scss'],
})
export class AdminOrganizationEditModalComponent {
  private readonly adminAccess = inject(AdminAccessService);

  @Input({ required: true }) set organization(value: OrganizationDto) {
    this.organizationId = value.id;
    this.organizationName = value.name;
    this.form = {
      name: value.name ?? '',
      taxId: value.taxId ?? '',
      logoUrl: value.logoUrl ?? '',
      brandColor: value.brandColor ?? '',
    };
  }
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly updated = new EventEmitter<OrganizationDto>();

  organizationId: number | null = null;
  organizationName = '';
  form: OrganizationProfileForm = { name: '', taxId: '', logoUrl: '', brandColor: '' };
  readonly requestState = signal<OperationRequestState>('IDLE');
  readonly submitting = computed(() => this.requestState() === 'SUBMITTING');
  readonly validation = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  cancel(): void {
    if (!this.submitting()) this.cancelled.emit();
  }

  submit(): void {
    if (this.submitting() || this.organizationId === null) return;

    const payload = this.buildPayload();
    if (!payload) return;

    this.requestState.set('SUBMITTING');
    this.validation.set(null);
    this.error.set(null);
    this.adminAccess.updateOrganization(this.organizationId, payload).subscribe({
      next: organization => {
        this.requestState.set('SUCCESS');
        this.updated.emit(organization);
      },
      error: err => {
        const presentation = mapOperationHttpError(err, {
          fallback: 'No fue posible actualizar la organización. Intenta nuevamente.',
          badRequest: 'Los datos de la organización no son válidos. Revisa los campos e intenta nuevamente.',
          unauthorized: 'Tu sesión no está autorizada para actualizar esta organización.',
          forbidden: 'No tienes permisos suficientes para actualizar esta organización.',
          notFound: 'No se encontró la organización indicada.',
        });
        this.requestState.set(presentation.state);
        this.error.set(presentation.message);
      },
    });
  }

  private buildPayload(): UpdateOrganizationRequest | null {
    const name = this.form.name.trim();
    const taxId = this.optional(this.form.taxId);
    const logoUrl = this.optional(this.form.logoUrl);
    const brandColor = this.optional(this.form.brandColor);

    if (!name) return this.invalid('El nombre es requerido.');
    if (name.length > 160) return this.invalid('El nombre no puede superar 160 caracteres.');
    if (taxId !== null && taxId.length > 32) return this.invalid('El Tax ID no puede superar 32 caracteres.');
    if (logoUrl !== null && logoUrl.length > 500) return this.invalid('La URL del logo no puede superar 500 caracteres.');
    if (logoUrl !== null && !this.isHttpUrl(logoUrl)) return this.invalid('La URL del logo debe usar HTTP o HTTPS.');
    if (brandColor !== null && !/^#[0-9A-Fa-f]{6}$/.test(brandColor)) {
      return this.invalid('El color de marca debe usar el formato #RRGGBB.');
    }

    return { name, taxId, logoUrl, brandColor };
  }

  private invalid(message: string): null {
    this.requestState.set('VALIDATION_ERROR');
    this.validation.set(message);
    return null;
  }

  private optional(value: string): string | null {
    const normalized = value.trim();
    return normalized || null;
  }

  private isHttpUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
