import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminResourceDto } from '../../../../core/models/evaas-contracts.model';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';

type ResourceLink = {
  label: string;
  url: string;
};

type DetailFieldKind = 'date' | 'status' | 'url';

interface DetailField {
  label: string;
  value: unknown;
  kind?: DetailFieldKind;
}

@Component({
  standalone: true,
  selector: 'evaas-admin-resources-list',
  imports: [CommonModule, RouterLink, ModalInteractionDirective],
  templateUrl: './admin-resources-list.component.html',
  styleUrls: ['./admin-resources-list.component.scss'],
})
export class AdminResourcesListComponent implements OnInit {
  private readonly adminResources = inject(AdminResourceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly resources = signal<AdminResourceDto[]>([]);
  readonly selectedResource = signal<AdminResourceDto | null>(null);
  readonly resourceDetailLoading = signal(false);
  readonly resourceDetailError = signal<string | null>(null);

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

  resourceProvider(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['provider']));
  }

  resourceStatus(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['status']));
  }

  resourceVisibility(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['visibility']));
  }

  resourceOrganization(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['organizationName', 'organizationId']));
  }

  resourceToolAccessId(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['toolAccessId']));
  }

  resourceFields(resource: AdminResourceDto): DetailField[] {
    return [
      { label: 'ID', value: this.valueFromKeys(resource, ['id']) },
      { label: 'Nombre', value: this.valueFromKeys(resource, ['name']) },
      { label: 'Key', value: this.valueFromKeys(resource, ['key']) },
      { label: 'Tipo', value: this.valueFromKeys(resource, ['type']) },
      { label: 'Proveedor', value: this.valueFromKeys(resource, ['provider']) },
      { label: 'Estado', value: this.valueFromKeys(resource, ['status']), kind: 'status' as const },
      { label: 'Visibilidad', value: this.valueFromKeys(resource, ['visibility']) },
      { label: 'Organización', value: this.valueFromKeys(resource, ['organizationName', 'organizationId']) },
      { label: 'ToolAccess', value: this.valueFromKeys(resource, ['toolAccessId']) },
      { label: 'URL', value: this.valueFromKeys(resource, ['url']), kind: 'url' as const },
      { label: 'Creado', value: this.valueFromKeys(resource, ['createdAt']), kind: 'date' as const },
      { label: 'Actualizado', value: this.valueFromKeys(resource, ['updatedAt']), kind: 'date' as const },
    ].filter(field => this.hasValue(field.value));
  }

  openResourceDetail(resource: AdminResourceDto): void {
    this.selectedResource.set(resource);
    this.resourceDetailError.set(null);

    const id = this.resourceNumericId(resource);
    if (id === null) return;

    this.resourceDetailLoading.set(true);
    this.adminResources
      .getResourceById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: detail => {
          this.selectedResource.set(detail ?? resource);
          this.resourceDetailLoading.set(false);
        },
        error: err => {
          console.error('[AdminResourcesList] resource detail load error', err);
          this.resourceDetailError.set('No fue posible cargar el detalle remoto; se muestra la fila disponible.');
          this.resourceDetailLoading.set(false);
        },
      });
  }

  closeResourceDetail(): void {
    this.selectedResource.set(null);
    this.resourceDetailLoading.set(false);
    this.resourceDetailError.set(null);
  }

  resourceLinks(resource: AdminResourceDto | null): ResourceLink[] {
    const links: ResourceLink[] = [];
    if (!resource) return links;

    this.addLink(links, 'URL', this.valueFromKeys(resource, ['url']));
    return links;
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

  private addLink(links: ResourceLink[], label: string, value: unknown): void {
    if (typeof value !== 'string' || !value.trim()) return;

    const url = value.trim();
    if (links.some(link => link.url === url)) return;

    links.push({ label, url });
  }

  formatValue(value: unknown): string {
    if (!this.hasValue(value)) return '-';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '-';
  }

  private resourceNumericId(resource: AdminResourceDto): number | null {
    const value = this.valueFromKeys(resource, ['id']);
    const id = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;

    return Number.isInteger(id) && id > 0 ? id : null;
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
