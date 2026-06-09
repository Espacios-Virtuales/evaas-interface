// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { API, apiUrl } from './api.endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.url.startsWith(apiUrl(API.auth.login)) ||
    req.url.startsWith(apiUrl(API.auth.refresh)) ||
    req.url.startsWith(apiUrl(API.auth.logout)) ||
    req.url.startsWith(apiUrl(API.onboarding.register)) ||
    req.url.startsWith(apiUrl(API.onboarding.activate)) ||
    req.url.startsWith(apiUrl(API.onboarding.resendActivation))
  ) {
    return next(req);
  }

  const token = inject(AuthStore).getValidToken();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
