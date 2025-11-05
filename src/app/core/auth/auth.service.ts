// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, map, tap, catchError } from 'rxjs';
import { API } from '../http/api.endpoints';
import { UserSession } from '../models/auth.model';
import { RegisterRequest, RegistrationResponse, AuthRequest, AuthResponse} from '../models/http.model';
import { AuthStore } from './auth.store';
import { mapAuthResponseToSession } from './auth.mapper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(AuthStore);

  register(payload: RegisterRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(API.auth.register, payload)
      .pipe(catchError(err => throwError(() => err)));
  }

  login(payload: AuthRequest): Observable<UserSession> {
    console.log('[AuthService] login() payload', payload);
    return this.http.post<AuthResponse>(API.auth.login, payload).pipe(
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
  
  refresh(refreshToken: string) {
    return this.http.post<Partial<UserSession>>(API.auth.refresh, { refreshToken });
  }

  logout(refreshToken: string | null) {
    return this.http.post<void>(API.auth.logout, { }); // No enviamos el refreshToken por seguridad
  }

  isAuthenticated(): boolean {
    return this.store.isLoggedIn();
  }

  getAccessToken(): string | null {
    return this.store.session()?.accessToken ?? null;
  }

  getSession(): UserSession | null {
    return this.store.session() ?? null;
  }
}
