import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AdminInstrumentService } from '../../../../core/services/admin-instrument.service';

type CommunicatorState = 'LOADING' | 'AVAILABLE' | 'UNAVAILABLE' | 'ERROR';

@Component({
  standalone: true,
  selector: 'evaas-admin-communicator-instrument-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-communicator-instrument-detail.component.html',
  styleUrls: ['./admin-communicator-instrument-detail.component.scss'],
})
export class AdminCommunicatorInstrumentDetailComponent implements OnInit {
  private readonly adminInstruments = inject(AdminInstrumentService);

  readonly state = signal<CommunicatorState>('LOADING');
  readonly error = signal<string | null>(null);
  readonly pilotScope = [
    'Preparación de borradores',
    'Consulta manual de estado técnico',
    'Trazabilidad de comunicación',
  ];

  readonly unavailableScope = [
    'Envío directo desde EVAAS Interface',
    'Aprobación remota',
    'Callback HMAC',
    'Polling automático',
    'WhatsApp',
    'Telegram',
    'Automatización de campañas',
  ];

  ngOnInit(): void {
    this.loadAvailability();
  }

  loadAvailability(): void {
    this.state.set('LOADING');
    this.error.set(null);

    this.adminInstruments.getInstruments().subscribe({
      next: instruments => {
        const isAvailable = Array.isArray(instruments)
          && instruments.some(instrument => instrument.key === 'LIORA');
        this.state.set(isAvailable ? 'AVAILABLE' : 'UNAVAILABLE');
      },
      error: error => {
        this.error.set(this.errorMessage(error));
        this.state.set('ERROR');
      },
    });
  }

  private errorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'No tienes una sesión autorizada para consultar el catálogo de instrumentos.';
    if (status === 403) return 'No tienes permisos para consultar el catálogo de instrumentos.';
    if (status === 404) return 'El catálogo canónico de instrumentos no está disponible.';

    return 'No fue posible confirmar la disponibilidad de Comunicador.';
  }
}
