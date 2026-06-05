# EVAAS Interface · Phase 3 admin activations list

Fecha: 2026-06-05

## Objetivo

Agregar una vista global de activaciones dentro del Dashboard Admin v0 para observar el origen comercial o interno de habilitaciones.

## Endpoint usado

```http
GET /admin/commerce/activations
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
/dashboard/admin/activations
```

La ruta renderiza dentro del Dashboard Shell existente. No se agrego layout, sidebar ni navegacion duplicada.

## Campos renderizados

La tabla inicial muestra:

- `id`
- `provider`
- `productCode`
- `buyerEmail`
- `organizationName`
- `status`
- `createdAt`
- `processedAt`

La accion visual `Ver detalle` apunta a la ruta futura `/dashboard/admin/activations/:id`.

## Estados UI

- `loading`: muestra carga de activaciones.
- `error`: muestra error y permite reintentar.
- `empty`: muestra `No hay activaciones registradas todavía.`
- `success`: muestra la tabla con activaciones reales.

## Fuera de alcance

- No se implemento `GET /admin/commerce/activations/{id}`.
- No se implemento `POST /admin/commerce/activations`.
- No se implemento `PATCH /admin/commerce/activations/{id}/status`.
- No se implemento detalle de activacion.
- No se implemento creacion de activacion.
- No se implemento cambio de estado.
- No se agrego billing.
- No se agregaron pasarelas.
- No se agrego Transbank.
- No se agrego PayPal.
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
