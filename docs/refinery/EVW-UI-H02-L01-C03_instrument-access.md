# EVW-UI-H02-L01-C03 · Refinería Instrument / Access

Fecha: 2026-08-29

## A. Instrument

`Instrument` es una capacidad especializada, reusable y gobernada por EVAAS. Interface consume el catálogo canónico mediante:

```http
GET /admin/instruments
```

`AdminInstrumentService` es la única fuente de la pantalla `/dashboard/admin/instruments`; no existe catálogo estático paralelo. La UI muestra únicamente campos recibidos (`key` y, cuando exista, `description`).

## B. InstrumentAccess

`InstrumentAccess` es la habilitación canónica entre una Organization y un Instrument:

```txt
Organization → InstrumentAccess → Instrument
```

CORE expone `GET /admin/organizations/{organizationRef}/instrument-access`, con `organizationRef` UUID. Interface no lo consume: `OrganizationDto` solo expone `id: number`/Long y no hay `organizationRef` UUID en el contexto UI.

Estado: `CANONICAL_CONTRACT_AVAILABLE`, `UI_BLOCKED_BY_CANONICAL_REFERENCE`.

No se convierte Long a UUID ni se usa el ID legacy en la ruta canónica.

## C. ToolAccess legacy

`ToolAccess` es un contrato legacy activo, mantenido mediante:

```http
GET /admin/access/organizations/{id}/tool-access
```

Usa `Organization.id` Long y permanece implementado por `AdminToolAccessDto`, `getOrganizationToolAccess()`, `createToolAccess()` y `disableToolAccess()`. No se renombra ni se presenta contractualmente como `InstrumentAccess`.

Estado: `LEGACY_COMPATIBILITY`.

## D. Máscaras UI

| Clave canónica | Nombre funcional UI | Evidencia |
| --- | --- | --- |
| `LIORA` | Comunicador | catálogo `GET /admin/instruments` |

`Comunicador` no es otra entidad: es una máscara de presentación de `Instrument.key = LIORA`. La pantalla de detalle confirma que LIORA esté presente en el catálogo antes de mostrarlo disponible y conserva `Clave técnica: LIORA`.

## E. Fronteras

```txt
Instrument != Resource
Instrument != Service
Instrument != Artifact
Instrument != Integration
InstrumentAccess != ToolAccess
```

Un Instrument puede requerir Resources, Integrations o Deployments para operar, sin convertirse en ellos. Una Integration es un vínculo técnico u operacional con un sistema externo; por ejemplo, un Instrument futuro como Nexo no convierte Mercado Libre en Instrument, y usar Gmail no convierte Gmail en Instrument.

La columna `Instrumento asociado` de Resources solo usa `instrumentKey`, `instrument` o metadata contractual explícita. No clasifica por nombre, URL, tipo ni heurísticas. Sin evidencia muestra `Sin clasificar`.

## F. Navegación y deudas CORE reales

- `/dashboard/admin/instruments` conserva la navegación principal y el catálogo canónico.
- `/dashboard/admin/instruments/comunicador` conserva la máscara LIORA → Comunicador.
- `/dashboard/admin/access` permanece como redirect legacy a Instrumentos; una ruta legacy no es autoridad canónica.
- CORE debe exponer `organizationRef` UUID consumible en el contexto de Organization antes de activar la proyección de InstrumentAccess.
- No existe contrato Integration consumido por Interface; no se implementa Integration en esta cápsula.

## Matriz

| Concepto | Estado actual | Semántica objetivo | Contrato | Decisión |
| --- | --- | --- | --- | --- |
| Instrument | Implementado | Capacidad especializada | `GET /admin/instruments` | Conservar/refinar |
| LIORA | Implementado | Instrument | Catálogo | Mostrar Comunicador + clave técnica |
| InstrumentAccess | No proyectado | Habilitación canónica | endpoint UUID | Bloquear hasta `organizationRef` |
| ToolAccess | Legacy activo | Compatibilidad | endpoint Long | Conservar temporalmente |
| Resource-Instrument | Parcial | Relación no inherente | metadata explícita | Mantener conservador |
