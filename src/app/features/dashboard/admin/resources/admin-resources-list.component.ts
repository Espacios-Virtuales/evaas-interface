import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminResourceDto } from '../../../../core/models/evaas-contracts.model';
import { AdminResourceService } from '../../../../core/services/admin-resource.service';

type ResourceLink = {
  label: string;
  url: string;
};

@Component({
  standalone: true,
  selector: 'evaas-admin-resources-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-resources-list.component.html',
  styleUrls: ['./admin-resources-list.component.scss'],
})
export class AdminResourcesListComponent implements OnInit {
  private readonly adminResources = inject(AdminResourceService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly resources = signal<AdminResourceDto[]>([]);

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
    return this.formatValue(this.valueFromKeys(resource, ['key', 'resourceKey']));
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

  resourceOrganization(resource: AdminResourceDto): string {
    return this.formatValue(this.valueFromKeys(resource, ['organizationName', 'organizationId']));
  }

  resourceDetailLink(resource: AdminResourceDto): string[] | null {
    const id = this.valueFromKeys(resource, ['id']);
    if (id === undefined || id === null || id === '') return null;

    return ['/dashboard/admin/resources', String(id)];
  }

  resourceLinks(resource: AdminResourceDto): ResourceLink[] {
    const links: ResourceLink[] = [];
    this.addLink(links, 'URL', this.valueFromKeys(resource, ['url']));
    this.addLink(links, 'URL operacional', this.valueFromKeys(resource, ['operationalUrl']));
    return links;
  }

  private addLink(links: ResourceLink[], label: string, value: unknown): void {
    if (typeof value !== 'string' || !value.trim()) return;

    const url = value.trim();
    if (links.some(link => link.url === url)) return;

    links.push({ label, url });
  }

  private formatValue(value: unknown): string {
    if (value === undefined || value === null || value === '') return '-';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '-';
  }

  private valueFromKeys(source: AdminResourceDto, keys: string[]): unknown {
    for (const key of keys) {
      const value = source[key];

      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    return undefined;
  }
}
