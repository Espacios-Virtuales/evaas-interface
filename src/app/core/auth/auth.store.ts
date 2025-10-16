// core/auth/auth.store.ts
import { Injectable, signal, computed, effect } from '@angular/core';
import { UserSession } from '../models/index';

const KEY = 'session';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _session = signal<UserSession | null>(readSession());

  session = computed(() => this._session());
  isLoggedIn = computed(() => {
    const s = this._session();
    if (!s) return false;
    return !!s.accessToken && s.accessTokenExp.getTime() > Date.now();
  });

  roles = computed(() => this._session()?.roles ?? []);
  privileges = computed(() => this._session()?.privileges ?? []);
  email = computed(() => this._session()?.email ?? null);

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

function readSession(): UserSession | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserSession;
    // revive fechas
    parsed.accessTokenExp = new Date(parsed.accessTokenExp);
    parsed.refreshExp = new Date(parsed.refreshExp);
    return parsed;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}
