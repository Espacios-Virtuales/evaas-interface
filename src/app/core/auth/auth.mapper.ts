import { JwtPayload, Role, UserSession } from '../models/auth.model';
import { AuthResponse } from '../models/http.model';
import { decodeJwtPayload } from '../../utils/jwt';

export function mapAuthResponseToSession(res: AuthResponse): UserSession {
  const token = normalizeToken(res.token);
  if (!token) {
    throw new Error('Backend login response did not include a valid token.');
  }

  // --- Normaliza role ---
  const rolesRaw: Role[] = Array.isArray(res.role)
    ? res.role
    : res.role
      ? [res.role]
      : [];

  // --- Deriva roles y privilegios ---
  const roles: string[] = rolesRaw.map((r: Role) => r.roleEnum);
  const privileges: string[] = rolesRaw
    .flatMap((r: Role) => r.privileges || [])
    .map(p => p.type);

  // --- Decodifica payload JWT ---
  const payload = decodeJwtPayload<JwtPayload>(token);
  const tokenExp = payload?.exp
    ? new Date(payload.exp * 1000)
    : res.expiresIn
      ? new Date(Date.now() + res.expiresIn * 1000)
      : null;

  if (!tokenExp || tokenExp.getTime() <= Date.now()) {
    throw new Error('Backend login response included an expired token.');
  }

  // --- Calcula refreshExp solo cuando el backend informa refreshExpiresIn ---
  const issuedAtMs = res.issuedAt ? Date.parse(res.issuedAt) : NaN;
  const refreshExp = res.refreshExpiresIn
    ? isNaN(issuedAtMs)
      ? new Date(Date.now() + res.refreshExpiresIn * 1000)
      : new Date(issuedAtMs + res.refreshExpiresIn * 1000)
    : undefined;

  const loginAt = isNaN(issuedAtMs) ? new Date() : new Date(issuedAtMs);

  return {
    email: res.username ?? payload?.sub ?? '',
    roles,
    privileges,
    token,
    tokenExp,
    refreshToken: res.refreshToken,
    refreshExp,
    loginAt,
  };
}

export function mapAuthResponseToSessionPatch(res: AuthResponse): Partial<UserSession> {
  const token = normalizeToken(res.token);
  if (!token) {
    throw new Error('Backend refresh response did not include a valid token.');
  }

  const payload = decodeJwtPayload<JwtPayload>(token);
  const tokenExp = payload?.exp
    ? new Date(payload.exp * 1000)
    : res.expiresIn
      ? new Date(Date.now() + res.expiresIn * 1000)
      : null;

  if (!tokenExp || tokenExp.getTime() <= Date.now()) {
    throw new Error('Backend refresh response included an expired token.');
  }

  const issuedAtMs = res.issuedAt ? Date.parse(res.issuedAt) : NaN;
  const refreshExp = res.refreshExpiresIn
    ? isNaN(issuedAtMs)
      ? new Date(Date.now() + res.refreshExpiresIn * 1000)
      : new Date(issuedAtMs + res.refreshExpiresIn * 1000)
    : undefined;

  return {
    token,
    tokenExp,
    refreshToken: res.refreshToken,
    refreshExp,
  };
}

function normalizeToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const token = value.trim();
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}
