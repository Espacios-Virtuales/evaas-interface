# EVW-UI-H02-L03-C03 · Depuración de semántica legacy

Fecha de auditoría: 2026-08-30.

## A. Principio

`legacy != incorrecto automáticamente`. Se retira sólo código demostrablemente muerto; el resto se conserva, se encapsula y se impide que defina la semántica canónica.

## B. Inventario y clasificación

| Elemento | Uso actual | Contrato / evidencia | Sustituto canónico | Decisión |
| --- | --- | --- | --- | --- |
| `ToolAccess` | acceso de Organization y operaciones de asignar/deshabilitar | `GET /admin/access/organizations/{id}/tool-access`, POST y DELETE reales | `InstrumentAccess` | `KEEP_UNTIL_CANONICAL_REPLACEMENT` |
| `/dashboard/admin/access` | redirect a Instrumentos, sin item de sidebar | routing activo | `/dashboard/admin/instruments` | `KEEP_COMPATIBILITY` |
| `REPOSITORY` | opción de tipo de Resource | `AdminResourceDto` / Resource actual | Artifact/Resource futuro | `KEEP_UNTIL_CANONICAL_REPLACEMENT` |
| `DASHBOARD` | opción de tipo de Resource | `AdminResourceDto` / Resource actual | Artifact/App futuro | `KEEP_UNTIL_CANONICAL_REPLACEMENT` |
| `WORKER` | opción de tipo de Resource | `AdminResourceDto` / Resource actual | App/Deployment futuro | `KEEP_UNTIL_CANONICAL_REPLACEMENT` |
| `objects/` | `/dashboard/projects`, tarjetas, detalle y specs | `ObjectsGridComponent` + `ProjectsService` activos | TBD | `KEEP_UNTIL_CANONICAL_REPLACEMENT` |
| `projects` | ruta `/dashboard/projects`, `ProjectDto`, provisionamiento y specs | `GET/POST/PUT/DELETE` legacy de Projects | TBD | `KEEP_UNTIL_CANONICAL_REPLACEMENT` |
| `integrations/software` | catálogo/búsqueda de software y creación de proyecto | `SoftwareService`, `ResourcesService`, `GET /integrations/software` | sin reemplazo canónico disponible | `KEEP_UNTIL_CANONICAL_REPLACEMENT` |
| `/dashboard/client` | experiencia UI que consulta `/me/*` | `ClientDashboardComponent` + routing | no replacement relacional | `KEEP_COMPATIBILITY` |
| `ROLE_CLIENT` | routing y destino de experiencia client | auth `role[].roleEnum` | no convertir en Client | `KEEP_CURRENT_AUTH_CONTRACT` |
| `ROLE_USER` | compatibilidad de routing client | auth `role[].roleEnum` | no convertir en Collaborator | `KEEP_CURRENT_AUTH_CONTRACT` |
| `ROLE_COMPANY` | compatibilidad de routing client | auth `role[].roleEnum` | no convertir en Organization | `KEEP_CURRENT_AUTH_CONTRACT` |
| `provider` scalar | Activation, provisionamiento, metadata software | DTOs/modelos existentes | no promover a ExternalService | `KEEP_CONTRACT_FIELD` |
| `externalCommerceActivationId` | referencia opcional en ToolAccess payload | `CreateToolAccessPayload` / AdminToolAccessDto | no derivar Activation | `KEEP_CONTRACT_FIELD` |
| `AdminAccessOverviewComponent` | ningún consumidor; route reemplazada por redirect | sin import ni ruta activa | no aplica | `REMOVE` |

Las etiquetas de decisión son documentales; no se convierten en enums de aplicación.

## C. Código eliminado

Se eliminaron únicamente los archivos huérfanos de `AdminAccessOverviewComponent`:

```text
src/app/features/dashboard/admin/access/admin-access-overview.component.ts
src/app/features/dashboard/admin/access/admin-access-overview.component.html
src/app/features/dashboard/admin/access/admin-access-overview.component.scss
```

La eliminación fue segura porque `rg` no encontró imports, rutas activas, tests ni consumidores. `/dashboard/admin/access` permanece en el router como redirect de compatibilidad.

