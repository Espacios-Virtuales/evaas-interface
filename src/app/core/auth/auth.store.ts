// core/auth/auth.store.ts
import { Injectable, signal, computed, effect } from '@angular/core';
import { UserSession } from '../models';

const KEY = 'session';

function readSession(): UserSession | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as UserSession;
    s.accessTokenExp = new Date(s.accessTokenExp);
    s.refreshExp = new Date(s.refreshExp);
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
    return !!s?.accessToken && s.accessTokenExp.getTime() > Date.now();
  });

  // 👇 Exponer datos derivados para UI/RBAC
  roles = computed<string[]>(() => this._session()?.roles ?? []);
  privileges = computed<string[]>(() => this._session()?.privileges ?? []);
  email = computed<string | null>(() => this._session()?.email ?? null);

  // utilidades de expiración
  secondsToAccessExp = computed<number>(() => {
    const s = this._session(); if (!s) return 0;
    return Math.max(0, Math.floor((s.accessTokenExp.getTime() - Date.now()) / 1000));
  });

  secondsToRefreshExp = computed<number>(() => {
    const s = this._session(); if (!s) return 0;
    return Math.max(0, Math.floor((s.refreshExp.getTime() - Date.now()) / 1000));
  });

  constructor() {
    effect(() => {
      const s = this._session();
      if (s) localStorage.setItem(KEY, JSON.stringify(s));
      else localStorage.removeItem(KEY);
    });
  }

  setSession(s: UserSession) { this._session.set(s); }
  clear() { this._session.set(null); }
}
