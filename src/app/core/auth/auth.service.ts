// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, map, tap, catchError } from 'rxjs';
import { API, LEGACY_API, apiUrl } from '../http/api.endpoints';
import { UserSession } from '../models/auth.model';
import { RegisterRequest, RegistrationResponse, AuthRequest, AuthResponse} from '../models/http.model';
import { AuthStore } from './auth.store';
import { mapAuthResponseToSession, mapAuthResponseToSessionPatch } from './auth.mapper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(AuthStore);

  register(payload: RegisterRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(apiUrl(LEGACY_API.auth.register), payload)
      .pipe(catchError(err => throwError(() => err)));
  }

  login(payload: AuthRequest): Observable<UserSession> {
    return this.http.post<AuthResponse>(apiUrl(API.auth.login), payload).pipe(
      map(res => mapAuthResponseToSession(res)),
      tap(session => {
        this.store.setSession(session);
      }),
      catchError(err => throwError(() => err))
    );
  }
  
  refresh(refreshToken: string) {
    return this.http.post<AuthResponse>(apiUrl(API.auth.refresh), { refreshToken }).pipe(
      map(res => mapAuthResponseToSessionPatch(res)),
    );
  }

  logout(refreshToken: string | null) {
    return this.http.post<void>(apiUrl(API.auth.logout), { }); // No enviamos el refreshToken por seguridad
  }

  isAuthenticated(): boolean {
    return this.store.isLoggedIn();
  }

  getAccessToken(): string | null {
    return this.store.getValidToken();
  }

  getSession(): UserSession | null {
    return this.store.session() ?? null;
  }
}
