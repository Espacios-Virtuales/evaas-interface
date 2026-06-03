# EVAAS Interface · Admin auth token fix

Fecha: 2026-06-03

## Problema

El backend productivo entrega el JWT principal de login en el campo `token`.

La interfaz mantenia la sesion interna como `accessToken`, lo que podia dejar tokens legacy persistidos o enviar headers `Authorization` inconsistentes hacia rutas protegidas.

## Contrato real

Login:

```ts
{
  token: string;
  refreshToken?: string;
  role?: unknown[];
  expiresIn?: number;
}
```

El token principal de sesion se guarda como `token`.

## Archivos tocados

- `src/app/core/auth/auth.mapper.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.store.ts`
- `src/app/core/auth/session-watcher.service.ts`
- `src/app/core/http/auth-interceptor.ts`
- `src/app/core/http/refresh-token-interceptor.ts`
- `src/app/core/models/auth.model.ts`
- `src/app/core/models/http.model.ts`
- `docs/phases/README.md`
- `docs/phases/phase-admin-auth-token-fix.md`

No existe `src/app/core/services/storage.service.ts` en el arbol actual; la limpieza queda centralizada en `AuthStore`.

## Claves legacy limpiadas

Se limpian de `localStorage` y `sessionStorage`:

- `accessToken`
- `access_token`
- `jwt`
- `authToken`

Tambien se rechaza una sesion persistida con shape legacy `accessToken` o `accessTokenExp`.

## Cambios de comportamiento

- `POST /auth/login` no recibe `Authorization`.
- `POST /auth/refresh` no recibe `Authorization`.
- `POST /auth/logout` no recibe `Authorization`; el proyecto ya no enviaba `refreshToken` en el body por seguridad.
- Las rutas protegidas reciben `Authorization: Bearer {token}` solo si existe un token real, no vacio, distinto de `null` y `undefined`, y no expirado.
- El login falla de forma controlada si el backend no entrega `token` o si entrega un token ya expirado.

## Refresh token

El refresh queda conectado al mismo contrato `token` cuando el backend lo entregue.

Pendiente de confirmar con backend: si `/auth/refresh` retorna exactamente el mismo shape de login o un contrato reducido.

## Fuera de alcance

- No se modifico backend.
- No se construyeron nuevas vistas.
- No se tocaron Organizaciones, Recursos, Accesos ni Activaciones.
- No se cambio RBAC salvo el uso indirecto de la sesion actualizada.

## Validaciones

Ejecutar con Node compatible:

```bash
nvm use 20.19.5
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
npm run build
```

Resultado esperado:

- TypeScript app pasa.
- TypeScript spec pasa.
- Build de produccion pasa.
