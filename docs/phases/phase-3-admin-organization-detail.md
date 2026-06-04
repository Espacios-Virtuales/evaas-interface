# EVAAS Interface · Phase 3 admin organization detail

Fecha: 2026-06-04

## Objetivo

Agregar y refinar la vista minima de detalle de organizacion dentro del Dashboard Admin v0.

La pantalla permite navegar desde el listado de organizaciones hacia `/dashboard/admin/organizations/:id` y consultar el universo real disponible para esa organizacion como observacion operacional de solo lectura.

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
- Se muestran datos base disponibles: `id`, `name`, `ownerEmail`, `ownerUserId`, `status`, `createdAt` y `updatedAt`.
- Se muestran accesos disponibles: `id`, `toolKey`, `toolName`, `organizationId`, `organizationName`, `userEmail`, `status`, `grantedAt` y `revokedAt`.
- Se muestran recursos disponibles segun contrato recibido: `id`, `name`, `resourceKey`, `type`, `status`, `visibility`, `url`, `operationalUrl`, `createdAt`, `updatedAt`, `metadata`, `config` o `configuration`.
- Se agregaron estados locales de loading, error, empty parcial y success.
- Se agrego el enlace `Volver a Organizaciones`.
- Se agregaron badges visuales locales para estados disponibles, sin extraer componente compartido.
- Se agrego una lectura de estado operacional derivada solo de existencia real de accesos y recursos.
- Se agrego un placeholder no funcional de `Flujo operativo`.

## Secciones visuales

- `Organization summary` / `Resumen de organizacion`.
- `Tool access` / `Accesos habilitados`.
- `Resources` / `Recursos asociados`.
- `Operational status` / `Estado operacional`.
- `Future program flow placeholder` / `Flujo operativo`.

## Estados UI

- Loading: mientras se cargan organizacion, accesos y recursos.
- Error: cuando falla la carga del detalle.
- Empty parcial: cuando la organizacion existe sin accesos o sin recursos.
- Success: cuando la organizacion y sus colecciones se renderizan con datos reales disponibles.

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
- No se implementa Program.
- No se implementa Phase.
- No se crean estados frontend-only para flujo operativo.
- No se modifica el interceptor de autenticacion.

## Archivos modificados

- `src/app/features/dashboard/dashboard.routes.ts`
- `src/app/core/models/evaas-contracts.model.ts`
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