## D. Código legacy conservado

### ToolAccess

Permanece operativo en Organization Detail. No se renombra como `InstrumentAccess`: CORE todavía exige `organizationRef` UUID para el contrato canónico, mientras Interface trabaja con `Organization.id` Long.

### Resource types

`REPOSITORY`, `DASHBOARD` y `WORKER` siguen siendo valores del tipo Resource. Son clasificaciones legacy potencialmente ambiguas, no evidencia automática de Artifact, App o Deployment. No se migran registros ni se cambian payloads.

### `objects/` y `projects`

No son código muerto: `/dashboard/projects` importa `ObjectsGridComponent`, que usa `ProjectsService`; `ProjectDetailsDialog` y `CreateProjectDialog` también consumen el servicio. El modelo Project y sus endpoints legacy se conservan hasta contar con reemplazo contractual.

### `integrations/software`

Sigue siendo una API y UI legacy activa para catálogo de software/provisionamiento. Su nombre no la convierte en una Integration canónica, ExternalService, Resource canónico ni Artifact.

### Client y roles

`/dashboard/client` sigue siendo una experiencia `UI_PERSONA`. `ROLE_CLIENT`, `ROLE_USER` y `ROLE_COMPANY` son contratos actuales de autenticación; sus nombres no prueban relaciones Client, Collaborator u Organization.

### Campos escalares

`provider` conserva su significado contextual: origen de Activation, proveedor de infraestructura o metadata de software. `externalCommerceActivationId` permanece como referencia contractual opcional en ToolAccess; no reconstruye `Organization → Activation` ni una Manifestation canónica.

## E. Rutas legacy

| Ruta | Estado | Motivo |
| --- | --- | --- |
| `/dashboard/admin/access` | `REDIRECT_COMPATIBILITY` | redirige a Instrumentos; puede recibir bookmarks históricos |
| `/dashboard/client` | `ACTIVE_LEGACY` / `UI_PERSONA` | experiencia actual respaldada por `/me/*` |
| `/client` | `REDIRECT_COMPATIBILITY` | entrada histórica a `/dashboard/client` |
| `/dashboard/resources` | `ACTIVE_LEGACY` | catálogo legacy de software/proyectos |
| `/dashboard/projects` | `ACTIVE_LEGACY` | grid de proyectos y detalles |

No se encontraron rutas demostrablemente muertas entre las anteriores. Los redirects se conservan.

## F. Modelos y servicios

| Elemento | Estado | Uso |
| --- | --- | --- |
| `AdminToolAccessDto` / `AdminAccessService` | `ACTIVE_CONTRACT` legacy | acceso por Organization |
| `SoftwareItem` / `SoftwareService` | `LEGACY_ACTIVE` | catálogo de software |
| `ProjectDto` / `ProjectsService` | `LEGACY_ACTIVE` | proyectos y provisionamiento |
| `ResourcesService` / `PackageItem` | `LEGACY_ACTIVE` | proxy de búsqueda de paquetes |
| `ObjectsGridComponent` / `ObjectCardComponent` | `LEGACY_ACTIVE` | UI de proyectos |
| `AdminAccessOverviewComponent` | `DEAD_MODEL` | eliminado en C03 |

## G. Brechas CORE y plan de retiro

El retiro definitivo de ToolAccess, tipos Resource legacy, Projects, `integrations/software` y `/dashboard/client` requiere contratos canónicos consumibles y un reemplazo operacional verificable. Las relaciones `OrganizationMember`, `Client`, `Collaborator`, `Service`, `Artifact`, `InstrumentAccess`, `ExternalService` e `Integration` siguen bloqueadas por CORE y no son sustitutos implementables en esta cápsula.

Plan de retiro futuro, sin ejecutar aquí:

1. Confirmar contrato canónico y consumidores de reemplazo.
2. Migrar o dualizar la proyección, preservando rutas históricas.
3. Verificar ausencia de imports, rutas y dependencias de datos.
4. Retirar sólo después de validar build, tests y compatibilidad.

## Resultado

```text
legacy visible      → identificado
legacy operativo    → encapsulado
legacy muerto       → removido si se demuestra
legacy sin sustituto → conservado
```
