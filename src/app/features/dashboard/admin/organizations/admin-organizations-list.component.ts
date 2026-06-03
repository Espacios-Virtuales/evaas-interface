import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrganizationDto } from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';

@Component({
  standalone: true,
  selector: 'evaas-admin-organizations-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-organizations-list.component.html',
  styleUrls: ['./admin-organizations-list.component.scss'],
})
export class AdminOrganizationsListComponent implements OnInit {
  private readonly adminAccess = inject(AdminAccessService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organizations = signal<OrganizationDto[]>([]);

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.organizations().length === 0,
  );

  readonly showId = computed(() => this.hasKnownValue('id'));
  readonly showName = computed(() => this.hasKnownValue('name'));
  readonly showStatus = computed(() => this.hasKnownValue('status'));
  readonly showCreatedAt = computed(() => this.hasKnownValue('createdAt'));
  readonly showUpdatedAt = computed(() => this.hasKnownValue('updatedAt'));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminAccess.getOrganizations().subscribe({
      next: organizations => {
        this.organizations.set(Array.isArray(organizations) ? organizations : []);
        this.loading.set(false);
      },
      error: err => {
        console.error('[AdminOrganizationsList] organizations load error', err);
        this.organizations.set([]);
        this.error.set('No fue posible cargar las organizaciones.');
        this.loading.set(false);
      },
    });
  }

  trackOrganization(index: number, organization: OrganizationDto): string {
    return organization.id === undefined || organization.id === null ? String(index) : String(organization.id);
  }

  formatValue(value: string | number | undefined): string {
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
  }

  formatDate(value: string | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  private hasKnownValue(key: keyof Pick<OrganizationDto, 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'>): boolean {
    return this.organizations().some(organization => {
      const value = organization[key];
      return value !== undefined && value !== null && value !== '';
    });
  }
}
