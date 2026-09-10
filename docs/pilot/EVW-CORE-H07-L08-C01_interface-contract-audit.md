# 1. Matriz backend ↔ Interface

| Dominio | DTO CORE / servicio CORE | HTTP administrativo | Interface actual | Estado | Acción |
| --- | --- | --- | --- | --- | --- |
| Organization | `OrganizationDto`; `AccessManagementService`. Expone `id`, `name`, `taxId`, `logoUrl`, `brandColor`, `ownerUserId`, `ownerEmail`, `enabled`, `createdAt`. | `GET /admin/access/organizations`, `GET /admin/access/organizations/{id}`; además creación y cambio de estado. | `OrganizationDto`, `AdminAccessService`, lista y detalle existentes. Consume identidad, owner y estado, pero no modela ni muestra `logoUrl` o `brandColor`; conserva `status` y `updatedAt`, que no pertenecen al DTO actual. | PARTIAL | C02: alinear el modelo y las vistas existentes a la proyección de lectura actual, incorporando branding solo como dato recibido. |
| OrganizationMember | `OrganizationMemberDto` (`canonicalId`, `userId`, `userEmail`, `role`, `status`); `AccessManagementService`. | `GET /admin/access/organizations/{id}/members`. | No hay modelo, servicio, llamada ni proyección en rutas/vistas. | MISSING | C02: añadir consumo tipado y estado vacío en el contexto existente de Organization. |
| Instrument | `InstrumentDto` (`canonicalId`, `key`, `status`); `InstrumentCatalogQueryService`. | `GET /admin/instruments`. | `AdminInstrumentDto` solo exige `key`; `AdminInstrumentService` y `/dashboard/admin/instruments` existen. La vista no proyecta `canonicalId` ni `status`. | PARTIAL | C02: tipar y representar únicamente los campos canónicos recibidos. |
| InstrumentAccess | `InstrumentAccessDto` (`canonicalId`, `organizationRef`, `instrumentRef`, `instrumentKey`, `status`); `InstrumentAccessQueryService`. | `GET /admin/organizations/{organizationRef}/instrument-access`, donde `organizationRef` es UUID. | No hay modelo ni servicio. La vista de Organization solo conoce el `id` numérico de `OrganizationDto`; `ToolAccess` sigue activo pero no es sustituto semántico. | BLOCKED_BY_API | CORE debe incluir una referencia canónica compatible en la proyección administrativa de Organization, o exponer una resolución HTTP explícita. |
| Resource | `AdminResourceDto`; `ResourceService`. Expone `key`, `name`, `type`, `provider`, `status`, `visibility`, `url` y trazabilidad. | `GET /admin/resources`, `GET /admin/resources/{id}`, `GET /admin/access/organizations/{id}/resources`; creación disponible. | `AdminResourceDto` abierto, `AdminResourceService`, lista global y sección Organization. Proyecta `key`, `name`, `type`, `status`, `visibility` y `url`, pero no `provider`. Envía `metadataJson` al crear y admite aliases de lectura, pero el DTO de lectura actual no devuelve metadata. | PARTIAL | C02: tipar el DTO y proyectar `provider`; conservar metadata como no configurado hasta que el GET la exponga. |
| Service | Entidad `Service` y `ServiceRepository`; no existe `ServiceDto` ni servicio de aplicación/contrato administrativo de lectura. | No existe `/admin/.../services` ni endpoint por Organization. | Sin modelo, servicio ni ruta/vista. | BLOCKED_BY_API | CORE debe publicar DTO y proyección HTTP administrativa antes de cualquier UI. |
| Artifact | Entidad `Artifact` y `ArtifactRepository`; no existe `ArtifactDto` ni controlador. | No hay endpoint por Service ni por Organization. | Sin modelo, servicio ni ruta/vista. | BLOCKED_BY_API | CORE debe publicar el contrato HTTP de Artifact, incluida versión y provenance. |
| Deployment | Entidad `Deployment`; `DeploymentService` interno crea la relación Artifact → Resource y valida Organization. `environment` y `status` pertenecen a Deployment. | No hay `DeploymentDto` ni controlador/endpoints administrativos. | Sin modelo, servicio ni ruta/vista; no se reconstruye desde metadata de Resource. | BLOCKED_BY_API | CORE debe publicar una proyección administrativa de Deployment con Artifact, Resource, `environment`, estado y endpoint. |
| CommunicationAction | `CommunicationActionResponseDto`; `CommunicationActionService`. Incluye estado, correlación/idempotencia, resultado técnico/evidencia y errores. | `GET /admin/communication-actions` y `GET /admin/communication-actions/{id}`; solo lectura. | No hay modelo, servicio, endpoint declarado ni ruta/vista. Las activaciones comerciales no proyectan este dominio. | MISSING | C03: consumirlo exclusivamente como evidencia/observabilidad de solo lectura. |

