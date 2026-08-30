import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CreateActivationPayload,
  ExternalCommerceActivationDto,
  ExternalCommerceActivationStatus,
} from '../../../../core/models/evaas-contracts.model';
import { AdminCommerceService } from '../../../../core/services/admin-commerce.service';
import { OperationRequestState, mapOperationHttpError } from '../../../../core/http/operation-request-state';
import { ModalInteractionDirective } from '../../../../shared/directives/modal-interaction.directive';


@Component({
  standalone: true,
  selector: 'evaas-admin-activations-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ModalInteractionDirective],
  templateUrl: './admin-activations-list.component.html',
  styleUrls: ['./admin-activations-list.component.scss'],
})
export class AdminActivationsListComponent implements OnInit {
  private readonly adminCommerce = inject(AdminCommerceService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activations = signal<ExternalCommerceActivationDto[]>([]);
  readonly createModalOpen = signal(false);
  readonly createState = signal<OperationRequestState>('IDLE');
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);

  readonly providerOptions = ['INTERNAL', 'MANUAL', 'WOOCOMMERCE', 'PAYPAL', 'TRANSBANK'];
  readonly statusOptions: ExternalCommerceActivationStatus[] = [
    'RECEIVED',
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'EXPIRED',
    'FAILED',
  ];

  readonly createForm = this.fb.nonNullable.group({
    provider: ['INTERNAL', Validators.required],
    productCode: ['', Validators.required],
    buyerEmail: ['', [Validators.required, Validators.email]],
    organizationName: ['', Validators.required],
    status: ['RECEIVED' as ExternalCommerceActivationStatus, Validators.required],
    externalOrderId: [''],
    externalMembershipId: [''],
    idempotencyKey: [''],
  });

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.activations().length === 0,
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminCommerce.getActivations().subscribe({
      next: activations => {
        this.activations.set(Array.isArray(activations) ? activations : []);
        this.loading.set(false);
      },
      error: err => {
        console.error('[AdminActivationsList] activations load error', err);
        this.activations.set([]);
        this.error.set('No fue posible cargar las activaciones.');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.createForm.reset({
      provider: 'INTERNAL',
      productCode: '',
      buyerEmail: '',
      organizationName: '',
      status: 'RECEIVED',
      externalOrderId: '',
      externalMembershipId: '',
      idempotencyKey: '',
    });
    this.createState.set('IDLE');
    this.createError.set(null);
    this.createSuccess.set(null);
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    if (this.createState() === 'SUBMITTING') return;
    this.createModalOpen.set(false);
    this.createState.set('IDLE');
    this.createError.set(null);
  }

  createActivation(): void {
    if (this.createState() === 'SUBMITTING') return;
    this.trimRequiredControls();

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.createState.set('VALIDATION_ERROR');
      this.createError.set(null);
      return;
    }

    this.createState.set('SUBMITTING');
    this.createError.set(null);
    this.createSuccess.set(null);

    this.adminCommerce.createActivation(this.createPayload()).subscribe({
      next: () => {
        this.createState.set('SUCCESS');
        this.createModalOpen.set(false);
        this.createSuccess.set('Activacion creada correctamente.');
        this.load();
      },
      error: err => {
        console.error('[AdminActivationsList] activation create error', err);
        const presentation = mapOperationHttpError(err, {
          fallback: 'No fue posible crear la activacion.',
          unauthorized: 'Tu sesión no está autorizada para crear activaciones.',
          forbidden: 'No tienes permisos para crear activaciones.',
          notFound: 'El contexto requerido para crear la activación ya no está disponible.',
          conflict: 'La activación entra en conflicto con el estado actual.',
        });
        this.createState.set(presentation.state);
        this.createError.set(presentation.message);
      },
    });
  }

  trackActivation(index: number, activation: ExternalCommerceActivationDto): string {
    return activation.id === undefined || activation.id === null ? String(index) : String(activation.id);
  }

  formatValue(value: string | number | undefined | null): string {
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
  }

  formatDate(value: string | undefined | null): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  private trimRequiredControls(): void {
    const controls = this.createForm.controls;
    const trimKeys: Array<keyof Pick<CreateActivationPayload, 'provider' | 'productCode' | 'buyerEmail' | 'organizationName'>> = [
      'provider',
      'productCode',
      'buyerEmail',
      'organizationName',
    ];

    for (const key of trimKeys) {
      const control = controls[key];
      control.setValue(control.value.trim());
    }
  }

  private createPayload(): CreateActivationPayload {
    const value = this.createForm.getRawValue();
    const payload: CreateActivationPayload = {
      provider: value.provider.trim(),
      productCode: value.productCode.trim(),
      buyerEmail: value.buyerEmail.trim(),
      organizationName: value.organizationName.trim(),
      status: value.status,
    };

    const externalOrderId = value.externalOrderId.trim();
    const externalMembershipId = value.externalMembershipId.trim();
    const idempotencyKey = value.idempotencyKey.trim();

    if (externalOrderId) {
      payload.externalOrderId = externalOrderId;
    }

    if (externalMembershipId) {
      payload.externalMembershipId = externalMembershipId;
    }

    if (idempotencyKey) {
      payload.idempotencyKey = idempotencyKey;
    }

    return payload;
  }
}
