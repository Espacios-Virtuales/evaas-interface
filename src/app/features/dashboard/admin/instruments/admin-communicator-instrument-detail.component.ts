import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'evaas-admin-communicator-instrument-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-communicator-instrument-detail.component.html',
  styleUrls: ['./admin-communicator-instrument-detail.component.scss'],
})
export class AdminCommunicatorInstrumentDetailComponent {
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
}
