# EVW-UI-H02-L02-C03 · External Systems / Integrations

Fecha de auditoría: 2026-08-30.

## A. ExternalService

`ExternalService` (o `ExternalSystem`) es un sistema, plataforma o proveedor externo al ecosistema EVAAS: por ejemplo Google, OpenAI, DigitalOcean, Mercado Libre, Transbank o PayPal. No es una Integration, Instrument, Resource ni Organization, y no es una entidad hija de una Organization.

Estado actual:

```text
ExternalService = SEMANTIC_DEFINED
ExternalService = HTTP_NOT_CONSUMED
ExternalService = BLOCKED_BY_HTTP_CONTRACT
```

No se encontró `ExternalServiceDto`, `ExternalSystemDto`, servicio ni endpoint `/external-services` o `/external-systems` consumido por Interface.

## B. Integration

`Integration` es el vínculo técnico u operacional entre EVAAS y un ExternalService. Una Organization podrá en el futuro configurar o habilitar esa relación, pero no poseer ontológicamente al sistema externo.

```text
Organization
└── Integration
    └── ExternalService
```

La misma plataforma externa podrá intervenir en varias Integrations de distintas Organizations sin duplicar el proveedor como una entidad por Organization.

Estado actual:

```text
Integration = SEMANTIC_DEFINED
Integration = HTTP_NOT_CONSUMED
Integration = BLOCKED_BY_HTTP_CONTRACT
```

No se encontró `IntegrationDto`, `IntegrationService` ni endpoint canónico `/integrations` consumido como contrato de vínculo técnico. Por ello tampoco hay contrato seguro para configuración, credenciales, scopes, estado, ambiente o referencia de cuenta externa; Interface no debe definirlos ni exponer secretos.

## C. Modelos legacy encontrados

`LEGACY_API.integrations.software` (`GET /integrations/software`) sí existe en el registro Angular, pero su nombre de ruta no lo convierte en Integration canónica.

| Elemento | Uso real observado | Clasificación | Decisión |
| --- | --- | --- | --- |
| `SoftwareService.list()` | búsqueda paginada de `SoftwareItem` y habilitación de crear proyecto | `LEGACY_MODEL` | mantener, no promover |
| `ResourcesService.searchSoftware()` | búsqueda de paquetes software/cloud mediante proxy NPM | `LEGACY_MODEL` | mantener, no promover |
| `ResourcesDashboardComponent` | tabla de tecnología, home URL, NPM y acción Crear proyecto | `LEGACY_UI_OBJECT` | conservar ruta/flujo; copy lo identifica como catálogo legacy |
| `LEGACY_API.project.software` | creación de proyecto/provisionamiento | `LEGACY_MODEL` | no convertir en Integration |

El modelo `SoftwareItem` contiene nombre, versión, enlaces y un `provider?` opcional; no contiene configuración de conexión, Organization, credenciales ni estado de Integration. Por tanto `integrations/software = LEGACY_MODEL + DO_NOT_PROMOTE_TO_CANONICAL`.

## D. Contratos consumidos

| Contrato o modelo | Significado confirmado | No demuestra |
| --- | --- | --- |
| `GET /integrations/software` | catálogo/búsqueda legacy de software o paquetes cloud | Integration con un sistema externo |
| `POST /project/software` | solicitud legacy de proyecto/provisionamiento | vínculo técnico persistente con proveedor |
| `AdminResourceDto` / `/admin/resources` | Resource operacional, con metadata abierta | ExternalService o Integration |
| `AdminInstrumentDto` / `GET /admin/instruments` | capacidad EVAAS especializada | Integration |
| `ExternalCommerceActivationDto` | evento de activación comercial | ExternalService o Integration |

Los imports remotos de Google Fonts son dependencias de presentación de la aplicación; no constituyen una entidad ExternalService ni un contrato Integration de EVAAS.

## E. Uso de `provider`

| Contexto | Valores/evidencia | Clasificación |
| --- | --- | --- |
| `ExternalCommerceActivationDto.provider` | `INTERNAL`, `MANUAL`, `WOOCOMMERCE`, `PAYPAL`, `TRANSBANK` | origen/proveedor escalar de una Activation; no entidad ExternalService |
| `ProvisionRequest.provider` / `ProvisionJob.provider` | `GCP`, `AWS`, `DIGITAL_OCEAN` | proveedor de infraestructura del flujo legacy de provisionamiento |
| `BrokerProvisionDetail.provisioning.cloudProvider` | GCP, AWS, DO/DigitalOcean normalizados | procedencia de infraestructura dentro de provisioning legacy |
| `SoftwareItemRaw.provider?` | campo opcional enlazado a software | metadata legacy ambigua; no Integration ni entidad canónica |
| Resource actual | `AdminResourceDto` abierto y metadata | no hay campo provider contractual establecido; no inferirlo |

Un VPS DigitalOcean puede ser un Resource provisionado, mientras DigitalOcean es conceptualmente un ExternalService y una eventual conexión a su API sería una Integration. La presencia de esos strings no crea ninguna de las dos últimas entidades en CORE.

## F. Distinciones

```text
ExternalService != Integration
ExternalService != Instrument
ExternalService != Resource
ExternalService != Organization

Integration != Instrument
Integration != Resource
Integration != Service
Provider field != ExternalService entity
```

Un Instrument EVAAS puede usar una Integration, y un Service EVAAS puede depender de ella, sin convertirse en el vínculo ni en el sistema externo. Los estados de Activation, Resource, Service o InstrumentAccess no se reutilizan como estados de Integration sin contrato propio.

## G. Brechas CORE demostradas

- No hay catálogo o DTO HTTP consumido para ExternalService/ExternalSystem.
- No hay relación HTTP consumida entre Organization, Integration y ExternalService.
- No hay contrato de configuración, credenciales seguras, scopes, ambiente, estado o cuenta externa de una Integration.
- `provider` sólo aparece como dato contextual de activación o provisionamiento legacy; no hay evidencia para promoverlo a entidad.

La proyección futura permanece bloqueada por contrato. No se crean endpoints, DTOs, modales, conexiones externas desde Angular ni migraciones del modelo legacy.

## Matriz de decisión

| Concepto | Estado actual | Semántica objetivo | Contrato | Decisión |
| --- | --- | --- | --- | --- |
| ExternalService | no proyectado | sistema externo | sin HTTP confirmado | reservar/bloquear |
| Integration | legacy/por auditar | vínculo externo | sin HTTP confirmado | reservar/bloquear |
| `integrations/software` | legacy | modelo heredado | legacy | no promover |
| provider Activation | implementado | dato de origen | Activation DTO | conservar contextual |
| Resource provider | parcial/legacy | procedencia infra | provision metadata | no confundir |

## Copy corregido

La pantalla legacy que consulta `/integrations/software` se rotula ahora **Catálogo legacy de software**. El resultado no se presenta como Resource canónico ni como Integration.
