import { AuthResponse, JwtPayload, Role, UserSession } from '../models/index';
import { decodeJwtPayload } from '../../utils/jwt';

export function mapAuthResponseToSession(res: AuthResponse): UserSession {
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
  const payload = decodeJwtPayload<JwtPayload>(res.token);
  const accessTokenExp = payload?.exp
    ? new Date(payload.exp * 1000)
    : new Date(Date.now() + 10 * 60 * 1000); // fallback 10min

  // --- Calcula refreshExp ---
  const issuedAtMs = Date.parse(res.issuedAt);
  const refreshExp = isNaN(issuedAtMs)
    ? new Date(Date.now() + res.refreshExpiresIn * 1000)
    : new Date(issuedAtMs + res.refreshExpiresIn * 1000);

  return {
    email: res.username,
    roles,
    privileges,
    accessToken: res.token,
    accessTokenExp,
    refreshToken: res.refreshToken,
    refreshExp,
  };
}