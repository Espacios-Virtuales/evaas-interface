# EVAAS Interface · Phase 3 admin resource table modal

Fecha: 2026-06-29

## Problema

La seccion `Recursos asociados` dentro de `/dashboard/admin/organizations/:id` seguia ocupando demasiado espacio cuando la organizacion tenia varios recursos reales. La lista compacta anterior mejoro la lectura, pero una tabla simple ordena mejor la comparacion operativa entre recursos.

## Decision

Renderizar Resources como tabla compacta y mantener el detalle profundo en modal read-only.

Contrato de listado mantenido:

```http
GET /admin/access/organizations/{organizationId}/resources
```

No se inventan datos y no se cambia el contrato.

## Campos de tabla

La tabla muestra:

- `Nombre`
- `Clave`
- `Tipo`
- `Estado`
- `Visibilidad`
- `ToolAccess`
- `Acciones`

La accion principal por fila es `Ver detalle`.

La accion de abrir recurso se mueve al modal para mantener la tabla compacta y evitar saturacion visual.

## Modal de detalle

El modal muestra los campos disponibles del objeto Resource ya cargado:

- `id`
- `name`
- `key`
- `resourceKey`
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
- `metadataJson`

`metadataJson` se muestra en bloque read-only, formateado si es JSON valido. Si no es JSON valido, se muestra como texto plano. No se ejecuta ni interpreta.

## Criterio de edicion

No existe contrato real de edicion en `AdminResourceService`; solo existen lectura y creacion:

```http
GET  /admin/resources/{id}
POST /admin/resources
```

Por eso no se implementa formulario de edicion ni mutacion local ficticia. El modal informa:

```txt
Edicion pendiente de contrato backend.
```

## Fuera de alcance

- edicion de Resource sin contrato backend;
- eliminacion de Resource;
- provisionamiento automatico;
- workers;
- secrets;
- billing;
- Program;
- Phase;
- ruta independiente de detalle.

## Validacion manual

En:

```txt
/dashboard/admin/organizations/1
```

Confirmar:

- Resources se muestran en tabla compacta;
- aparecen los recursos reales esperados si backend los retorna;
- cada fila muestra solo datos esenciales;
- `Ver detalle` abre modal;
- el modal muestra toda la informacion disponible;
- URL externa abre con enlace seguro;
- metadata se muestra de forma segura;
- `Crear recurso` sigue funcionando;
- no hay edicion ficticia sin contrato backend.
