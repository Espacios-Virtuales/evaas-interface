# EVW-UI-H01 · E4 · Proyección canónica en Interface

## 1. Hito

`EVW-UI-H01 · E4 · Proyección canónica en Interface`

## 2. Estado final

`CERRADO`, con dependencias contractuales registradas.

## 3. Matriz final

| Capacidad | Estado Interface | Evidencia |
| --- | --- | --- |
| Organization list | IMPLEMENTED | endpoint real |
| Organization detail | IMPLEMENTED | endpoint real |
| Organization filter | IMPLEMENTED | `enabled` |
| Organization status | IMPLEMENTED | PATCH status |
| OrganizationMember | BLOCKED_BY_HTTP_CONTRACT | dominio sin HTTP confirmado |
| Resource | IMPLEMENTED | endpoint real |
| Service | BLOCKED_BY_HTTP_CONTRACT | dominio sin HTTP confirmado |
| Artifact | BLOCKED_BY_HTTP_CONTRACT | dominio sin HTTP confirmado |
| Instrument | IMPLEMENTED | `/admin/instruments` |
| LIORA → Comunicador | IMPLEMENTED | máscara UI |
| InstrumentAccess | BLOCKED_BY_CANONICAL_REFERENCE | falta `organizationRef` UUID consumible |
| ToolAccess legacy | COMPATIBILITY | contrato legacy |
| Legacy `/access` route | COMPATIBILITY | redirect |
| EMPTY/POPULATED | IMPLEMENTED | semántica HTTP |

## 4. Declaración semántica

```txt
Instrument != Resource
Resource != Service
Resource != Artifact
ToolAccess != InstrumentAccess
owner != OrganizationMember
Long id != organizationRef UUID
```

## 5. Deudas externas al hito

- CORE debe exponer OrganizationMember por HTTP si se desea proyectarlo.
- CORE debe confirmar endpoints administrativos de Service y Artifact.
- Interface necesita `organizationRef` UUID consumible para activar InstrumentAccess.

Estas son dependencias futuras, no defectos abiertos de este hito.

## 6. Compatibilidad conservada

ToolAccess legacy continúa operativo. La ruta `/dashboard/admin/access` permanece temporalmente compatible. No se realizaron migraciones destructivas.

## 7. Validación

```bash
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
npm run build
```

Los comandos pasan en esta cápsula. La suite completa de Karma conserva dos fallos conocidos, ajenos al hito:

- `ObjectsGridComponent` — `PREEXISTING`, `NOT_INTRODUCED_BY_EVW_UI_H01`.
- `ObjectCardComponent` — `PREEXISTING`, `NOT_INTRODUCED_BY_EVW_UI_H01`.

## 8. Commits relevantes

- `6d2ae0f fix: load admin instruments from canonical endpoint`
- `07ccd7b feat: complete canonical organization admin controls`
- `docs: record canonical interface contract blockers`
- `fix: align admin collection states with canonical contracts`
- `docs: close evw ui h01 canonical interface projection`

## 9. Declaración final

EVW-UI-H01 queda cerrado.

Interface proyecta únicamente contratos canónicos disponibles, preserva compatibilidad legacy donde todavía es necesaria y registra como dependencias externas las capacidades que CORE aún no permite consumir contractualmente.
