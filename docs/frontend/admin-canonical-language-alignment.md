# Alineación de lenguaje canónico Admin

Fecha: 2026-08-29

## EVW-UI-H01-A01

Angular proyecta contratos expuestos por CORE; no crea autoridad ni fusiona contratos de transición.

| Concepto | Semántica en Interface | Fuente o condición |
| --- | --- | --- |
| Instrument | Catálogo canónico de capacidades reutilizables. | `GET /admin/instruments` |
| InstrumentAccess | Autorización canónica entre una organización y un Instrument. | Requiere `organizationRef` UUID para `GET /admin/organizations/{organizationRef}/instrument-access` |
| ToolAccess | Contrato legacy aún operativo en el detalle de organización. | `GET /admin/access/organizations/{id}/tool-access` con `id` Long |
| Resource | Activo operacional. No es Instrument, Artifact ni Service. | `GET /admin/access/organizations/{id}/resources` |
| Service | Unidad operacional de una organización. | Pendiente de auditoría HTTP administrativa |
| Artifact | Artefacto de un Service con versión y provenance. | Pendiente de auditoría HTTP administrativa |

## Máscara de presentación

| Clave canónica | Etiqueta UI | Arquetipo |
| --- | --- | --- |
| `LIORA` | Comunicador | Comunicación |

La máscara de presentación no reemplaza la clave: en Admin se muestran `Comunicador` y `Clave técnica: LIORA` cuando el catálogo expone `LIORA`.

## Reglas de compatibilidad

- `/dashboard/admin/access` se mantiene temporalmente como redirect a `/dashboard/admin/instruments`; una ruta legacy no es autoridad canónica.
- `ToolAccess` no se renombra ni se muestra como `InstrumentAccess`.
- `Organization.id` Long nunca se usa como `organizationRef` UUID.
- La integración de `InstrumentAccess` queda documentada, no activada hasta contar con `organizationRef` real.
- Un Resource solo muestra instrumento asociado con `instrumentKey`, `instrument` o metadata contractual explícita; de lo contrario muestra `Sin clasificar`.
- Interface no llama directamente a LIORA. Toda operación pasa por `ev-ecosystem-api`.

## Estados de colecciones

Las colecciones distinguen `EMPTY` (`200 + []`), `POPULATED`, `NOT_FOUND` (`404`), `UNAUTHORIZED` (`401`), `FORBIDDEN` (`403`) y `CONFLICT` (`409` cuando aplique). Un arreglo vacío no es un error.
