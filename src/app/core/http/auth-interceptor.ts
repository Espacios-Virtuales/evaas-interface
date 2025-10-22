// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).session()?.accessToken;
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
