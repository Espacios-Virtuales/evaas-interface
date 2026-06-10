// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { isPublicApiUrl } from './api.endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublicApiUrl(req.url)) {
    return next(req);
  }

  const token = inject(AuthStore).getValidToken();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
