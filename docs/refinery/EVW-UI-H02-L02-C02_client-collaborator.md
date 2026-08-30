# EVW-UI-H02-L02-C02 · Client / Collaborator

Fecha de auditoría: 2026-08-30.

## A. Client

`Client` es una relación comercial u operacional de una persona o entidad con una `Organization`. No es una identidad, un rol de autenticación, una Organization, una membresía ni ownership.

Una relación Client futura deberá estar asociada a una identidad y a una Organization, e informar al menos el tipo de relación y su vigencia/estado cuando CORE lo exponga.

Estado actual:

```text
Client relationship = SEMANTIC_DEFINED
Client relationship = HTTP_NOT_CONSUMED
Client relationship = BLOCKED_BY_HTTP_CONTRACT
```

No se encontró `ClientDto`, `ClientModel`, `clientId`, perfil HTTP de cliente ni endpoint relacional de Client en Interface.

## B. Collaborator

`Collaborator` es una relación de trabajo, contribución o participación operacional de una persona con una `Organization`. Puede describir profesionales, proveedores de servicio, docentes, músicos, desarrolladores, asesores o partners operacionales sin crear una identidad distinta para cada función.

Estado actual:

```text
Collaborator = SEMANTIC_DEFINED
Collaborator = HTTP_NOT_CONSUMED
Collaborator = BLOCKED_BY_HTTP_CONTRACT
```

No se encontró `CollaboratorDto`, `collaboratorId`, colección de collaborators, servicio ni endpoint HTTP de colaboración organizacional. La referencia documental a `ROLE_COLLABORATOR` está marcada como futura y no aparece en el enum ni en el routing operativo.

## C. Roles actuales

`ROLE_CLIENT`, `ROLE_USER` y `ROLE_COMPANY` son `ApplicationAuthenticationRole`. Angular los recibe desde `role[].roleEnum`, los almacena en `UserSession.roles` y los usa en `dashboardRouteForSession()` para dirigir a `/dashboard/client`. Las rutas declaran esos roles en sus metadatos; el `authGuard` actual solo verifica que exista sesión, sin crear una relación organizacional.

`ROLE_COMPANY` permanece como rol de aplicación legacy compatible con el destino client. Su nombre puede inducir la deuda semántica de confundirlo con Organization, pero Interface no lo usa como entidad Organization ni debe convertirlo en una.

```text
ROLE_CLIENT != Client relationship
ROLE_USER != Collaborator relationship
ROLE_COMPANY != Organization
```

## D. Uso de `client` en UI

| Aparición | Clasificación | Evidencia / decisión |
| --- | --- | --- |
| `/dashboard/client` y `/client` | `UI_PERSONA` / routing | `/client` es un redirect de compatibilidad; el dashboard muestra datos de `/me/*`. |
| `ClientDashboardComponent` | `UI_PERSONA` | Carga ToolAccess y Resources de la sesión actual; no carga una entidad Client. |
| `ROLE_CLIENT` | `AUTH_ROLE` | Selecciona experiencia de aplicación junto a `ROLE_USER` y `ROLE_COMPANY`. |
| `clientType`, `clientRut` del intake | `UNKNOWN` | Son atributos de intake/onboarding; no incluyen Organization ni prueban una relación Client. |
| referencias históricas a “cliente” | `LEGACY_NAMING` | Documentación previa y etiquetas de experiencia, sin contrato relacional canónico. |

`Client Dashboard` no prueba la existencia de una entidad Client canónica. Su fuente real es `GET /me/tool-access` y `GET /me/resources`, contratos de acceso/recursos de la identidad autenticada.

## E. Contratos HTTP

Los contratos relacionados que Interface consume son:

| Contrato | Qué representa | No representa |
| --- | --- | --- |
| `POST /auth/login` / refresh | identidad autenticada, roles y privilegios de aplicación | Client o Collaborator organizacional |
| `GET /me/tool-access` | accesos a herramientas de la identidad actual, con `organizationId` / `organizationName` | Member, Client o Collaborator |
| `GET /me/resources` | recursos visibles para la identidad actual | relación Client o Collaborator |
| `GET /admin/users/by-email` | lookup administrativo de User | tipo de relación con Organization |
| intake de onboarding | datos declarativos de una solicitud | Client relationship persistente |

Una Activation contiene `buyerEmail`, pero ese evento comercial no prueba una relación `CLIENT` permanente. Tampoco se deriva Client desde `ownerUserId`, `ownerEmail`, ToolAccess o Activation.

## F. Distinciones

```text
User != Client
User != Collaborator
Person != Relationship

Client != Member
Collaborator != Member
Client != Owner
Collaborator != Owner

ROLE_CLIENT != Client relationship
ROLE_USER != Collaborator relationship
```

Una identidad puede sostener varias relaciones, cada una dependiente de su contexto Organization:

```text
User / Person
└── Relationship with Organization
    ├── MEMBER
    ├── CLIENT
    ├── COLLABORATOR
    └── futuras relaciones
```

Relationship y Permission son dimensiones distintas: un Collaborator futuro podría no tener acceso a Interface, y `ROLE_USER` no demuestra que una persona sea Collaborator. Un Client puede consumir Services, pero `Client != Service`; una Activation puede originarse en una condición comercial, pero `Activation != Client`.

## G. Brechas CORE demostradas

- No hay contrato HTTP consumido para asociar una identidad a una Organization como Client.
- No hay contrato HTTP consumido para asociar una identidad a una Organization como Collaborator.
- No hay estado, vigencia, historial ni rol contextual de esas relaciones.
- No hay evidencia para duplicar User en `ClientPerson`, `CollaboratorPerson` o estructuras equivalentes.

La proyección queda bloqueada hasta que CORE exponga una relación organizacional explícita. No se crean endpoints, DTOs, tablas, rutas ni modales por inferencia.

## Matriz de decisión

| Concepto | Estado actual | Semántica objetivo | Contrato | Decisión |
| --- | --- | --- | --- | --- |
| User | implementado | identidad | real | conservar |
| ROLE_CLIENT | implementado | rol de aplicación | auth | conservar |
| Client relationship | no proyectado | relación comercial | sin HTTP confirmado | reservar/bloquear |
| Collaborator | no proyectado | relación de contribución | sin HTTP confirmado | reservar/bloquear |
| Client Dashboard | implementado | experiencia UI | routing + `/me/*` | no confundir con dominio |
| ROLE_COMPANY | implementado | rol app | auth | no convertir en Organization |

## Copy corregido

El estado vacío de Client Dashboard ya no afirma que los accesos correspondan a “tu organización”. Ahora sólo indica que aparecerán cuando el backend entregue los accesos de la identidad actual, sin inferir Membership, Client o Collaborator.
