import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface AdminInstrument {
  name: string;
  function: string;
  status: string;
  scope: string;
  description: string;
  route: string;
}

@Component({
  standalone: true,
  selector: 'evaas-admin-instruments-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-instruments-overview.component.html',
  styleUrls: ['./admin-instruments-overview.component.scss'],
})
export class AdminInstrumentsOverviewComponent {
  readonly instruments: AdminInstrument[] = [
    {
      name: 'Comunicador',
      function: 'Comunicación',
      status: 'Piloto / Preparando integración',
      scope: 'Borradores y consulta técnica',
      description:
        'Instrumento comunicacional orientado a preparar borradores y consultar estados técnicos de comunicación mediante EVAAS Core.',
      route: '/dashboard/admin/instruments/comunicador',
    },
  ];

  trackInstrument(_: number, instrument: AdminInstrument): string {
    return instrument.name;
  }
}
