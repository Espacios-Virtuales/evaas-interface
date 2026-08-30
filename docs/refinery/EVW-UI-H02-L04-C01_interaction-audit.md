# EVW-UI-H02-L04-C01 · Auditoría de navegación versus operación

## A. Principio

La interacción se clasifica por su propósito, no por el componente que la implementa:

- **VIEW**: lectura dentro del contexto actual.
- **DETAIL**: exploración profunda de una entidad; conserva una ruta cuando aporta contexto e historial.
- **REQUEST**: operación que crea, modifica o solicita estado.
- **CONFIRMATION**: protección explícita de una operación sensible.
- **NAVIGATION**: cambio deliberado de dominio o contexto.
- **EXTERNAL_ACTION**: salida a un recurso fuera de EVAAS Interface.

Un modal es apropiado para una petición acotada que conserva el contexto. No sustituye una ruta de detalle ni una estación funcional completa.

## B. CURRENT_INTERACTION_MAP

```text
Administración
├── Organizaciones
│   ├── Ver detalle ───────────────────────────────→ ruta Organization Detail
│   ├── Nueva organización ─────────────────────────→ modal local
│   └── Habilitar / deshabilitar ───────────────────→ PATCH inmediato en la tabla
├── Organization Detail
│   ├── Ver detalle de Resource ────────────────────→ modal local de solo lectura
│   ├── Abrir Resource URL ─────────────────────────→ enlace externo
│   ├── Crear Resource ─────────────────────────────→ formulario inline expandible
│   ├── Asignar ToolAccess ─────────────────────────→ formulario inline expandible
│   ├── Buscar User para ToolAccess ────────────────→ petición auxiliar inline
│   └── Deshabilitar ToolAccess ────────────────────→ window.confirm + DELETE
├── Recursos
│   └── Ver detalle ────────────────────────────────→ modal local, GET opcional por id
├── Instrumentos
│   └── Ver Comunicador ────────────────────────────→ ruta de detalle funcional
└── Activaciones
    ├── Nueva activación ───────────────────────────→ modal local
    └── Ver detalle ────────────────────────────────→ ruta read-only

Legacy
├── /dashboard/admin/access ───────────────────────→ redirect a Instrumentos
├── /dashboard/client ─────────────────────────────→ experiencia UI read-only
├── /dashboard/resources ──────────────────────────→ catálogo legacy + modal de provisionamiento
└── /dashboard/projects ───────────────────────────→ grid legacy + dialog de edición/eliminación
```

## C. TARGET_INTERACTION_MAP

```text
Organization Detail
├── Ver Resource ──────────────────────────────────→ modal de lectura (conservar)
├── Abrir Resource ────────────────────────────────→ acción externa (conservar)
├── Crear Resource ────────────────────────────────→ request modal contextual [P1 / C02]
├── Asignar ToolAccess ────────────────────────────→ request modal contextual [P1 / C02]
└── Deshabilitar ToolAccess ───────────────────────→ confirmación contextual [P1 / C04]

Organization list
└── Habilitar / deshabilitar ───────────────────────→ confirmación contextual [P1 / C04]

Activation detail e Instrument detail ─────────────→ rutas (conservar)
```

La creación de Organization y Activation ya es modal local. Su consistencia de estados, foco y cierre es insumo de C03/C05, no una migración necesaria de C02.

## D. Matriz de interacción

