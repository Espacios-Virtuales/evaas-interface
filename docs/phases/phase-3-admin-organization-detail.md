# EVAAS Interface · Phase 3 admin organization detail

Fecha: 2026-06-04

## Objetivo

Agregar la vista minima de detalle de organizacion dentro del Dashboard Admin v0.

La pantalla permite navegar desde el listado de organizaciones hacia `/dashboard/admin/organizations/:id` y consultar el universo real disponible para esa organizacion.

## Endpoints usados

```http
GET /admin/access/organizations/{id}
GET /admin/access/organizations/{id}/tool-access
GET /admin/access/organizations/{id}/resources
```

En produccion se resuelven contra:

```txt
https://api.evaas.lat
```

La autenticacion se mantiene mediante el interceptor HTTP existente, que envia:

```http
Authorization: Bearer {token}
```

## Alcance

- Se agrego la ruta `/dashboard/admin/organizations/:id`.
- Se reutilizo el Dashboard Shell existente, sin crear un nuevo layout.
- Se reutilizo `AdminAccessService` para obtener organizacion, accesos y recursos reales.
- Se muestran datos base disponibles: `id`, `name`, `ownerEmail`, `status`, `createdAt` y `updatedAt`.
- Se muestran accesos disponibles: `id`, `toolKey`, `status`, `grantedAt` y `revokedAt`.
- Se muestran recursos disponibles segun contrato recibido: `id`, `resourceKey`, `name`, `type`, `status`, `metadata`, `config`, `configuration`, `operationalUrl`, `link` o `url`.
- Se agregaron estados locales de loading, error, empty parcial y success.
- Se agrego el enlace `Volver a Organizaciones`.

## Fuera de alcance

- No se crea organizacion.
- No se edita organizacion.
- No se elimina organizacion.
- No se asignan accesos.
- No se crean recursos.
- No se conectan activaciones.
- No se agrega billing.
- No se automatiza provision.
- No se agregan datos falsos.
- No se agregan graficos.

## Archivos modificados

- `src/app/features/dashboard/dashboard.routes.ts`
- `src/app/features/dashboard/admin/organization-detail/admin-organization-detail.component.ts`
- `src/app/features/dashboard/admin/organization-detail/admin-organization-detail.component.html`
- `src/app/features/dashboard/admin/organization-detail/admin-organization-detail.component.scss`
- `docs/phases/README.md`
- `docs/phases/phase-3-admin-organization-detail.md`

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
