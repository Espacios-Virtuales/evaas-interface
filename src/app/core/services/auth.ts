// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError,  tap, catchError } from 'rxjs';
import { RegisterRequest, UserResponse,  AuthResponse, AuthRequest } from '../models/index';

import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; // ej: http://localhost:8090

  userSig = signal<any | null>(null);

  register(payload: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/users/register`, payload).pipe(
      catchError((err) => {
        // Podrías mapear errores específicos aquí
        return throwError(() => err);
      })
    );
  }

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res: AuthResponse) => {
        localStorage.setItem('token', res.token);
        this.userSig.set(res.username);
      }),
      catchError((err) => throwError(() => err))
    );
  }
  

  logout() {
    localStorage.removeItem('token');
    this.userSig.set(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
