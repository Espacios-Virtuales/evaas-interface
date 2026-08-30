# EVW-UI-H02-L03-C02 · Organization Detail

Fecha de auditoría: 2026-08-30.

## A. Estructura actual

`/dashboard/admin/organizations/:id` representa el contexto operacional de una `Organization`. Su carga principal usa `GET /admin/access/organizations/{id}` y carga en paralelo las colecciones demostrables de ToolAccess y Resources.

La jerarquía visible resultante es:

```text
Organization Detail
├── Identity / estado
├── Responsable (owner)
├── ToolAccess legacy
└── Recursos asociados
```

El orden visual conserva el flujo operativo existente: primero identificar el contexto, luego ownership, después la compatibilidad de acceso y finalmente los activos operacionales.

## B. Contratos visibles

| Sección | Contrato | Semántica | Estado |
| --- | --- | --- | --- |
| Identity | `OrganizationDto` | Organization | canonical |
| Owner | `ownerUserId`, `ownerEmail` | Ownership | canonical |
| Resources | `GET /admin/access/organizations/{id}/resources` | Resource | canonical |
| Access | `GET /admin/access/organizations/{id}/tool-access` | ToolAccess legacy | compatibility |
| Members | ninguno | Membership | blocked |
| Services | ninguno | Service | blocked |
| Artifacts / Apps / Deployments | ninguno | Artifact / App / Deployment | blocked |
| InstrumentAccess | contrato UUID no consumible en este contexto | acceso canónico | blocked |
| Integrations / ExternalServices | ninguno | vínculo / sistema externo | blocked |

`OrganizationDto` muestra `id`, `name`, `taxId`, `enabled`, `createdAt` y `updatedAt` cuando están disponibles. `enabled` pertenece al estado de Organization y no se interpreta como estado de Resource, Service o Activation.

## C. Secciones conservadas

- **Identity / estado**: identidad administrativa y trazabilidad de Organization.
- **Responsable (owner)**: `ownerEmail` y `ownerUserId`, separados de la identidad y visibles únicamente cuando el backend los entrega.
- **Recursos asociados**: activos, infraestructura y capacidades operacionales. Conserva sus estados `LOADING`, `EMPTY`, `POPULATED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT` y `ERROR`.
- **ToolAccess**: accesos operacionales legacy, sin renombrarlos como `InstrumentAccess`.
- **Detalle de Resource**: modal existente que presenta campos contractuales del Resource; no demuestra una pauta de modales futuros.

Los errores de Resources siguen desacoplados de la carga principal de Organization y ToolAccess: un fallo de colección secundaria no colapsa todo el detalle.

## D. Secciones refinadas

- La ficha general ya no mezcla campos owner: Identity y Ownership están separadas.
- Ownership se rotula **Responsable (owner)** y declara que no representa Membership.
- ToolAccess se rotula **Accesos legacy** y conserva la frontera `ToolAccess != InstrumentAccess`.
- El empty state de acceso es **No hay accesos registrados**, sin hablar de Services, Members o Instruments habilitados.
- Recursos conserva explícitamente su significado de activo, infraestructura o capacidad operacional; no es Service, Artifact ni Instrument.
- Se eliminó la sección vacía **Activaciones asociadas** y la sección placeholder de flujo futuro.
- El formulario de ToolAccess ya no carga Activations globales ni deriva candidatas por `organizationName` o `buyerEmail`. Mantiene sólo `externalCommerceActivationId` como referencia opcional del payload, sin afirmar relación de Activation con la Organization.

## E. Secciones no implementadas

No se agregan placeholders ni secciones para los siguientes conceptos, porque su existencia semántica no equivale a una proyección Organization disponible:

```text
Members
Clients
Collaborators
Services
Artifacts
Apps
Deployments
InstrumentAccess
Integrations
ExternalServices
Manifestations
```

En particular, no se infieren Members desde owner, Clients desde `buyerEmail`, Collaborators desde User ni Activations desde coincidencias de texto.

## F. ToolAccess legacy

`ToolAccess` se conserva porque existe un contrato Long consumible en el detalle de Organization. Puede asignarse mediante `CreateToolAccessPayload` y deshabilitarse usando las operaciones actuales. Esto no lo promueve a `InstrumentAccess`: el contrato canónico requiere `organizationRef` UUID, no disponible en `OrganizationDto`.

La referencia opcional `externalCommerceActivationId` pertenece al payload de ToolAccess. Sin una relación backend explícita por Organization, Interface no consulta ni muestra una colección de Activations asociadas.

## G. Candidatos de interacción para L04

Estos candidatos son acciones reales respaldadas por contratos existentes; se registran como `MODAL_CANDIDATE` sin rediseñarlos ni implementarlos en esta cápsula:

| Acción | Contrato actual | Estado |
| --- | --- | --- |
| Actualizar estado de Organization | `PATCH /admin/access/organizations/{id}/status` | `MODAL_CANDIDATE` |
| Asignar / deshabilitar ToolAccess | endpoints legacy de ToolAccess | `MODAL_CANDIDATE` |
| Crear Resource asociado | contrato Admin Resource existente | `MODAL_CANDIDATE` |
| Ver detalle de Resource | datos Resource ya cargados | modal existente, no generalizado |

## Riesgo residual

Permanecen ToolAccess legacy y tipos Resource legacy. Siguen bloqueados OrganizationMember, Service, Artifact, Integration y un InstrumentAccess consumible. Estas ausencias no son errores de la vista: son límites contractuales que deben resolverse en CORE antes de ampliar la proyección.
