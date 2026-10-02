# EVW-CORE-H08-L10-C01 · Detalle operacional administrativo de Resource

## Auditoría de lectura

La única lectura utilizada por la vista es `AdminResourceService.getResources()`, que consume `GET /admin/resources` y devuelve `AdminResourceDto[]`.

La colección ya contiene los campos suficientes para el detalle administrativo mínimo: `id`, `name`, `key`, `type`, `status`, `visibility`, `createdAt` y `updatedAt`. Por ello, seleccionar una fila no realiza una solicitud adicional.

## Operación de estado

La única mutación usada es `AdminResourceService.updateResourceStatus(id, { status })`, que consume `PATCH /admin/resources/{id}/status`. La interfaz acepta exclusivamente `PLANNED`, `ACTIVE`, `MAINTENANCE` y `DISABLED`; reemplaza la fila sólo con la respuesta confirmada por backend.

Los valores ausentes de la colección se presentan como ausencia, sin completar datos derivados.