# 2. Contratos nuevos detectados

- Organization incorpora `logoUrl` y `brandColor` en su DTO HTTP. La Interface usa el mismo endpoint, pero su modelo y detalle no los reciben ni representan.
- OrganizationMember ya es consumible: `OrganizationMemberDto` y `GET /admin/access/organizations/{id}/members` usan el mismo `id` numérico presente en Organization.
- CommunicationAction está disponible tras H07-L07 como `CommunicationActionResponseDto` mediante dos GET administrativos. Expone `status`, `idempotencyKey`, `requestId`, referencias Liora, evidencia técnica y errores; el controlador no publica comandos de ciclo de vida.
- Resource expone `provider` en sus GET. `metadataJson` existe en `CreateResourceRequestDto`, pero no en el `AdminResourceDto` de respuesta actual: no hay metadata que la Interface pueda leer sin inferirla.
- CORE ya persiste Service, Artifact y Deployment. Esto confirma las relaciones `Artifact → Service`, `Deployment → Artifact` y `Deployment → Resource`, pero no los convierte todavía en contratos HTTP para Interface.

# 3. Legacy todavía activo

- `ToolAccess` permanece como compatibilidad activa mediante `/admin/access/.../tool-access`, `AdminToolAccessDto` y los modales del detalle de Organization. No se debe renombrar ni presentar como InstrumentAccess.
- El modelo Angular de Organization conserva `status` y `updatedAt`, aunque el `OrganizationDto` actual de CORE no los devuelve. Deben dejar de tratarse como datos canónicos disponibles.
- `AdminResourceDto` es un índice abierto y las vistas aceptan aliases como `resourceKey`, `operationalUrl`, `metadata`, `config` y `configuration`. Son compatibilidad de lectura, no campos del contrato actual; `metadataJson` solo está confirmado en el request de creación.
- Las rutas/modelos de Project, Software y provisioning bajo `API.legacy` no constituyen Service, Artifact ni Deployment canónicos. Tampoco se debe derivar esos dominios desde Resources.
- Activations corresponde al contrato de comercio existente; no representa CommunicationAction ni habilita sus operaciones legacy retiradas (`create/approve/execute/refresh/cancel/mark failed draft`).

# 4. Gaps reales

- Alinear Organization con branding de lectura y retirar la expectativa de `status`/`updatedAt` del DTO actual.
- Consumir Memberships con estados vacíos explícitos; no derivarlos desde owner, roles de sesión, ToolAccess o activaciones.
- Formalizar el contrato Angular de Instrument y Resource. Para Resource falta mostrar `provider`; metadata de lectura sigue indisponible por API.
- InstrumentAccess no está bloqueado por ausencia de DTO o GET: está bloqueado porque la Interface no recibe el UUID `organizationRef` requerido para invocar el GET canónico.
- Service, Artifact y Deployment permanecen bloqueados por ausencia de proyección HTTP, aunque sus entidades, repositorios y —para Deployment— servicio interno existan.
- Incorporar CommunicationAction requiere modelo, servicio, endpoints y una proyección administrativa de evidencia; no requiere ni autoriza operaciones de comunicación.

# 5. Alcance recomendado para C02 y C03

- C02: alinear los modelos y vistas administrativas ya existentes de Organization, Instrument y Resource; consumir OrganizationMember en el contexto de Organization con vacío/no configurado explícito. No crear tabs, CRUD ni rutas imaginarias.
- C03: proyectar CommunicationAction como evidencia de solo lectura, con correlación, estado, resultado técnico y errores. Mantener Activations separado.
- Dejar fuera de C02/C03, hasta nueva evidencia HTTP de CORE, InstrumentAccess, Service, Artifact y Deployment. En particular, no usar ToolAccess ni metadata de Resource para suplir esas relaciones.
