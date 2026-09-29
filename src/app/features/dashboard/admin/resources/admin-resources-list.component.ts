import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminResourceDto } from '../../../../core/models/evaas-contracts.model';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';
import { AdminResourceStatusModalComponent } from '../organization-detail/admin-resource-status-modal.component';

type DetailFieldKind = 'date' | 'status';

interface DetailField {
  label: string;
  value: unknown;
  kind?: DetailFieldKind;
}

@Component({
  standalone: true,
  selector: 'evaas-admin-resources-list',
  imports: [CommonModule, RouterLink, ModalInteractionDirective, AdminResourceStatusModalComponent],
  templateUrl: './admin-resources-list.component.html',
  styleUrls: ['./admin-resources-list.component.scss'],
})
export class AdminResourcesListComponent implements OnInit {
  private readonly adminResources = inject(AdminResourceService);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly resources = signal<AdminResourceDto[]>([]);
  readonly selectedResource = signal<AdminResourceDto | null>(null);
  readonly resourceStatusModalResource = signal<AdminResourceDto | null>(null);
  readonly resourceStatusSuccess = signal<string | null>(null);
  readonly resourceStatusError = signal<string | null>(null);

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.resources().length === 0,
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminResources.getResources().subscribe({
      next: resources => {
        this.resources.set(Array.isArray(resources) ? resources : []);
        this.loading.set(false);
      },
      error: err => {
        console.error('[AdminResourcesList] resources load error', err);
        this.resources.set([]);
        this.error.set('No fue posible cargar los recursos.');
        this.loading.set(false);
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

  onResourceStatusUpdated(updatedResource: AdminResourceDto): void {
    this.closeResourceStatusModal();
    this.resourceStatusError.set(null);

    this.resources.update(resources =>
      resources.map(resource => resource.id === updatedResource.id ? updatedResource : resource),
    );
    if (this.selectedResource()?.id === updatedResource.id) {
      this.selectedResource.set(updatedResource);
    }
    this.resourceStatusSuccess.set('Estado del recurso actualizado correctamente.');
  }

  trackResource(index: number, resource: AdminResourceDto): string {
    const id = this.valueFromKeys(resource, ['id']);
    return id === undefined || id === null || id === '' ? String(index) : String(id);
  }

  resourceId(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['id']));
  }

  resourceName(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['name']));
  }

  resourceKey(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['key']));
  }

  resourceType(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['type']));
  }

  resourceStatus(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['status']));
  }

  resourceVisibility(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['visibility']));
  }

  resourceFields(resource: AdminResourceDto): DetailField[] {
    return [
      { label: 'ID', value: this.valueFromKeys(resource, ['id']) },
      { label: 'Nombre', value: this.valueFromKeys(resource, ['name']) },
      { label: 'Key', value: this.valueFromKeys(resource, ['key']) },
      { label: 'Tipo', value: this.valueFromKeys(resource, ['type']) },
      { label: 'Estado', value: this.valueFromKeys(resource, ['status']), kind: 'status' as const },
      { label: 'Visibilidad', value: this.valueFromKeys(resource, ['visibility']) },
      { label: 'Creado', value: this.valueFromKeys(resource, ['createdAt']), kind: 'date' as const },
      { label: 'Actualizado', value: this.valueFromKeys(resource, ['updatedAt']), kind: 'date' as const },
    ];
  }

  openResourceDetail(resource: AdminResourceDto): void {
    this.selectedResource.set(resource);
  }

  closeResourceDetail(): void {
    this.selectedResource.set(null);
  }

  statusClass(value: unknown): string {
    const normalized = this.formatValue(value).toLowerCase();

    if (['true', 'active', 'enabled', 'available', 'ready', 'ok'].includes(normalized)) {
      return 'admin-resources__status admin-resources__status--success';
    }

    if (['false', 'disabled', 'revoked', 'inactive', 'suspended', 'cancelled', 'failed'].includes(normalized)) {
      return 'admin-resources__status admin-resources__status--pending';
    }

    return 'admin-resources__status';
  }

  formatDate(value: unknown): string {
    if (typeof value !== 'string' || !value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  formatValue(value: unknown): string {
    if (!this.hasValue(value)) return '-';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '-';
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
