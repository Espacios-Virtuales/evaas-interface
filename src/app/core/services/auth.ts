// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RegisterRequest, UserResponse } from '../models/index';

import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; // ej: http://localhost:8090

  register(payload: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/users/register`, payload).pipe(
      catchError((err) => {
        // Podrías mapear errores específicos aquí
        return throwError(() => err);
      })
    );
  }
}
