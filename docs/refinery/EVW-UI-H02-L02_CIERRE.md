# EVW-UI-H02-L02 · Cierre de Organización y Relaciones

Fecha de cierre: 2026-08-30.

## Estado

```text
EVW-UI-H02-L02 · CLOSED
```

## Matriz de cápsulas

| Cápsula | Estado | Commit | Resultado |
| --- | --- | --- | --- |
| C01 | CLOSED | `15f7b24` | Organization, ownership, membership y roles diferenciados |
| C02 | CLOSED | `d0772df` | Client y Collaborator definidos como relaciones |
| C03 | CLOSED | `56fa944` | ExternalService e Integration diferenciados |

## Semántica consolidada

```text
Organization = contexto
User = identidad

Owner = ownership
Member = pertenencia
Client = relación comercial
Collaborator = relación de contribución

AuthenticationRole = acceso a aplicación
OrganizationRole = responsabilidad contextual

ExternalService = sistema externo
Integration = vínculo externo
```

Invariantes verificados:

```text
Organization != User
Organization != Client
Owner != OrganizationMember
User != OrganizationMember
User != Client
User != Collaborator

ROLE_CLIENT != Client relationship
ROLE_USER != Collaborator relationship
ROLE_COMPANY != Organization

ExternalService != Integration
Integration != Instrument
Integration != Resource
Integration != Service
provider field != ExternalService entity
```

## Contratos y proyección conservada

`OrganizationDto` continúa siendo el contrato real de Organization. `ownerUserId` y `ownerEmail` se presentan exclusivamente como ownership/responsabilidad; no se usan para inferir Member, Client ni Collaborator.

No se introdujeron `OrganizationMemberDto`, `OrganizationMemberService`, `ClientDto`, `CollaboratorDto`, `IntegrationDto`, `IntegrationService`, `ExternalServiceDto`, `ExternalSystemDto` ni endpoints relacionales especulativos.

`/dashboard/client` permanece `UI_PERSONA`: una experiencia de aplicación respaldada por contratos `/me/*`, no prueba de una entidad Client canónica. `ROLE_ADMIN`, `ROLE_CLIENT`, `ROLE_USER` y `ROLE_COMPANY` continúan siendo roles de acceso de aplicación.

## Bloqueos CORE

Los siguientes conceptos están definidos semánticamente y bloqueados únicamente por la ausencia de un contrato HTTP explícito consumible. No son fallos de L02:

| Concepto | Estado |
| --- | --- |
| OrganizationMember | `SEMANTIC_DEFINED` · `BLOCKED_BY_HTTP_CONTRACT` |
| OrganizationRole | reservado · `BLOCKED_BY_HTTP_CONTRACT` |
| Client relationship | `SEMANTIC_DEFINED` · `BLOCKED_BY_HTTP_CONTRACT` |
| Collaborator relationship | `SEMANTIC_DEFINED` · `BLOCKED_BY_HTTP_CONTRACT` |
| ExternalService | `SEMANTIC_DEFINED` · `BLOCKED_BY_HTTP_CONTRACT` |
| Integration | `SEMANTIC_DEFINED` · `BLOCKED_BY_HTTP_CONTRACT` |

CORE deberá exponer relaciones explícitas y seguras antes de que Interface proyecte miembros, roles organizacionales, clientes, colaboradores, sistemas externos o integraciones.

## Legacy conservado

| Elemento | Significado actual |
| --- | --- |
| `/dashboard/client` | experiencia UI para sesiones dirigidas al cauce client; no entidad Client |
| `ROLE_CLIENT`, `ROLE_USER`, `ROLE_COMPANY` | roles de autenticación/aplicación; `ROLE_USER` y `ROLE_COMPANY` son compatibilidad legacy |
| `integrations/software` | `LEGACY_MODEL`: catálogo/búsqueda de software y flujo de provisionamiento; no Integration canónica, Resource canónico ni ExternalService |
| campos escalares `provider` | origen de Activation, proveedor de infraestructura legacy o metadata de software; no entidades ExternalService |

La UI legacy de `/integrations/software` se identifica como **Catálogo legacy de software**. El dashboard Client no atribuye ToolAccess a una Organization sin contrato relacional explícito. Instrument y Resource conservan sus fronteras semánticas y no se mezclan con Integration o ExternalService.

## Validación de feature

La validación integral se ejecuta antes de integrar y nuevamente después de cada promoción. Los warnings de presupuesto esperados se clasifican como `PREEXISTING` mientras permanezcan exactamente así:

- bundle inicial: 915.50 kB frente a presupuesto de 500 kB;
- `admin-organizations-list.component.scss`: 4.23 kB frente a 4 kB;
- `admin-organization-detail.component.scss`: 7.69 kB frente a 4 kB.

## Resultado

```text
Una persona no es su relación.
Un proveedor no es su integración.
Un rol de acceso no es una pertenencia.

La Interface muestra la relación que CORE puede demostrar,
y reserva el resto hasta disponer del contrato.
```
