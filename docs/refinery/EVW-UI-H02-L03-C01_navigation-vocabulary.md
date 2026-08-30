# EVW-UI-H02-L03-C01 · Navegación y vocabulario

Fecha de auditoría: 2026-08-30.

## A. Inventario de rutas

| Ruta | Label visible / título | Clasificación | Significado actual | Estado |
| --- | --- | --- | --- | --- |
| `/dashboard/admin` | Administración EVAAS | `OPERATIONAL_CONTEXT` | entrada al contexto administrativo | actual |
| `/dashboard/admin/organizations` | Organizaciones | `CANONICAL_DOMAIN` | Organization como contexto operacional | canónico |
| `/dashboard/admin/organizations/:id` | Detalle de organización | `OPERATIONAL_CONTEXT` | detalle del contexto Organization | actual |
| `/dashboard/admin/resources` | Recursos | `CANONICAL_DOMAIN` | activos, infraestructura y capacidades operacionales | canónico |
| `/dashboard/admin/instruments` | Instrumentos | `CANONICAL_DOMAIN` | capacidades especializadas EVAAS | canónico |
| `/dashboard/admin/instruments/comunicador` | Comunicador / `LIORA` | `OPERATIONAL_CONTEXT` | máscara funcional de un Instrument canónico | actual |
| `/dashboard/admin/activations` | Activaciones | `CANONICAL_DOMAIN` | historia de materialización comercial u operacional | canónico |
| `/dashboard/admin/activations/:id` | Detalle de activación | `OPERATIONAL_CONTEXT` | trazabilidad de una Activation | actual |
| `/dashboard/admin/access` | sin label propio | `LEGACY_COMPATIBILITY` | redirect a Instrumentos | conservado |
| `/dashboard/client` | Dashboard Cliente | `UI_PERSONA` | experiencia de aplicación basada en `/me/*` | actual/legacy |
| `/client` | sin label propio | `LEGACY_COMPATIBILITY` | redirect a `/dashboard/client` | conservado |
| `/dashboard/resources` | Catálogo legacy de software | `LEGACY_COMPATIBILITY` | UI legacy para catálogo/software y creación de proyecto | conservado |
| `/dashboard/projects` | Proyectos | `UNKNOWN` | flujo legacy fuera de los dominios admin auditados | no modificado |
| `/dashboard` | Panel | `LEGACY_COMPATIBILITY` | home legacy con datos placeholder | no modificado |

`GET /integrations/software` no es una ruta Angular navegable: es un endpoint consumido por la UI legacy anterior. Se clasifica como `LEGACY_MODEL`, no como Integration, ExternalService, Resource canónico ni Artifact.

## B. Inventario de labels

La barra lateral administrativa contiene, en este orden: **Organizaciones**, **Recursos**, **Instrumentos** y **Activaciones**. Sus links coinciden con los cuatro dominios canónicos que Interface consume y no incorpora secciones vacías para Services, Artifacts, Deployments, Members, Clients, Collaborators, Integrations o ExternalServices.

| Entrada | Clasificación | Significado | Acción |
| --- | --- | --- | --- |
| Organizaciones | `CANONICAL_DOMAIN` | contexto operacional | conservar |
| Recursos | `CANONICAL_DOMAIN` | capacidad / infraestructura | refinar copy |
| Instrumentos | `CANONICAL_DOMAIN` | capacidad especializada | conservar |
| Activaciones | `CANONICAL_DOMAIN` | proceso operacional | refinar copy |
| Access legacy | `LEGACY_COMPATIBILITY` | redirect | conservar temporalmente |
| Client Dashboard | `UI_PERSONA` | experiencia UI | conservar |
| Software legacy | `LEGACY_MODEL` | catálogo heredado | conservar identificado |

No se encontraron breadcrumbs formales. Los enlaces de retorno de las pantallas administrativas constituyen la navegación contextual y ahora usan **Volver a Administración**.

## C. Clasificación y redirects

| Source route | Target | Motivo | Estado |
| --- | --- | --- | --- |
| `/dashboard/admin/access` | `/dashboard/admin/instruments` | la ruta Access no es dominio principal; Instrumentos es la proyección canónica | `LEGACY_COMPATIBILITY` |
| `/client` | `/dashboard/client` | mantener compatibilidad de entrada a la experiencia UI | `LEGACY_COMPATIBILITY` |

Los redirects se mantienen sin modificar. No hay transformación de roles, visibilidad o RBAC en esta cápsula.

## D. Cambios realizados

- El overview se llama **Administración EVAAS**, un contexto operativo y no otro dominio.
- **Organizaciones** se describe como contextos operacionales, sin confundirlas con Clients.
- **Recursos** se describe como activos, infraestructura y capacidades de operación; no como Services, software, Integrations, Artifacts ni Instruments.
- **Activaciones** se describe como historia de materialización, no como inventario de productos, recursos o servicios activos.
- Los retornos administrativos abandonan el término ambiguo `overview` y usan **Administración**.

El label **Catálogo legacy de software** se conserva para la UI que consume el endpoint legacy `integrations/software`.

## E. Elementos no modificados

- Sidebar: ya refleja los cuatro dominios operativos en el orden semántico esperado; no se reorganizó por estética.
- `/dashboard/admin/access`: se conserva como redirect de compatibilidad; su eliminación corresponde a C03.
- `/dashboard/client`: permanece como ruta y label de `UI_PERSONA`; no prueba una entidad o relación Client.
- Instrumentos / LIORA: se conserva la separación entre label funcional **Comunicador** y clave técnica `LIORA`; no se crean dos Instruments.
- Organization Detail, flujos legacy de Projects y home `/dashboard`: fuera de alcance de C01.

## F. Navegación futura bloqueada

Los conceptos siguientes no obtienen navegación principal porque falta proyección contractual y caso operativo consumible:

```text
Services
Artifacts
Deployments
Members
Clients
Collaborators
Integrations
ExternalServices
```

```text
Concepto semántico + contrato consumible + caso de operación
= candidato a navegación
```

La existencia semántica de un concepto no equivale a una implementación navegable.

## Riesgo residual

Persisten rutas y modelos legacy (`/dashboard/client`, `/dashboard/admin/access`, `/dashboard/resources`, `/dashboard/projects` e `integrations/software`) por compatibilidad. Su eliminación o migración requiere evidencia adicional y corresponde a C03; no implica que sus conceptos se vuelvan canónicos por copy.
