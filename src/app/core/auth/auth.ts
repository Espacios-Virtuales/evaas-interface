// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, map, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthRequest, AuthResponse, RegisterRequest, RegistrationResponse, UserSession } from '../models/index';
import { AuthStore } from '../auth/auth.store';
import { mapAuthResponseToSession } from '../auth/auth.mapper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(AuthStore);
  private baseUrl = environment.apiUrl;

  register(payload: RegisterRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.baseUrl}/users/register`, payload)
      .pipe(catchError(err => throwError(() => err)));
  }

  login(payload: AuthRequest): Observable<UserSession> {
    console.log('[AuthService] login() payload', payload);
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => console.log('[AuthService] AuthResponse', res)),
      map(res => mapAuthResponseToSession(res)),
      tap(session => {
        console.log('[AuthService] setSession()', session);
        this.store.setSession(session);
      }),
      catchError(err => {
        console.error('[AuthService] login ERROR', err);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.store.clear();
  }

  isAuthenticated(): boolean {
    return this.store.isLoggedIn();
  }

  getAccessToken(): string | null {
    return this.store.session()?.accessToken ?? null;
  }
}
