// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { API, apiUrl } from './api.endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(apiUrl(API.auth.login)) || req.url.startsWith(apiUrl(API.auth.refresh))) {
    return next(req);
  }

  const token = inject(AuthStore).session()?.accessToken;
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
