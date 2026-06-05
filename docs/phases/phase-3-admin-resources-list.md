# EVAAS Interface · Phase 3 admin resources list

Fecha: 2026-06-05

## Objetivo

Agregar una vista global de recursos dentro del Dashboard Admin v0 para observar el inventario operacional del ecosistema EVAAS.

## Endpoint usado

```http
GET /admin/resources
```

En produccion se resuelve contra:

```txt
https://api.evaas.lat
```

La autenticacion se mantiene mediante el interceptor HTTP existente, que envia:

```http
Authorization: Bearer {token}
```

## Ruta creada

```txt
/dashboard/admin/resources
```

La ruta renderiza dentro del Dashboard Shell existente. No se agrego layout, sidebar ni navegacion duplicada.

## Campos renderizados

La tabla inicial muestra solo campos disponibles desde el contrato real recibido:

- `id`
- `name`
- `key` o `resourceKey`
- `type`
- `status`
- `visibility`
- `organizationName` u `organizationId`
- `url`
- `operationalUrl`

La accion visual `Ver detalle` apunta a la ruta futura `/dashboard/admin/resources/:id` cuando el recurso entrega `id`.

## Estados UI

- `loading`: muestra carga de recursos.
- `error`: muestra error y permite reintentar.
- `empty`: muestra `No hay recursos registrados todavía.`
- `success`: muestra la tabla con recursos reales.

## Fuera de alcance

- No se implemento `GET /admin/resources/{id}`.
- No se implemento creacion de recursos.
- No se implemento edicion de recursos.
- No se implemento eliminacion de recursos.
- No se agregaron formularios.
- No se agrego provision automatica.
- No se agregaron workers.
- No se agrego billing.
- No se agrego automatizacion.
- No se agregaron dashboards complejos.
- No se agregaron graficos ni metricas falsas.

## Validaciones

Ejecutar:

```bash
nvm use 20.19.5
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
npm run build
```

Resultado esperado:

- TypeScript app pasa.
- TypeScript spec pasa.
- Build de produccion pasa.
