// src/app/core/interceptors/refresh-token-interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuthStore } from '../auth/auth.store';
import { API, apiUrl } from '../http/api.endpoints';
import { AuthFacade } from '../auth/auth.facade';

let refreshing = false;
const refreshDone$ = new BehaviorSubject<boolean>(false);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const store = inject(AuthStore);
  const facade = inject(AuthFacade);

  // Pasar directo las rutas de auth para evitar loops
  if (
    req.url.startsWith(apiUrl(API.auth.login)) ||
    req.url.startsWith(apiUrl(API.auth.refresh)) ||
    req.url.startsWith(apiUrl(API.auth.logout))
  ) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      // Solo intentamos refresh ante 401/419
      if (!(err instanceof HttpErrorResponse)) return throwError(() => err);
      const status = err.status;
      if (status !== 401 && status !== 419) return throwError(() => err);

      const s = store.session();
      if (!s?.refreshToken) {
        // no hay cómo refrescar → logout
        facade.logout('Sesión expirada. Vuelve a iniciar sesión.');
        return throwError(() => err);
      }

      // Si YA se está refrescando, esperar a que termine y reintentar esta request
      if (refreshing) {
        return refreshDone$.pipe(
          filter(done => done === true),
          take(1),
          switchMap(() => {
            const token = store.session()?.accessToken;
            const retry = token
              ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
              : req;
            return next(retry);
          })
        );
      }

      // Iniciar refresh (una sola vez)
      refreshing = true;
      refreshDone$.next(false);

      return auth.refresh(s.refreshToken).pipe(
        switchMap(partialSession => {
          // Actualiza la sesión conservando campos que no vengan en el refresh
          const curr = store.session();
          if (!curr) throw new Error('No session in store during refresh.');
          store.setSession({
            ...curr,
            ...partialSession, // debe traer al menos accessToken + accessTokenExp; opcional refreshExp/refreshToken
          });

          // Reintentar la request original con el nuevo access token
          const newToken = store.session()?.accessToken;
          const retry = newToken
            ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
            : req;
          return next(retry);
        }),
        catchError((refreshErr) => {
          // falló el refresh → logout global
          facade.logout('Sesión expirada. Vuelve a iniciar sesión.');
          return throwError(() => refreshErr);
        }),
        finalize(() => {
          refreshing = false;
          refreshDone$.next(true);
        })
      );
    })
  );
};
