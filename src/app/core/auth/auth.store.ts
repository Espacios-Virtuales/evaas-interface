// core/auth/auth.store.ts
import { Injectable, signal, computed, effect } from '@angular/core';
import { UserSession } from '../models/auth.model';

const KEY = 'session';
const LEGACY_TOKEN_KEYS = ['accessToken', 'access_token', 'jwt', 'authToken'] as const;

export function clearLegacyAuthStorage(): void {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of LEGACY_TOKEN_KEYS) {
      storage.removeItem(key);
    }
  }
}

export function isUsableToken(token: unknown, exp?: Date): token is string {
  if (typeof token !== 'string') return false;

  const value = token.trim();
  if (!value || value === 'null' || value === 'undefined') return false;
  if (exp && exp.getTime() <= Date.now()) return false;

  return true;
}

function readSession(): UserSession | null {
  clearLegacyAuthStorage();

  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as UserSession & {
      accessToken?: string;
      accessTokenExp?: string | Date;
    };

    if (s.accessToken || s.accessTokenExp) {
      localStorage.removeItem(KEY);
      return null;
    }

    s.tokenExp = new Date(s.tokenExp);
    if (s.refreshExp) s.refreshExp = new Date(s.refreshExp);
    if (s.loginAt) s.loginAt = new Date(s.loginAt as unknown as string);

    if (!isUsableToken(s.token, s.tokenExp)) {
      localStorage.removeItem(KEY);
      return null;
    }

    return s;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _session = signal<UserSession | null>(readSession());

  // estado básico
  session = computed(() => this._session());
  isLoggedIn = computed(() => {
    const s = this._session();
    return isUsableToken(s?.token, s?.tokenExp);
  });

  // 👇 Exponer datos derivados para UI/RBAC
  roles = computed<string[]>(() => this._session()?.roles ?? []);
  privileges = computed<string[]>(() => this._session()?.privileges ?? []);
  email = computed<string | null>(() => this._session()?.email ?? null);

  // NEW: acceso directo a loginAt para mostrar “Conectado desde”
  loginAt = computed<Date | null>(() => this._session()?.loginAt ?? null);
  
  // utilidades de expiración
  secondsToAccessExp = computed<number>(() => {
    const s = this._session(); if (!s) return 0;
    return Math.max(0, Math.floor((s.tokenExp.getTime() - Date.now()) / 1000));
  });

  secondsToRefreshExp = computed<number>(() => {
    const s = this._session(); if (!s) return 0;
    if (!s.refreshExp) return 0;
    return Math.max(0, Math.floor((s.refreshExp.getTime() - Date.now()) / 1000));
  });

  constructor() {
    effect(() => {
      clearLegacyAuthStorage();
      const s = this._session();
      if (s) localStorage.setItem(KEY, JSON.stringify(s));
      else localStorage.removeItem(KEY);
    });
  }

  getValidToken(): string | null {
    const s = this._session();
    return isUsableToken(s?.token, s?.tokenExp) ? s.token : null;
  }

  setSession(s: UserSession) {
    clearLegacyAuthStorage();
    this._session.set(s);
  }

  clear() {
    clearLegacyAuthStorage();
    this._session.set(null);
  }
}