| Contexto | Acción | Evidencia actual | Clasificación | Objetivo | Prioridad |
| --- | --- | --- | --- | --- | --- |
| Administración | Cards de dominios | `routerLink` | NAVIGATION | ruta | KEEP |
| Organization list | Filtrar / recargar | petición de colección | VIEW | conservar | KEEP |
| Organization list | Ver detalle | `/organizations/:id` | DETAIL + NAVIGATION | ruta | KEEP |
| Organization list | Nueva organización | modal + `POST /admin/organizations` | REQUEST | modal actual | KEEP |
| Organization list | Habilitar / deshabilitar | `PATCH` inmediato | REQUEST + SENSITIVE_OPERATION | confirmación contextual | P1 / C04 |
| Organization Detail | Ver Resource | modal local | VIEW | modal actual | KEEP |
| Organization Detail | Abrir URL de Resource | `<a target="_blank">` | EXTERNAL_ACTION | enlace externo | KEEP |
| Organization Detail | Crear Resource | formulario inline + `POST /admin/resources` | REQUEST | modal contextual | P1 / C02 |
| Organization Detail | Asignar ToolAccess | formulario inline + `POST /admin/access/tool-access` | REQUEST | modal contextual | P1 / C02 |
| Organization Detail | Buscar User | GET auxiliar por email | REQUEST auxiliar | dentro del modal de ToolAccess | P2 / C02 |
| Organization Detail | Deshabilitar ToolAccess | `window.confirm` + `DELETE` | CONFIRMATION + SENSITIVE_OPERATION | confirmación contextual | P1 / C04 |
| Recursos | Ver detalle | modal local + GET opcional `/admin/resources/:id` | VIEW | modal actual | KEEP |
| Instrumentos | Ver catálogo | colección canónica | VIEW | vista | KEEP |
| Instrumentos | Abrir Comunicador | `/instruments/comunicador` | DETAIL + NAVIGATION | ruta | KEEP |
| Activations list | Nueva activación | modal + POST | REQUEST | modal actual | KEEP |
| Activations list | Ver detalle | `/activations/:id` | DETAIL + NAVIGATION | ruta | KEEP |
| Activation detail | Reintentar carga / ver Organization | GET / `routerLink` | VIEW / NAVIGATION | conservar | KEEP |
| Client Dashboard | Recargar | colección read-only | VIEW | conservar | KEEP |
| Legacy software | Crear Project desde Software | Angular Material dialog + POST legacy | REQUEST / LEGACY_MODEL | aislar; fuera de C02 | BLOCKED |
| Legacy Projects | Editar / eliminar Project | dialog + update/delete legacy | REQUEST + CONFIRMATION | aislar; fuera de C02 | BLOCKED |

## E. Modal candidates

### P1

- **Crear Resource**: contrato `POST /admin/resources` consumido, formulario inline domina Organization Detail y ya conoce el `organizationId` contextual.
- **Asignar ToolAccess legacy**: contrato `POST /admin/access/tool-access` consumido; la búsqueda de User y validación pertenecen a una petición acotada del contexto Organization.
- **Deshabilitar ToolAccess legacy**: contrato `DELETE /admin/access/tool-access/:id` consumido; hoy depende de `window.confirm`, por lo que requiere confirmación contextual en C04.
- **Cambiar enabled de Organization**: contrato `PATCH` consumido; hoy se ejecuta de inmediato desde la tabla, por lo que requiere confirmación en C04.

### P2

- Búsqueda de User por email como subflujo del modal de ToolAccess; no es una navegación independiente.
- Revisión de los modales actuales de creación de Organization y Activation para alinear estados de petición en C03.

### P3 / KEEP

- Detalles de Resource: patrones de lectura ya mantienen el contexto en modal.
- Detalles de Organization, Activation y Comunicador: rutas; muestran contexto profundo, trazabilidad o estación funcional.

## F. Operaciones que deben seguir siendo rutas

- Organization Detail (`/dashboard/admin/organizations/:id`).
- Activation Detail (`/dashboard/admin/activations/:id`), explícitamente read-only e histórico.
- Comunicador (`/dashboard/admin/instruments/comunicador`), estación funcional del Instrument.
- Navegación principal entre Administración, Organizaciones, Recursos, Instrumentos y Activaciones.
- Redirect histórico `/dashboard/admin/access → /dashboard/admin/instruments` como compatibilidad, no operación.

## G. External actions

Los enlaces `url`, `operationalUrl` o `link` de Resource usan `target="_blank"` y `rel="noopener noreferrer"`. Son **EXTERNAL_ACTION**: no deben convertirse en rutas EVAAS ficticias ni en modal de navegación.

## H. Operaciones sensibles

