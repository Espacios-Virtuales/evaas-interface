import { HttpErrorResponse } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { MyAccessContextDto } from '../models/evaas-contracts.model';
import { MeService } from '../services/me.service';

export type AccessContextState = 'LOADING' | 'READY' | 'ERROR';

@Injectable({ providedIn: 'root' })
export class AccessContextStore {
  private readonly meService = inject(MeService);
  private readonly authStore = inject(AuthStore);
  private inFlightRequest: Observable<MyAccessContextDto> | null = null;

  private readonly contextValue = signal<MyAccessContextDto | null>(null);
  private readonly stateValue = signal<AccessContextState>('LOADING');
  private readonly errorMessageValue = signal<string | null>(null);
  private readonly errorStatusValue = signal<number | null>(null);

  readonly context = this.contextValue.asReadonly();
  readonly state = this.stateValue.asReadonly();
  readonly errorMessage = this.errorMessageValue.asReadonly();
  readonly errorStatus = this.errorStatusValue.asReadonly();
  readonly loading = computed(() => this.stateValue() === 'LOADING');
  readonly ready = computed(() => this.stateValue() === 'READY');

  load(): Observable<MyAccessContextDto> {
    const cached = this.contextValue();
    if (this.stateValue() === 'READY' && cached) {
      return of(cached);
    }

    if (this.inFlightRequest) {
      return this.inFlightRequest;
    }

    this.stateValue.set('LOADING');
    this.errorMessageValue.set(null);
    this.errorStatusValue.set(null);

    let request: Observable<MyAccessContextDto>;
    request = this.meService.getMyAccessContext().pipe(
      tap(context => {
        this.contextValue.set(context);
        this.stateValue.set('READY');
      }),
      catchError((error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : null;
        this.contextValue.set(null);
        this.errorStatusValue.set(status);
        this.errorMessageValue.set('No fue posible cargar tu perfil de acceso.');
        this.stateValue.set('ERROR');

        if (status === 401) {
          this.authStore.clear();
        }

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

  refresh(): Observable<MyAccessContextDto> {
    this.reset();
    return this.load();
  }

  clear(): void {
    this.reset();
  }

  invalidateSession(): void {
    this.authStore.clear();
    this.reset();
  }

  private reset(): void {
    this.inFlightRequest = null;
    this.contextValue.set(null);
    this.stateValue.set('LOADING');
    this.errorMessageValue.set(null);
    this.errorStatusValue.set(null);
  }
}
