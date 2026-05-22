# EVAAS Interface · Auth flow v0

Fecha: 2026-05-22

## Flujo esperado

```txt
POST /auth/login
↓
AuthResponse
↓
AuthMapper
↓
UserSession
↓
AuthStore
↓
AuthInterceptor agrega Bearer token
↓
GET /me/tool-access
```

## Logout

```txt
POST /auth/logout
↓
AuthStore.clear()
↓
redirect /login
```

El logout remoto usa el contrato `/auth/logout`. La sesión local se limpia siempre aunque el request falle.

## Refresh

```txt
401 / 419
↓
POST /auth/refresh
↓
actualización de sesión
↓
retry de request original
```

## Hallazgo

AuthService quedó alineado con `/auth/login`, `/auth/refresh` y `/auth/logout`.

## Impacto

La app deja de depender de los endpoints legacy `/login` y `/logout`.

## Riesgo

Bajo

## Recomendación

Validar con backend real el shape de `AuthResponse` y de refresh. La URL ya está alineada, pero el DTO de refresh todavía necesita confirmación.

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/core/http/refresh-token-interceptor.ts`

## Hallazgo

No hay logs sensibles en `AuthService.login`.

## Impacto

Reduce exposición accidental de credenciales, tokens o sesión en consola.

## Riesgo

Bajo

## Recomendación

Mantener logs de auth fuera de producción. Si se requiere observabilidad, usar eventos sanitizados.

## Archivos involucrados

- `src/app/core/auth/auth.service.ts`

## Hallazgo

Refresh todavía usa `Partial<UserSession>` como respuesta esperada.

## Impacto

El contrato HTTP queda acoplado al estado interno Angular. Si backend responde `token`, `issuedAt` o fechas string, puede romper expiración.

## Riesgo

Medio

## Recomendación

En una fase pequeña posterior, crear `RefreshResponse` y mapper dedicado. No se hizo aquí porque el contrato disponible solo define endpoint, no payload.

## Archivos involucrados

- `src/app/core/auth/auth.service.ts`
- `src/app/core/http/refresh-token-interceptor.ts`
- `src/app/core/models/http.model.ts`

## Hallazgo

La sesión se conserva en `localStorage`.

## Impacto

Permite persistencia entre pestañas/cierres, pero mantiene el riesgo XSS propio de localStorage.

## Riesgo

Medio

## Recomendación

Confirmar política de sesión EVAAS Core. Si backend migra a cookie httpOnly, Angular debe observar ese contrato y reducir manejo directo de tokens.

## Archivos involucrados

- `src/app/core/auth/auth.store.ts`
- `src/app/core/http/auth-interceptor.ts`

## Validaciones

```bash
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
```

Ambas validaciones pasan.

`npm run build` no se completa en este entorno porque Node local es `v18.18.2` y Angular CLI 20 requiere Node `20.19+` o `22.12+`.
