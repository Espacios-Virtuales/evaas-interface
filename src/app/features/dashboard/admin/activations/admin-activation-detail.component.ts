import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { Subject, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs';
import { ExternalCommerceActivationDto } from '../../../../core/models/evaas-contracts.model';
import { AdminCommerceService } from '../../../../core/services/admin-commerce.service';

type ActivationRecord = ExternalCommerceActivationDto & Record<string, unknown>;

interface DetailField {
  label: string;
  value: unknown;
  type?: 'date';
}

@Component({
  standalone: true,
  selector: 'evaas-admin-activation-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-activation-detail.component.html',
  styleUrls: ['./admin-activation-detail.component.scss'],
})
export class AdminActivationDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly adminCommerce = inject(AdminCommerceService);
  private readonly destroy$ = new Subject<void>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activation = signal<ActivationRecord | null>(null);
  readonly notFound = signal(false);

  readonly detailFields = computed<DetailField[]>(() => {
    const activation = this.activation();
    if (!activation) return [];

    return [
      this.field(activation, 'id', 'ID'),
      this.firstField(activation, ['status'], 'Estado'),
      this.firstField(activation, ['type', 'productCode'], 'Tipo'),
      this.firstField(activation, ['source', 'provider'], 'Origen'),
      this.field(activation, 'buyerEmail', 'Email comprador'),
      this.field(activation, 'buyerName', 'Nombre comprador'),
      this.field(activation, 'organizationId', 'ID organizacion'),
      this.field(activation, 'organizationName', 'Organizacion'),
      this.firstField(activation, ['externalReference', 'externalOrderId', 'externalMembershipId'], 'Referencia externa'),
      this.field(activation, 'createdAt', 'Creado', 'date'),
      this.field(activation, 'updatedAt', 'Actualizado', 'date'),
    ].filter((field): field is DetailField => field !== null);
  });

  readonly organizationId = computed(() => {
    const value = this.activation()?.['organizationId'];
    return value === undefined || value === null || value === '' ? null : String(value);
  });

  readonly metadataText = computed(() => {
    const metadata = this.activation()?.['metadataJson'];
    if (metadata === undefined || metadata === null || metadata === '') return null;

    if (typeof metadata === 'string') {
      try {
        return JSON.stringify(JSON.parse(metadata), null, 2);
      } catch {
        return metadata;
      }
    }

    if (typeof metadata === 'object') {
      try {
        return JSON.stringify(metadata, null, 2);
      } catch {
        return String(metadata);
      }
    }

    return String(metadata);
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => this.parseActivationId(params)),
      distinctUntilChanged(),
      tap(id => this.prepareLoad(id)),
      switchMap(id => this.adminCommerce.getActivationById(id)),
      takeUntil(this.destroy$),
    ).subscribe({
      next: activation => {
        this.activation.set(activation as ActivationRecord);
        this.notFound.set(false);
        this.loading.set(false);
      },
      error: err => {
        console.error('[AdminActivationDetail] activation detail load error', err);
        this.activation.set(null);
        this.loading.set(false);
        this.notFound.set(err?.status === 404);
        this.error.set(
          err?.status === 404
            ? null
            : err?.error?.message ?? err?.message ?? 'No fue posible cargar el detalle de la activacion.',
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry(): void {
    const id = this.parseActivationId(this.route.snapshot.paramMap);
    this.prepareLoad(id);

    this.adminCommerce.getActivationById(id).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: activation => {
        this.activation.set(activation as ActivationRecord);
        this.notFound.set(false);
        this.loading.set(false);
      },
      error: err => {
        console.error('[AdminActivationDetail] activation detail retry error', err);
        this.activation.set(null);
        this.loading.set(false);
        this.notFound.set(err?.status === 404);
        this.error.set(
          err?.status === 404
            ? null
            : err?.error?.message ?? err?.message ?? 'No fue posible cargar el detalle de la activacion.',
        );
      },
    });
  }

  formatValue(value: unknown, type?: 'date'): string {
    if (value === undefined || value === null || value === '') return '-';
    if (type === 'date' && typeof value === 'string') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
    }
    return String(value);
  }

  private parseActivationId(params: ParamMap): number {
    const rawId = params.get('id');
    const id = Number(rawId);

    if (!rawId || !Number.isInteger(id) || id <= 0) {
      throw new Error('Identificador de activacion invalido.');
    }

    return id;
  }

  private prepareLoad(_id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.activation.set(null);
  }

  private field(
    activation: ActivationRecord,
    key: string,
    label: string,
    type?: 'date',
  ): DetailField | null {
    if (!Object.prototype.hasOwnProperty.call(activation, key)) return null;
    return { label, value: activation[key], type };
  }

  private firstField(
    activation: ActivationRecord,
    keys: string[],
    label: string,
  ): DetailField | null {
    const key = keys.find(candidate => Object.prototype.hasOwnProperty.call(activation, candidate));
    return key ? { label, value: activation[key] } : null;
  }
}
