// src/app/core/auth/session-watcher.service.ts
import { Injectable, inject, DestroyRef, afterNextRender } from '@angular/core';
import { AuthStore } from './auth.store';
import {AuthFacade} from './auth.facade';

@Injectable({ providedIn: 'root' })
export class SessionWatcherService {
  private store = inject(AuthStore);
  private destroyRef = inject(DestroyRef);
  private authFacade = inject(AuthFacade);


  // Timers (no signals)
  private bootTimerId: number | null = null;
  private expTimerId: number | null = null;

  // Config
  private static readonly BOOT_DELAY_MS = 10 * 60 * 1000; // ⏳ 10 minutos
  private static readonly REFRESH_SKEW_MS = 90 * 1000;    // ⚖️ 90s de tolerancia

  constructor() {
    // Arranca sólo después del primer render y con delay de 10 min
    afterNextRender(() => {
      this.bootTimerId = window.setTimeout(() => this.start(), SessionWatcherService.BOOT_DELAY_MS);
    });

    // Limpieza segura si el inyector se destruye (SSR/testing)
    this.destroyRef.onDestroy(() => {
      if (this.bootTimerId !== null) clearTimeout(this.bootTimerId);
      if (this.expTimerId  !== null) clearTimeout(this.expTimerId);
    });
  }

  private start() {
    // Cada vez que cambie la sesión, reprograma el timer.
    // No usamos `effect()` para evitar escrituras reactivas internas:
    // nos suscribimos leyendo “pull” cuando haga falta.
    // Como tu store expone 'session' como computed (getter),
    // podemos usar un MutationObserver manual: aquí opto por un pequeño polling liviano.
    // Si prefieres signals, ver versión con `effect` más abajo.

    // ——— Versión simple: recalcular al instante y cuando cambie la pestaña ———
    const recalc = () => {
      // limpia timer previo
      if (this.expTimerId !== null) {
        clearTimeout(this.expTimerId);
        this.expTimerId = null;
      }

      const s = this.store.session();
      if (!s) return;

      const refreshExpMs =
        s.refreshExp instanceof Date ? s.refreshExp.getTime() : new Date(s.refreshExp).getTime();
      if (Number.isNaN(refreshExpMs)) return;

      const now = Date.now();
      const msToRefreshExpiry = refreshExpMs - now;

      // Si "parece vencido" pero dentro del margen de 90s → no expulsar
      if (msToRefreshExpiry <= 0 && msToRefreshExpiry > -SessionWatcherService.REFRESH_SKEW_MS) {
        return;
      }

      // Si pasó el margen → logout diferido
      if (msToRefreshExpiry <= -SessionWatcherService.REFRESH_SKEW_MS) {
        queueMicrotask(() =>
          this.safeLogout('Sesión expirada. Vuelve a iniciar sesión.')
        );
        return;
      }

      // Aún falta → programa el logout (al expirar)
      this.expTimerId = window.setTimeout(() => {
        this.safeLogout('Sesión expirada. Vuelve a iniciar sesión.');
      }, msToRefreshExpiry);
    };

    // Calcula ahora
    recalc();

    // Recalcular en eventos típicos (por simplicidad):
    // - visibilidad de página (por si el usuario vuelve luego de rato)
    // - storage (si otro tab cambió la sesión)
    const onVisibility = () => { if (document.visibilityState === 'visible') recalc(); };
    const onStorage = (e: StorageEvent) => { if (e.key === 'session') recalc(); };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);

    this.destroyRef.onDestroy(() => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
    });
  }

  private safeLogout(reason?: string) {
    this.authFacade.logout(reason);
  }
}
