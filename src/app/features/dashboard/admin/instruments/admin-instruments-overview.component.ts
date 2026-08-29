import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminInstrumentDto } from '../../../../core/models/evaas-contracts.model';
import { AdminInstrumentService } from '../../../../core/services/admin-instrument.service';

type InstrumentsState =
  | 'LOADING'
  | 'EMPTY'
  | 'POPULATED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'ERROR';

@Component({
  standalone: true,
  selector: 'evaas-admin-instruments-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-instruments-overview.component.html',
  styleUrls: ['./admin-instruments-overview.component.scss'],
})
export class AdminInstrumentsOverviewComponent implements OnInit {
  private readonly adminInstruments = inject(AdminInstrumentService);

  readonly state = signal<InstrumentsState>('LOADING');
  readonly error = signal<string | null>(null);
  readonly instruments = signal<AdminInstrumentDto[]>([]);
  readonly isEmpty = computed(() => this.state() === 'EMPTY');
  readonly isError = computed(() =>
    ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'ERROR'].includes(this.state()),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.state.set('LOADING');
    this.error.set(null);

    this.adminInstruments.getInstruments().subscribe({
      next: instruments => {
        const catalogue = Array.isArray(instruments) ? instruments : [];
        this.instruments.set(catalogue);
        this.state.set(catalogue.length === 0 ? 'EMPTY' : 'POPULATED');
      },
      error: error => {
        this.instruments.set([]);
        this.error.set(this.errorMessage(error));
        this.state.set(this.errorState(error));
      },
    });
  }

  instrumentLabel(instrument: AdminInstrumentDto): string {
    return this.instrumentKey(instrument) === 'LIORA' ? 'Comunicador' : this.instrumentKey(instrument);
  }

  instrumentKey(instrument: AdminInstrumentDto): string {
    return typeof instrument.key === 'string' && instrument.key.trim() ? instrument.key.trim() : 'Sin clave';
  }

  instrumentDescription(instrument: AdminInstrumentDto): string {
    const description = instrument['description'];
    return typeof description === 'string' && description.trim()
      ? description.trim()
      : 'Sin descripción expuesta por el catálogo.';
  }

  hasDetail(instrument: AdminInstrumentDto): boolean {
    return this.instrumentKey(instrument) === 'LIORA';
  }

  trackInstrument(_: number, instrument: AdminInstrumentDto): string {
    return this.instrumentKey(instrument);
  }

  private errorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;

    if (status === 401) return 'No tienes una sesión autorizada para consultar el catálogo de instrumentos.';
    if (status === 403) return 'No tienes permisos para consultar el catálogo de instrumentos.';
    if (status === 404) return 'El catálogo canónico de instrumentos no está disponible.';
    if (status === 409) return 'El catálogo de instrumentos está en conflicto. Intenta nuevamente.';

    return 'No fue posible cargar el catálogo canónico de instrumentos.';
  }

  private errorState(error: unknown): InstrumentsState {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';

    return 'ERROR';
  }
}
