# EVW-UI-H01 · Bloqueos de contrato Interface

Fecha: 2026-08-29

Estos puntos no son pendientes de implementación de Interface. Son bloqueos respaldados por la evidencia contractual disponible en CORE.

## OrganizationMember

- Dominio: disponible.
- HTTP Admin: pendiente de auditoría.
- Interface: no implementa proyección.
- Estado: `BLOCKED_BY_HTTP_CONTRACT`.

`ownerUserId` y `ownerEmail` no se usan para inferir una colección de miembros: owner no equivale a `OrganizationMember`.

## Service

- Dominio: disponible.
- HTTP Admin: pendiente de auditoría.
- Interface: no implementa `/admin/services`.
- Estado: `BLOCKED_BY_HTTP_CONTRACT`.

## Artifact

- Dominio: disponible.
- HTTP Admin: pendiente de auditoría.
- Interface: no implementa `/admin/artifacts`.
- Estado: `BLOCKED_BY_HTTP_CONTRACT`.

## InstrumentAccess

El endpoint confirmado es `GET /admin/organizations/{organizationRef}/instrument-access`, pero requiere `organizationRef` UUID. El `OrganizationDto` actualmente consumido por Interface solo expone `id` Long.

- Estado: `BLOCKED_BY_CANONICAL_REFERENCE`.
- No se convierte `Long` a UUID.
- No se usa el ID legacy en la ruta canónica.

`ToolAccess` legacy != `InstrumentAccess` canónico. La compatibilidad de ToolAccess continúa en el detalle de Organization sin presentarlo como autoridad canónica.
