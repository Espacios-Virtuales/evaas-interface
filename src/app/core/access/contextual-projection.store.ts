import { HttpErrorResponse } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { ContextualProjectionDto } from '../models/evaas-contracts.model';
import { MeService } from '../services/me.service';

export type ContextualProjectionState = 'LOADING' | 'READY' | 'ERROR';

@Injectable({ providedIn: 'root' })
export class ContextualProjectionStore {
  private readonly meService = inject(MeService);
  private inFlightRequest: Observable<ContextualProjectionDto> | null = null;

  private readonly projectionValue = signal<ContextualProjectionDto | null>(null);
  private readonly stateValue = signal<ContextualProjectionState>('LOADING');
  private readonly errorMessageValue = signal<string | null>(null);
  private readonly errorStatusValue = signal<number | null>(null);

  readonly projection = this.projectionValue.asReadonly();
  readonly state = this.stateValue.asReadonly();
  readonly errorMessage = this.errorMessageValue.asReadonly();
  readonly errorStatus = this.errorStatusValue.asReadonly();
  readonly loading = computed(() => this.stateValue() === 'LOADING');
  readonly ready = computed(() => this.stateValue() === 'READY');

  load(): Observable<ContextualProjectionDto> {
    const cached = this.projectionValue();
    if (this.stateValue() === 'READY' && cached) {
      return of(cached);
    }

    if (this.inFlightRequest) {
      return this.inFlightRequest;
    }

    this.stateValue.set('LOADING');
    this.errorMessageValue.set(null);
    this.errorStatusValue.set(null);

    let request: Observable<ContextualProjectionDto>;
    request = this.meService.getMyContextualProjection().pipe(
      tap(projection => {
        this.projectionValue.set(projection);
        this.stateValue.set('READY');
      }),
      catchError((error: unknown) => {
        this.projectionValue.set(null);
        this.errorStatusValue.set(error instanceof HttpErrorResponse ? error.status : null);
        this.errorMessageValue.set('No fue posible cargar la proyección contextual.');
        this.stateValue.set('ERROR');
        return throwError(() => error);
      }),
      finalize(() => {
        if (this.inFlightRequest === request) {
          this.inFlightRequest = null;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.inFlightRequest = request;
    return request;
  }

  refresh(): Observable<ContextualProjectionDto> {
    this.reset();
    return this.load();
  }

  clear(): void {
    this.reset();
  }

  private reset(): void {
    this.inFlightRequest = null;
    this.projectionValue.set(null);
    this.stateValue.set('LOADING');
    this.errorMessageValue.set(null);
    this.errorStatusValue.set(null);
  }
}
