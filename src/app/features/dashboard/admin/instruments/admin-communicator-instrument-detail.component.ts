import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LioraEvidenceV1Dto, LioraEvidenceOrganizationDto } from '../../../../core/models/evaas-contracts.model';
import { MeService } from '../../../../core/services/me.service';

type LioraEvidenceState = 'LOADING' | 'READY' | 'EMPTY' | 'ERROR';

@Component({
  standalone: true,
  selector: 'evaas-admin-communicator-instrument-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-communicator-instrument-detail.component.html',
  styleUrls: ['./admin-communicator-instrument-detail.component.scss'],
})
export class AdminCommunicatorInstrumentDetailComponent implements OnInit {
  private readonly me = inject(MeService);

  readonly state = signal<LioraEvidenceState>('LOADING');
  readonly projection = signal<LioraEvidenceV1Dto | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadEvidence();
  }

  private loadEvidence(): void {
    this.state.set('LOADING');
    this.projection.set(null);
    this.error.set(null);

    this.me.getMyLioraEvidence().subscribe({
      next: projection => {
        this.projection.set(projection);
        this.state.set(projection.organizations.length === 0 ? 'EMPTY' : 'READY');
      },
      error: error => {
        this.error.set(this.errorMessage(error));
        this.state.set('ERROR');
      },
    });
  }

  readonly trackOrganization = (
    index: number,
    organization: LioraEvidenceOrganizationDto | null | undefined,
  ): string | number => organization?.organizationRef ?? index;

  readonly trackEvidence = (
    index: number,
    evidence: LioraEvidenceOrganizationDto['evidence'][number] | null | undefined,
  ): string | number => evidence?.actionRef ?? index;

  formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  private errorMessage(error: unknown): string {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 401) return 'Tu sesión no está autorizada para consultar esta evidencia.';
    if (status === 403) return 'No tienes acceso a esta evidencia.';
    if (status === 404) return 'La proyección de evidencia LIORA no está disponible.';
    return 'No fue posible cargar la evidencia de LIORA.';
  }
}
