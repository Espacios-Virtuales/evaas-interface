// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      let message = 'Ocurrió un error inesperado';

      if (err instanceof HttpErrorResponse) {
        if (err.status === 0) {
          // Error de red / CORS / backend caído
          message = 'No hay conexión con el servidor.';
        } else {
          message = extractMessage(err);

          if (err.status === 401) {
            // Opcional: limpiar sesión y redirigir a login
            // localStorage.removeItem('token');
            // router.navigateByUrl('/login');
          }

          if (err.status === 403) {
            message = message || 'No tienes permisos para esta acción.';
          }
        }
      }

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

  // Intenta formas comunes
  if (body.message) return String(body.message);
  if (body.error) return String(body.error);
  if (body.detail) return String(body.detail);

  // Si vino como Blob con JSON
  if (body instanceof Blob && body.type?.includes('application/json')) {
    // Best-effort: devolvemos status
    return `Error ${err.status}`;
  }

  return `Error ${err.status}`;
}
