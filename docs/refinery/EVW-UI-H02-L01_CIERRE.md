# EVW-UI-H02-L01 · Cierre de Coherencia del Modelo Operacional

Fecha: 2026-08-30

## Estado

`EVW-UI-H02-L01 · CLOSED`

L01 es la primera carga productiva de EVW-UI-H02. Refina significado y límites contractuales sin introducir dominios, relaciones o endpoints anticipados.

## Matriz de cápsulas

| Cápsula | Estado | Commit | Resultado |
| --- | --- | --- | --- |
| C01 | CLOSED | `a51a563` | Service / Resource diferenciados |
| C02 | CLOSED | `964ee57` | Artifact / App / Deployment refinados |
| C03 | CLOSED | `47f2581` | Instrument / Access diferenciados |
| C04 | CLOSED | `553e824` | Activation / Manifestation diferenciados |

## Semántica consolidada

```txt
Organization = contexto

Service = prestación
Resource = capacidad disponible

Artifact = resultado producido
App = Artifact ejecutable
Deployment = manifestación runtime

Instrument = capacidad especializada
InstrumentAccess = habilitación
ToolAccess = compatibilidad legacy

Activation = proceso de materialización
Manifestation = efecto producido
```

```txt
Service != Resource
Artifact != Resource
Artifact != Service
App ⊂ Artifact
Deployment != Resource
Deployment != Artifact
Instrument != Resource
Instrument != Integration
InstrumentAccess != ToolAccess
Activation != inventario
Activation != Service
Activation != Resource
Activation != Artifact
Manifestation != Activation
```

## Contratos bloqueados

| Concepto | Estado | Motivo real |
| --- | --- | --- |
| Service | BLOCKED_BY_HTTP_CONTRACT | No hay DTO, servicio ni endpoint administrativo consumido por Interface. |
| Artifact | BLOCKED_BY_HTTP_CONTRACT | No hay identidad, versión/provenance ni endpoint HTTP consumido. |
| Deployment | SEMANTIC_RESERVED | No hay entidad runtime ni contrato que conecte Artifact/App con Resources. |
| Manifestation | SEMANTIC_RESERVED | No hay DTO, endpoint ni relaciones de efecto de Activation expuestas. |
| InstrumentAccess | UI_BLOCKED_BY_CANONICAL_REFERENCE | CORE requiere `organizationRef` UUID y el contexto UI solo expone `Organization.id` Long. |

Estos bloqueos son dependencias externas; no son defectos abiertos de L01.

## Legacy conservado

- `REPOSITORY`, `DASHBOARD` y `WORKER` permanecen como tipos Resource legacy; no se migran por nombre.
- `objects/`, `projects/` e `integrations/software` permanecen `LEGACY_MODEL` sin refactor estructural.
- ToolAccess continúa operativo por compatibilidad y sigue separado de InstrumentAccess.
- `/dashboard/admin/access` continúa como redirect legacy hacia Instrumentos.

## Verificación de contratos

No se crearon `/admin/services`, `/admin/artifacts`, `/admin/deployments`, `ServiceDto`, `ArtifactDto`, `DeploymentDto` ni `ManifestationDto`.

- Resources: VPS, WordPress operativo y API habilitada siguen siendo capacidades/activos legítimos.
- Instrumentos: `GET /admin/instruments` es la fuente de catálogo; `LIORA` se presenta como Comunicador sin crear otra entidad.
- Activations: `GET` listado/detalle, `POST` y `PATCH status` son los contratos consumidos; sus estados pertenecen a Activation.

## Validación integral

```bash
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
npm run build
```

Resultado: `tsc app` PASS, `tsc spec` PASS y build de producción PASS.

Warnings conocidos de build: presupuesto inicial global, stylesheet de Organization detail y stylesheet de Organizations. No son regresiones introducidas por L01.

No se declara la suite Karma completa como PASS: no fue ejecutada en este cierre. Los fallos históricos conocidos de `ObjectsGridComponent` y `ObjectCardComponent` permanecen fuera de alcance.

## Estado posterior

```txt
EVW-UI-H02
├── L01 · CLOSED + READY_TO_DEPLOY
│   ├── C01 · CLOSED
│   ├── C02 · CLOSED
│   ├── C03 · CLOSED
│   └── C04 · CLOSED
├── L02 · PENDING
├── L03 · PENDING
└── L04 · PENDING
```

L02 no se abre hasta completar merge, deploy y smoke de esta carga.
