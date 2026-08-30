# EVW-UI-H02-L01-C01 · Refinería Service / Resource

Fecha: 2026-08-29

## A. Estado actual

La UI Admin proyecta `Resource` como inventario operacional: activos, infraestructura y capacidades disponibles para sostener la operación. No proyecta un dominio `Service` ni un dominio `Artifact`.

`AdminResourceDto` se mantiene abierto porque el contrato runtime puede exponer campos variables. La Interface lee y/o envía evidencia existente: `id`, `organizationId`, `toolAccessId`, `type`, `key`/`resourceKey`, `name`, `url`/`operationalUrl`, `status`, `visibility`, `metadataJson`/`metadata`, `createdAt` y `updatedAt`. No contiene ni infiere `serviceId`, `artifactId` o `deploymentId`.

## B. Clasificación legacy encontrada

| Elemento | Clasificación actual | Clasificación objetivo | Evidencia | Acción |
| --- | --- | --- | --- | --- |
| VPS | `Resource` | Resource de infraestructura | `suggestedResourceTypes` y línea base incluyen `VPS` | Conservar |
| WordPress operativo | `Resource` | Resource/capacidad operable | tipo `WORDPRESS` en UI y línea base | Conservar |
| API habilitada | `Resource` | Resource/capacidad operable | tipo `API` y campo `url` | Conservar |
| Repository | `Resource` legacy | Resource actual; posible Artifact solo con contrato/provenance | tipo `REPOSITORY`; no hay DTO/HTTP Artifact | Identificar ambigüedad, no migrar |
| Dashboard construido | `Resource` legacy | Resource actual; posible Artifact según provenance futura | tipo `DASHBOARD`; ejemplo `Dashboard FarqBIM` | Identificar ambigüedad, no migrar |
| Worker desplegado | `Resource` legacy | Resource actual; posible Deployment futuro | tipo `WORKER`; no hay modelo Deployment | Identificar ambigüedad, no migrar |
| Hosting administrado | No proyectado como entidad | Service (prestación) | No existe campo, DTO ni endpoint Service en Interface | Documentar como concepto sin contrato |

La tabla no reclasifica datos productivos: los tipos `REPOSITORY`, `DASHBOARD` y `WORKER` permanecen como Resource mientras sean la única evidencia recibida. No se infiere Artifact ni Deployment desde su nombre.

## C. Contratos disponibles

| Concepto | Contrato Interface comprobado |
| --- | --- |
| Resource por Organization | `GET /admin/access/organizations/{id}/resources` |
| Resource global | `GET /admin/resources` |
| Resource global por ID | `GET /admin/resources/{id}` |
| Crear Resource | `POST /admin/resources` |
| Service | Sin DTO, servicio ni endpoint HTTP consumido |
| Artifact | Sin DTO, servicio ni endpoint HTTP consumido |

La evidencia está en `AdminAccessService`, `AdminResourceService`, `API.adminAccess.organizationResources`, `API.adminResources` y `CreateAdminResourcePayload`.

## D. Deudas contractuales

- CORE debe exponer un contrato HTTP administrativo de Service antes de que Interface proyecte prestaciones como hosting administrado o continuidad operacional.
- CORE debe exponer un contrato HTTP administrativo de Artifact, con versión y provenance, antes de reclasificar repositorios o dashboards construidos.
- CORE debe definir Deployment si un Worker desplegado deja de ser un Resource operativo y requiere ciclo de despliegue propio.

No se crean `/admin/services`, `/admin/artifacts` ni relaciones Service ↔ Resource sin dicha evidencia.

## E. Decisión

- `UI_LANGUAGE_REFINED`: Recursos globales y por Organization describen activos, infraestructura y capacidades; ya no sugieren que Resource sea Service, Artifact o Instrument.
- `LEGACY_SEMANTICS_IDENTIFIED`: `REPOSITORY`, `DASHBOARD` y `WORKER` son clasificaciones Resource legacy potencialmente ambiguas.
- `CORE_CONTRACT_REQUIRED`: Service, Artifact y Deployment son conceptos semánticos sin contrato consumible en Interface.

```txt
Service = prestación entregada, administrada o sostenida para una Organization.
Resource = activo, infraestructura o capacidad disponible para operar.
Service != Resource
Service != Artifact
Service != Instrument
Resource != Artifact
Resource != Instrument
```
