// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiHttpService } from './api-http';
import { AuthRequest, AuthResponse, RegisterRequest, User } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiHttpService);
  private router = inject(Router);

  userSig = signal<User|null>(null);
  tokenSig = signal<string|null>(null);

  register(data: RegisterRequest) { return this.api.post('/auth/register', data); }
  login(data: AuthRequest)        { return this.api.post<AuthResponse>('/auth/login', data); }

  setSession({ accessToken, user }: AuthResponse) {
    this.tokenSig.set(accessToken);
    this.userSig.set(user);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
  }
  logout() {
    localStorage.clear();
    this.userSig.set(null);
    this.tokenSig.set(null);
    this.router.navigateByUrl('/');
  }
}
