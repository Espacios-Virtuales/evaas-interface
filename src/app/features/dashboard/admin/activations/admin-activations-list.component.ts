import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExternalCommerceActivationDto } from '../../../../core/models/evaas-contracts.model';
import { AdminCommerceService } from '../../../../core/services/admin-commerce.service';

@Component({
  standalone: true,
  selector: 'evaas-admin-activations-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-activations-list.component.html',
  styleUrls: ['./admin-activations-list.component.scss'],
})
export class AdminActivationsListComponent implements OnInit {
  private readonly adminCommerce = inject(AdminCommerceService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activations = signal<ExternalCommerceActivationDto[]>([]);

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
}
