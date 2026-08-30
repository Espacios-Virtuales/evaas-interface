# EVW-UI-H02-L04 · Cierre de Interacción Operacional Contextual

## Estado

`EVW-UI-H02-L04 · CLOSED`

| Cápsula | Estado | Commit | Resultado |
| --- | --- | --- | --- |
| C01 | CLOSED | `bd14a05` | Mapa operacional definido |
| C02 | CLOSED | `aabe3d7` | Requests contextuales migrados a modales |
| C03 | CLOSED | `91e1d45` | Estados de request estandarizados |
| C04 | CLOSED | `12609ec` | Operaciones sensibles protegidas |
| C05 | CLOSED | `106b9be` | Overlays endurecidos para accesibilidad y responsive |

## Modelo consolidado

```text
Vista = observación de contexto
Ruta = exploración profunda
Modal de request = operación acotada
Modal de confirmación = protección de operación sensible
External Action = salida explícita hacia un recurso externo
```

```text
Organization Detail
├── Resource Detail → modal de lectura
├── Create Resource → modal contextual
├── Assign ToolAccess → modal contextual
└── Disable ToolAccess → confirmación contextual

Organizations List
└── Change Organization Status → confirmación contextual
```

## Contratos y estado de petición

Resource y ToolAccess preservan payloads y endpoints existentes. `ToolAccess` continúa siendo `LEGACY_COMPATIBILITY`, no `InstrumentAccess`.

`OperationRequestState` representa `IDLE`, `VALIDATION_ERROR`, `SUBMITTING`, `SUCCESS`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT` y `ERROR`. No representa estado de dominio ni estado de colección:

```text
request state != domain state
request state != collection state
confirmation != request lifecycle
```

El éxito se determina exclusivamente con respuesta HTTP satisfactoria. Cancelar no muta colecciones ni simula éxito.

## Confirmaciones y accesibilidad

Organization status y ToolAccess disable requieren intención explícita antes de solicitar CORE. El flujo ToolAccess ya no usa `window.confirm`; el `confirm()` de Projects permanece como `FUTURE_CONFIRMATION_CANDIDATE / OUT_OF_SCOPE`.

Los overlays administrativos cuentan con foco inicial, trap Tab/Shift+Tab, Escape coherente, restauración de foco, scroll de fondo bloqueado, `aria-busy` durante request y errores con `role="alert"`. En viewport reducido mantienen scroll interno, una columna cuando corresponde y acciones apiladas.

## Invariantes finales

```text
route != operation
request modal != domain page
ToolAccess != InstrumentAccess
cancel != success
click != mutation completed
HTTP success = condición de éxito real
```

## Validación

```text
Typecheck app  = PASS
Typecheck spec = PASS
Build          = PASS
Full tests     = 48 SUCCESS, 2 FAILED PREEXISTING
```

Los fallos preexistentes son `ObjectCardComponent` y `ObjectsGridComponent`.

Warnings de presupuesto:

- Organizations SCSS: `PREEXISTING` (4.23 kB).
- Organization Detail SCSS: `PREEXISTING` (7.69 kB).
- Initial bundle: `PREEXISTING_WITH_DELTA`; pasó de 915.50 kB a 916.34 kB (`+0.84 kB`) por los estilos globales compartidos de C05.

## Smoke y despliegue

```text
INTERACTIVE_SMOKE = NOT_EXECUTED
AUTHENTICATED_SMOKE = NOT_EXECUTED
SCREEN_READER_SMOKE = NOT_EXECUTED
REAL_MOBILE_VIEWPORT_SMOKE = NOT_EXECUTED

DEPLOYMENT = MANUAL
PRODUCTION_SMOKE = PENDING_MANUAL_DEPLOYMENT
```
