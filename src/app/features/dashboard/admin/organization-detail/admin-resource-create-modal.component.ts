import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminToolAccessDto,
  CreateAdminResourcePayload,
} from '../../../../core/models/evaas-contracts.model';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';

@Component({
  standalone: true,
  selector: 'evaas-admin-resource-create-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-resource-create-modal.component.html',
  styleUrls: ['./organization-request-modal.component.scss'],
})
export class AdminResourceCreateModalComponent {
  private readonly adminResources = inject(AdminResourceService);

  @Input({ required: true }) organizationId!: number;
  @Input({ required: true }) organizationName = '';
  @Input() toolAccess: AdminToolAccessDto[] = [];
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly submitting = signal(false);
  readonly validation = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  form = this.emptyForm();

  readonly suggestedResourceTypes = [
    'API', 'WORDPRESS', 'VPS', 'POWER_BI', 'REPOSITORY', 'DASHBOARD', 'WORKER', 'DOCUMENTATION', 'OTHER',
  ];
  readonly suggestedResourceStatuses = ['PLANNED', 'ACTIVE', 'MAINTENANCE', 'DISABLED'];
  readonly suggestedResourceVisibilities = ['ADMIN_ONLY', 'USER_VISIBLE'];

  cancel(): void {
    if (!this.submitting()) this.cancelled.emit();
  }

  submit(): void {
    const payload = this.buildPayload();
    if (!payload) return;

    this.submitting.set(true);
    this.error.set(null);
    this.validation.set(null);

    this.adminResources.createResource(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.created.emit();
      },
      error: err => {
        this.submitting.set(false);
        this.error.set(this.errorMessage(err));
      },
    });
  }

  toolAccessLabel(access: AdminToolAccessDto): string {
    const status = access.status ? ` - ${access.status}` : '';
    return `${access.toolKey}${status} - ID ${access.id}`;
  }

  private buildPayload(): CreateAdminResourcePayload | null {
    const name = this.form.name.trim();
    const type = this.form.type.trim();
    const key = this.form.key.trim();
    const url = this.form.url.trim();
    const status = this.form.status.trim();
    const visibility = this.form.visibility.trim();
    const metadataJson = this.form.metadataJson.trim();
    const toolAccessId = this.parseOptionalPositiveInteger(this.form.toolAccessId, 'toolAccessId');

    if (!name) return this.invalid('name es requerido.');
    if (!type) return this.invalid('type es requerido.');
    if (toolAccessId === null) return null;
    if (toolAccessId !== undefined && !this.toolAccess.some(access => access.id === toolAccessId)) {
      return this.invalid('toolAccessId debe seleccionarse desde los accesos cargados de esta organizacion.');
    }
    if (url && !this.isValidUrl(url)) return this.invalid('url debe tener formato URL valido.');
    if (metadataJson && !this.isValidJson(metadataJson)) return this.invalid('metadataJson debe ser JSON valido.');
    if (metadataJson && this.containsSecretLikeContent(metadataJson)) {
      return this.invalid('metadataJson no debe contener secretos, tokens ni credenciales.');
    }

    return {
      organizationId: this.organizationId,
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

  private invalid(message: string): null {
    this.validation.set(message);
    return null;
  }

  private parseOptionalPositiveInteger(value: string, label: string): number | undefined | null {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      this.validation.set(`${label} debe ser numerico.`);
      return null;
    }
    return parsed;
  }

  private errorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) return 'No fue posible crear el recurso. Intenta nuevamente.';
    if (err.status === 400) return 'El backend rechazo el payload. Revisa name, type, toolAccessId, url y metadataJson.';
    if (err.status === 401 || err.status === 403) return 'No tienes permisos suficientes para crear recursos en esta organizacion.';
    if (err.status === 404) return 'No se encontro la organizacion o el acceso asociado indicado.';
    if (err.status === 409) return 'El recurso ya existe o entra en conflicto con el estado actual.';
    return 'No fue posible crear el recurso. Intenta nuevamente.';
  }

  private isValidUrl(value: string): boolean {
    try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; } catch { return false; }
  }

  private isValidJson(value: string): boolean {
    try { JSON.parse(value); return true; } catch { return false; }
  }

  private containsSecretLikeContent(value: string): boolean {
    return /\b(password|passwd|secret|token|access[_-]?token|api[_-]?key|private[_-]?key|credential|authorization|bearer)\b/i.test(value);
  }

  private emptyForm() {
    return { name: '', type: 'API', key: '', toolAccessId: '', url: '', status: 'ACTIVE', visibility: 'ADMIN_ONLY', metadataJson: '' };
  }
}
