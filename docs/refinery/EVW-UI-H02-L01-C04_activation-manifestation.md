# EVW-UI-H02-L01-C04 · Refinería Activation / Manifestation

Fecha: 2026-08-30

## A. Definición Activation

`Activation` es un proceso o registro que materializa una condición comercial, operacional, contractual, manual o interna. Es historia/transición operacional, no inventario.

```txt
Origin → Activation → Manifestation
```

El estado `ACTIVE` de una Activation describe la Activation; no implica que un Service, Resource, InstrumentAccess o Deployment esté activo.

## B. Estado actual Interface

Interface proyecta Activations en `/dashboard/admin/activations` y su detalle en `/dashboard/admin/activations/:id`. La vista se limita a origen, referencia comercial, comprador, organización, estado y trazabilidad temporal; no afirma qué entidades produjo.

## C. Contratos consumidos

```http
GET   /admin/commerce/activations
GET   /admin/commerce/activations/{id}
POST  /admin/commerce/activations
PATCH /admin/commerce/activations/{id}/status
```

`AdminCommerceService` consume estas rutas. No existen `/manifestations`, `/activation-effects`, `/activation-services` ni `/activation-resources` consumidos por Interface.

## D. Campos reales del DTO

`ExternalCommerceActivationDto` expone:

| Campos | Semántica confirmada |
| --- | --- |
| `id`, `provider` | Identidad y origen/proveedor del registro |
| `externalOrderId`, `externalMembershipId`, `productCode` | Referencia comercial externa y producto/código del registro |
| `buyerEmail`, `organizationName` | Contexto de comprador y organización |
| `status` | Estado de la Activation |
| `idempotencyKey`, `payloadHash` | Trazabilidad e idempotencia del procesamiento |
| `createdAt`, `updatedAt`, `processedAt` | Historia temporal/procesamiento |

Los estados tipados actuales son `RECEIVED`, `ACTIVE`, `SUSPENDED`, `CANCELLED`, `EXPIRED` y `FAILED` (con apertura a valores futuros). No son estados de entidades de inventario.

## E. Manifestation

`Manifestation` es el efecto producido por una Activation. Es `SEMANTIC_RESERVED`: Interface no proyecta una entidad, DTO ni endpoint de Manifestation.

```txt
Activation may activate → Service
Activation may provision → Resource
Activation may enable → InstrumentAccess
Activation may request → Artifact
Activation may create → Deployment
```

Estas son relaciones candidatas/objetivo, no relaciones runtime expuestas por CORE.

## F. Relaciones candidatas y reales

| Relación | Estado |
| --- | --- |
| Activation → Service | Candidata; sin contrato |
| Activation → Resource | Candidata; sin contrato |
| Activation → InstrumentAccess | Candidata; sin referencia canónica ni contrato de efecto |
| Activation → Artifact | Candidata; sin contrato |
| Activation → Deployment | Candidata; sin contrato |
| ToolAccess legacy → `externalCommerceActivationId` | Relación legacy explícita, no prueba de Manifestation canónica |

`externalCommerceActivationId` aparece en `AdminToolAccessDto` y `CreateToolAccessPayload`. Se conserva como vínculo legacy real y no se usa para derivar InstrumentAccess, Service, Resource, Artifact ni Deployment.

## G. Matriz

| Concepto | Estado actual | Semántica objetivo | Contrato | Decisión |
| --- | --- | --- | --- | --- |
| Activation | Implementado | Proceso/materialización | Endpoints reales | Conservar/refinar |
| Origin | Parcial | Condición inicial | `provider`, orden/membresía/código | Documentar |
| Manifestation | No implementado | Efecto producido | Sin contrato | Reservar |
| Service activation | No proyectado | Efecto posible | Sin contrato | No inventar |
| Resource provisioning | No proyectado | Efecto posible | Sin contrato | No inventar |
| InstrumentAccess enablement | No proyectado | Efecto posible | Sin referencia canónica | No inventar |
| Artifact request | No proyectado | Efecto posible | Sin contrato | No inventar |
| Deployment creation | No proyectado | Efecto posible | Sin contrato | No inventar |

## H. Decisión

```txt
Activation = proceso de materialización
Manifestation = efecto producido

Activation != Service
Activation != Resource
Activation != Artifact
Activation != InstrumentAccess
Activation != Deployment
```

Activation queda implementada. Manifestation queda como modelo semántico reservado y su proyección permanece bloqueada por contratos CORE.
