# Pantallas validadas

- Rutas estáticas: `/dashboard/admin`, `/dashboard/admin/organizations`, `/dashboard/admin/organizations/:id`, `/dashboard/admin/resources` y `/dashboard/admin/instruments`.
- Organization Detail mantiene separados el resumen de Espacios Virtuales (nombre, `enabled`, Tax ID, owner, branding y creación) y Members. `logoUrl` y `brandColor` se muestran sólo cuando llegan; ambos nulos se representan como `Branding no configurado`.
- Resources proyecta `key`, `name`, `type`, `provider`, `status`, `visibility` y `url` recibidos. No presenta metadata ausente del GET.
- Instruments es un catálogo con `canonicalId`, `key` y `status`; declara que no representa InstrumentAccess ni disponibilidad por Organization.
- ToolAccess sigue identificado explícitamente como compatibilidad legacy.
- Communication evidence es de sólo lectura y muestra operación, canal, estado, correlación, evidencia y error.

# Contratos observados

- `GET /admin/access/organizations/{id}/members` entrega `canonicalId`, `userId`, `userEmail`, `role` y `status`; el owner permanece fuera de la colección.
- `GET /admin/instruments` alimenta el catálogo canónico de instrumentos.
- `GET /admin/resources`, `GET /admin/resources/{id}` y `GET /admin/access/organizations/{id}/resources` alimentan Resources.
- `GET /admin/communication-actions` alimenta evidencia y Organization Detail la filtra por igualdad exacta entre `organizationId` e `id` de Organization.

# Estados EMPTY/ERROR

- Members y Communication evidence tienen estados independientes `LOADING`, `EMPTY`, `READY` y `ERROR`; una respuesta `200 + []` es `EMPTY`.
- Los errores de Members, Resources o Communication evidence no impiden mostrar la Organization ni las demás colecciones.

# Bloqueos restantes

- InstrumentAccess: `BLOCKED_BY_API`; falta un `organizationRef` UUID utilizable desde el contexto HTTP actual.
- Service, Artifact y Deployment: `BLOCKED_BY_API`; no disponen de DTO y proyección HTTP administrativa consumibles.

# Tests

- `./node_modules/.bin/tsc -p tsconfig.app.json --noEmit`: PASS.
- `./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit`: PASS.
- `npm test -- --watch=false`: 63 specs ejecutados; 61 SUCCESS y 2 FAILED, ambos `PREEXISTING`: `ObjectCardComponent should create` (acceso a `icon` de valor indefinido) y `ObjectsGridComponent should create` (sin provider de `HttpClient`).

# Build

- `npm run build`: PASS.
- Warnings de presupuesto: bundle inicial 916.58 kB frente a 500 kB; SCSS de `admin-organizations-list` (4.23 kB frente a 4 kB) y `admin-organization-detail` (7.69 kB frente a 4 kB).

# Smoke ejecutado/no ejecutado

- `AUTHENTICATED_SMOKE = NOT_EXECUTED` (no se proporcionó una sesión administrativa).
- `DEPLOYMENT = MANUAL`.
- `PRODUCTION_SMOKE = MANUAL`.
