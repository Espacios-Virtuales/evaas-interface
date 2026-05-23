import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { MyResourceDto, MyToolAccessDto } from '../../core/models/evaas-contracts.model';
import { MeService } from '../../core/services/me.service';

type ClientDashboardData = {
  toolAccess: MyToolAccessDto[];
  resources: MyResourceDto[];
};

@Component({
  standalone: true,
  selector: 'evaas-client-dashboard',
  imports: [CommonModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss'],
})
export class ClientDashboardComponent implements OnInit {
  private readonly meService = inject(MeService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly toolAccess = signal<MyToolAccessDto[]>([]);
  readonly resources = signal<MyResourceDto[]>([]);

  readonly hasToolAccess = computed(() => this.toolAccess().length > 0);
  readonly hasResources = computed(() => this.resources().length > 0);
  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && !this.hasToolAccess() && !this.hasResources(),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      toolAccess: this.meService.getMyToolAccess(),
      resources: this.meService.getMyResources(),
    })
      .pipe(
        catchError(err => {
          console.error('[ClientDashboard] me contract load error', err);
          this.error.set('No fue posible cargar tus herramientas y recursos.');
          return of<ClientDashboardData>({ toolAccess: [], resources: [] });
        }),
      )
      .subscribe(data => {
        this.toolAccess.set(data.toolAccess);
        this.resources.set(data.resources);
        this.loading.set(false);
      });
  }

  toolAccessLabel(item: MyToolAccessDto): string {
    if (item.revokedAt) return `Revocado ${this.formatDate(item.revokedAt)}`;
    if (item.grantedAt) return `Desde ${this.formatDate(item.grantedAt)}`;
    return 'Contrato observado';
  }

  resourceName(resource: MyResourceDto): string {
    return this.firstText(resource, [
      'resourceName',
      'name',
      'displayName',
      'resourceKey',
      'toolKey',
      'id',
    ]);
  }

  resourceStatus(resource: MyResourceDto): string {
    return this.firstText(resource, ['status', 'state', 'resourceStatus']);
  }

  resourceBaseConfiguration(resource: MyResourceDto): string {
    const value = this.firstKnownValue(resource, [
      'baseConfiguration',
      'configurationBase',
      'baseConfig',
      'configBase',
    ]);

    if (value === undefined || value === null || value === '') return 'Pendiente contrato';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return 'Configuración disponible';
  }

  resourceAccess(resource: MyResourceDto): string {
    const access = this.firstText(resource, ['access', 'accessStatus', 'permission', 'permissions']);
    if (access !== '-') return access;

    const grantedAt = this.firstKnownValue(resource, ['grantedAt', 'assignedAt', 'createdAt']);
    if (typeof grantedAt === 'string' && grantedAt) return `Desde ${this.formatDate(grantedAt)}`;

    return 'Contrato observado';
  }

  trackToolAccess(_: number, item: MyToolAccessDto): string {
    return `${item.organizationId}-${item.toolKey}`;
  }

  trackResource(index: number, resource: MyResourceDto): string {
    const id = this.firstKnownValue(resource, ['id', 'resourceId', 'resourceKey']);
    return id === undefined || id === null ? String(index) : String(id);
  }

  private firstText(resource: MyResourceDto, keys: string[]): string {
    const value = this.firstKnownValue(resource, keys);
    if (value === undefined || value === null || value === '') return '-';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      const safeValues = value.filter(
        item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean',
      );
      return safeValues.length > 0 ? safeValues.join(', ') : '-';
    }
    return '-';
  }

  private firstKnownValue(resource: MyResourceDto, keys: string[]): unknown {
    return keys.map(key => resource[key]).find(value => value !== undefined && value !== null);
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }
}
