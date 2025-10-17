// src/app/core/auth/session-watcher.service.ts
import { Injectable, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class SessionWatcherService {
  private store = inject(AuthStore);
  private router = inject(Router);
  private timerId = signal<number | null>(null);

  constructor() {
    effect(() => {
      // limpia cualquier timer anterior
      const prev = this.timerId();
      if (prev !== null) {
        clearTimeout(prev);
        this.timerId.set(null);
      }

      const s = this.store.session();
      if (!s) return;

      const now = Date.now();
      const msToRefreshExpiry = s.refreshExp.getTime() - now;

      if (msToRefreshExpiry <= 0) {
        // refresh ya expiró → logout inmediato
        this.safeLogout('Sesión expirada (refresh). Vuelve a iniciar sesión.');
        return;
      }

      // programa logout cuando caduque el refresh token
      const id = window.setTimeout(() => {
        this.safeLogout('Sesión expirada. Vuelve a iniciar sesión.');
      }, msToRefreshExpiry);

      this.timerId.set(id);

      // (opcional) si quieres también avisar cuando falte poco:
      // const thresholdMs = 60_000; // 1 min antes
      // if (msToRefreshExpiry > thresholdMs) {
      //   window.setTimeout(() => {
      //     // aquí podrías disparar un snackbar: "Tu sesión caduca en 1 min"
      //   }, msToRefreshExpiry - thresholdMs);
      // }
    });
  }

  private safeLogout(reason?: string) {
    this.store.clear();
    // opcional: pasa el motivo en query param para mostrar alerta en login
    this.router.navigate(['/login'], { queryParams: reason ? { reason } : undefined });
  }
}