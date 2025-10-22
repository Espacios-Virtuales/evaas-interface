// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { API } from '../http/api.endpoints';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) return throwError(() => err);

      // 1) Dejar que LO maneje el componente de login
      if (req.url.startsWith(API.auth.login)) return throwError(() => err);

      // 2) No mostrar error para 401/419 aquí — el refresh interceptor lo resuelve o hace logout
      if (err.status === 401 || err.status === 419) return throwError(() => err);

      // 3) Mostrar errores generales
      let message = 'Ocurrió un error inesperado';
      if (err.status === 0) message = 'No hay conexión con el servidor.';
      else message = extractMessage(err) || message;

      if (err.status === 403) message = message || 'No tienes permisos para esta acción.';

      snack.open(message, 'Cerrar', {
        duration: 5000,
        panelClass: ['snack-error'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      return throwError(() => err);
    })
  );
};

function extractMessage(err: HttpErrorResponse): string {
  const body = err.error;
  if (!body) return `Error ${err.status} ${err.statusText || ''}`.trim();
  if (typeof body === 'string') return body;
  if (body.message) return String(body.message);
  if (body.error) return String(body.error);
  if (body.detail) return String(body.detail);
  return `Error ${err.status}`;
}
