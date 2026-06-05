import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  CreateOrganizationRequest,
  OrganizationDto,
} from '../../../../core/models/evaas-contracts.model';
import { AdminAccessService } from '../../../../core/services/admin-access.service';

type CreateState = 'idle' | 'loading' | 'success' | 'error' | 'validation';

@Component({
  standalone: true,
  selector: 'evaas-admin-organizations-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-organizations-list.component.html',
  styleUrls: ['./admin-organizations-list.component.scss'],
})
export class AdminOrganizationsListComponent implements OnInit {
  private readonly adminAccess = inject(AdminAccessService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly organizations = signal<OrganizationDto[]>([]);
  readonly createModalOpen = signal(false);
  readonly createState = signal<CreateState>('idle');
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    taxId: [''],
    ownerUserId: this.fb.control<number | null>(null),
  });

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

  openCreateModal(): void {
    this.createForm.reset({ name: '', taxId: '', ownerUserId: null });
    this.createState.set('idle');
    this.createError.set(null);
    this.createSuccess.set(null);
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    if (this.createState() === 'loading') return;
    this.createModalOpen.set(false);
    this.createState.set('idle');
    this.createError.set(null);
  }

  createOrganization(): void {
    if (!this.createForm.controls.name.value.trim()) {
      this.createForm.controls.name.setErrors({ required: true });
    }

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.createState.set('validation');
      this.createError.set(null);
      return;
    }

    this.createState.set('loading');
    this.createError.set(null);
    this.createSuccess.set(null);

    this.adminAccess.createOrganization(this.createPayload()).subscribe({
      next: organization => {
        this.createState.set('success');
        this.createModalOpen.set(false);
        this.createSuccess.set('Organizacion creada correctamente.');
        this.load();

        if (organization?.id) {
          this.router.navigate(['/dashboard/admin/organizations', organization.id]);
        }
      },
      error: err => {
        console.error('[AdminOrganizationsList] organization create error', err);
        this.createState.set('error');
        this.createError.set(
          err?.error?.message ?? err?.message ?? 'No fue posible crear la organizacion.',
        );
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

  private createPayload(): CreateOrganizationRequest {
    const value = this.createForm.getRawValue();
    const payload: CreateOrganizationRequest = { name: value.name.trim() };
    const taxId = value.taxId.trim();

    if (taxId) {
      payload.taxId = taxId;
    }

    if (value.ownerUserId !== null && value.ownerUserId !== undefined) {
      payload.ownerUserId = value.ownerUserId;
    }

    return payload;
  }
}
