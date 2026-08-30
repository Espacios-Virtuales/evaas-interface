# EVW-UI-H02-L02-C01 · Organization / Members / Roles

Fecha de auditoría: 2026-08-30.

## A. Organization

`Organization` es el contexto operacional administrado por EVAAS. No representa una identidad autenticable, un cliente ni una relación de pertenencia.

Interface consume el contrato HTTP real `OrganizationDto` desde:

- `GET` y `POST /admin/access/organizations`;
- `GET /admin/access/organizations/{id}`;
- `PATCH /admin/access/organizations/{id}/status`.

El DTO actualmente proyectado es:

| Campo | Significado en Interface |
| --- | --- |
| `id` | identificador administrativo numérico |
| `name` | identidad organizacional |
| `taxId?` | dato tributario, si el backend lo informa |
| `enabled?` | estado de la Organization |
| `status?` | estado adicional, si el backend lo informa |
| `ownerUserId?` | referencia de ownership |
| `ownerEmail?` | dato asociado al owner |
| `createdAt?`, `updatedAt?` | trazabilidad |

La vista `/dashboard/admin/organizations` y su detalle `/dashboard/admin/organizations/:id` muestran Organization y sus campos reales. Los accesos de herramientas y recursos se consultan por contratos separados; no describen membresía humana.

## B. Ownership

El backend expone opcionalmente `ownerUserId` al crear y consultar una Organization, y `ownerEmail` al consultarla. Interface los presenta como responsable (owner).

`Owner` significa relación de responsabilidad/propiedad. Los campos owner no son una colección, no prueban relación de pertenencia y no se usan para derivar Member, Client ni Collaborator.

## C. OrganizationMember

No se encontró `OrganizationMemberDto`, `OrganizationMemberService`, endpoint `/admin/.../members`, ni contrato HTTP de membership consumido por Interface. Las únicas ocurrencias de `externalMembershipId` pertenecen a activaciones comerciales externas y no son `OrganizationMember`.

Estado:

```text
OrganizationMember = SEMANTIC_DEFINED
OrganizationMember = DOMAIN_AVAILABLE
OrganizationMember = HTTP_NOT_CONSUMED
OrganizationMember = BLOCKED_BY_HTTP_CONTRACT
```

La UI no crea una sección Members ni infiere miembros desde owner, ToolAccess, Activation o lookup de usuario.

## D. Authentication roles

Los roles observados en sesión/autenticación son `ROLE_ADMIN`, `ROLE_CLIENT`, `ROLE_USER` y `ROLE_COMPANY`. Se almacenan en `UserSession.roles`, se usan para decidir el destino inicial en `role-routing`, para metadatos de rutas del dashboard y para visibilidad de navegación. `ROLE_ADMIN` tiene prioridad; `ROLE_USER` y `ROLE_COMPANY` se conservan como compatibilidad legacy hacia el dashboard cliente.

Estos roles representan acceso a la aplicación. El `authGuard` únicamente exige sesión autenticada; esta cápsula no modifica guards ni RBAC.

## E. Organizational roles

No existe contrato proyectado para roles organizacionales como `OWNER`, `MEMBER`, `MANAGER` o `COLLABORATOR`. Son conceptos reservados para un futuro contrato explícito de relaciones organizacionales y no se derivan de `ROLE_*`.

## F. Distinciones

```text
Organization != User
User != OrganizationMember
Owner != OrganizationMember
AuthenticationRole != OrganizationRole
Organization != Client
```

Modelo objetivo, aún no proyectado por HTTP:

```text
Organization
└── Relationships
    ├── Member
    ├── Client
    ├── Collaborator
    └── futuras
```

Client y Collaborator quedan fuera de C01.

## Matriz de decisión

| Concepto | Estado actual | Semántica objetivo | Contrato | Decisión |
| --- | --- | --- | --- | --- |
| Organization | implementado | contexto operacional | real | conservar/refinar |
| Owner | parcial | ownership | campos owner | conservar |
| OrganizationMember | no proyectado | pertenencia explícita | sin HTTP confirmado | bloquear |
| User | implementado | identidad | auth/user lookup | conservar |
| Authentication Role | implementado | acceso aplicación | auth | conservar |
| Organization Role | no proyectado | responsabilidad contextual | sin contrato | reservar |

## Confusiones legacy y decisión aplicada

- El formulario de creación antes mostraba `ownerUserId` sin explicar su relación; ahora especifica que es ownership opcional y que no crea membresía.
- El detalle antes mostraba labels técnicos de owner; ahora los identifica como responsable (owner).
- `externalMembershipId` se mantiene separado como referencia comercial externa de una activación; no se interpreta como relación OrganizationMember.

Riesgo residual: CORE debe exponer un DTO y operaciones HTTP explícitas de `OrganizationMember` antes de que Interface pueda proyectar miembros o roles organizacionales.