| Operación | Estado actual | Riesgo / decisión |
| --- | --- | --- |
| Habilitar / deshabilitar Organization | PATCH directo desde tabla | requiere confirmación contextual en C04 |
| Deshabilitar ToolAccess | `window.confirm` antes de DELETE | reemplazar por confirmación contextual en C04 |
| Eliminar Project legacy | `confirm()` en diálogo legacy | fuera del alcance de la operación canónica L04; mantener aislado |

No se encontró una operación UI consumida para actualizar estado de Activation ni una eliminación de Resource en la proyección administrativa canónica.

## I. Operaciones bloqueadas por contrato

No son candidatos de modal en L04 mientras CORE no exponga contratos consumibles:

- Crear Service, Artifact, Deployment o Manifestation.
- Crear OrganizationMember, Client relationship o Collaborator relationship.
- Habilitar InstrumentAccess canónico.
- Crear Integration o ExternalService.

## J. Modal de Resource observado

Dos variantes locales, una en Resource global y otra en Organization Detail:

- Apertura mediante señales de componente; no hay `DialogService` común.
- Entrada: `AdminResourceDto`; la lista global hace GET opcional por id para enriquecer el detalle.
- Salida: cierre local sin mutar Resource.
- Conserva contexto y separa VIEW de EXTERNAL_ACTION.
- Tiene `role="dialog"`, `aria-modal` y control explícito de cierre; no se observó gestión de Escape, atrapamiento/restauración de foco ni cierre al pulsar backdrop.
- El SCSS limita el alto, pero el detalle de Organization ya supera el presupuesto de SCSS; C05 debe revisar mobile, scroll vertical y posible doble scroll antes de adoptar el patrón.

Estado: `PATTERN_CANDIDATE`, no estándar final.

## K. Formularios inline y navegación incidental

Los formularios inline que alteran la lectura de Organization Detail son:

- Crear Resource.
- Asignar ToolAccess legacy, incluyendo búsqueda de User.

No se encontraron rutas intermedias de formulario para estas operaciones. Por ello no hay `NAVIGATION_FOR_OPERATION` canónica que deba eliminarse; C02 puede mejorar la preservación del contexto migrando ambos formularios a modales locales.

Las creaciones de Organization y Activation ya son modales, no navegaciones incidentales.

## L. Estados de petición actuales e inputs para C03

| Flujo | Estados observados | Brecha |
| --- | --- | --- |
| Create Organization / Activation | `idle`, `validation`, `loading`, `success`, `error` | mensajes HTTP no están normalizados por código de estado |
| Update Organization status | id en actualización, éxito/error | no hay confirmación previa; no modela 401/403/404/409 como estado visible diferenciado |
| Create Resource / ToolAccess | submitting, validation, success, error; mapeo 400/401/403/404/409 | implementación local duplicada |
| Disable ToolAccess | id en progreso, success/error; mapeo 401/403/404/409 | confirmación nativa no accesible/estandarizada |
| Resource collections | `LOADING`, `EMPTY`, `POPULATED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `ERROR` | patrón más completo, solo local a la colección |

Entrada C03: definir una representación consistente sin alterar contratos ni borrar las distinciones de colección.

Entrada C04: confirmar antes de PATCH de Organization y DELETE de ToolAccess; el alcance legacy de Project queda fuera.

## M. Hallazgos iniciales de responsive y accesibilidad para C05

- Los formularios inline de Organization Detail agregan grids y tablas anchas a una página ya extensa; son el principal riesgo de mobile y doble scroll.
- Los modales locales usan semántica `role="dialog"` y `aria-modal`, y varios botones tienen texto/`aria-label` de cierre.
- No se observó manejo de Escape, foco inicial, focus trap ni restauración de foco en los modales manuales.
- El modal Angular Material del catálogo legacy usa `maxWidth`, `maxHeight`, `autoFocus: false` y `restoreFocus: true`; es evidencia legacy, no patrón canónico adoptado.
- Las tablas administrativas usan `table-responsive`; C05 debe verificar alcance de acciones y lectura en viewport estrecho.

## N. Alcance y riesgos residuales

Esta cápsula no modifica routing, requests ni modales. ToolAccess, Projects y catálogo de software permanecen legacy clasificados. La migración P1 debe conservar los contratos reales y no promover ToolAccess a InstrumentAccess ni Resource a Service/Artifact.
