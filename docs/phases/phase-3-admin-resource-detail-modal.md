# EVAAS Interface · Phase 3 admin resource detail modal

Fecha: 2026-06-29

## Problema

La seccion `Recursos asociados` de `/dashboard/admin/organizations/:id` mostraba todos los campos de cada Resource directamente en la lista. Con recursos reales como `EVAAS Backend Repository`, `EVAAS Operations Dashboard`, `EVAAS Workflow` y `Landing Espacios Virtuales LAT`, la vista quedaba saturada.

## Decision

Se cambio la experiencia a:

```txt
lista compacta de recursos
-> Ver detalle
-> modal read-only con informacion completa
```

No se cambia el contrato. La pantalla sigue usando:

```http
GET /admin/access/organizations/{organizationId}/resources
```

El modal abre con el objeto Resource ya cargado en la lista. No se llama `GET /admin/resources/{id}`.

## Lista compacta

Cada recurso muestra solo:

- `name`
- `key` o `resourceKey`
- `type`
- `status`
- `visibility`
- accion `Ver detalle`
- enlace `Abrir` si existe `url`, `operationalUrl` o equivalente cargado

## Modal de detalle

El modal local muestra campos existentes del Resource:

- `id`
- `name`
- `key` / `resourceKey`
- `type`
- `toolAccessId`
- `organizationId`
- `organizationName`
- `status`
- `visibility`
- `url`
- `operationalUrl`
- `createdAt`
- `updatedAt`
- `metadataJson` o metadata/config recibida

`metadataJson` se muestra en bloque read-only formateado si es JSON valido. Si no es JSON valido, se muestra como texto. No se ejecuta ni interpreta metadata.

## Mantencion de creacion

El formulario `Crear recurso` no cambia su contrato ni sus reglas:

- `organizationId` viene desde ruta;
- `toolAccessId` se selecciona desde ToolAccess reales;
- `metadataJson` se valida antes de enviar;
- despues de crear, se refresca la lista de recursos.

## Fuera de alcance

- edicion de Resource;
- eliminacion de Resource;
- ruta full page de Resource;
- `GET /admin/resources/{id}`;
- provisionamiento automatico;
- workers;
- secretos;
- billing;
- Program;
- Phase.

## Validacion manual

En:

```txt
/dashboard/admin/organizations/1
```

Confirmar:

- la seccion `Recursos asociados` usa lista compacta;
- no se pierde ningun recurso real;
- cada recurso tiene `Ver detalle`;
- el modal muestra la informacion completa;
- `Abrir` usa enlace externo seguro;
- `metadataJson` aparece de forma segura;
- crear recurso sigue funcionando;
- no hay datos falsos.
