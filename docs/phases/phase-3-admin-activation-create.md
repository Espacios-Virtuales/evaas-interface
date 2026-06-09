# EVAAS Interface · Phase 3 admin activation create

Fecha: 2026-06-09

## Objetivo

Agregar un flujo mínimo para crear activaciones comerciales o internas desde `/dashboard/admin/activations`.

## Endpoint usado

```http
POST /admin/commerce/activations
```

En produccion se resuelve contra:

```txt
https://api.evaas.lat
```

La autenticacion se mantiene mediante el interceptor HTTP existente, que envia:

```http
Authorization: Bearer {token}
```

solo cuando existe token valido y la ruta no corresponde a login, refresh u onboarding.

## Payload enviado

Campos requeridos:

- `provider`
- `productCode`
- `buyerEmail`
- `organizationName`
- `status`

Campos opcionales:

- `externalOrderId`
- `externalMembershipId`
- `idempotencyKey`

No se pide `payloadHash` manualmente. Si backend lo vuelve obligatorio para creacion manual, queda como pendiente tecnico porque ese valor no deberia ser responsabilidad operativa del administrador.

## Estados UI

- `idle`: modal abierto sin envio en curso.
- `loading`: envio de activacion en curso.
- `success`: creacion aceptada por backend.
- `error`: backend o red rechazaron la creacion.
- `validation`: faltan campos requeridos o `buyerEmail` no tiene formato de correo.

## Comportamiento post-creacion

Al crear exitosamente:

1. se cierra el modal;
2. se refresca `GET /admin/commerce/activations`;
3. la nueva activacion aparece en la tabla global cuando backend la retorna.

No se navega a detalle aunque backend retorne `id`, porque la vista de detalle de activacion no existe en esta fase.

## Capa neutral/manual

La activacion registra el origen comercial o interno. Angular no decide acceso, no asigna `ToolAccess` y no crea recursos automaticamente. El backend sostiene la ley y procesa continuidad en fases posteriores.

## Fuera de alcance

- No se implemento detalle de activacion.
- No se implemento `PATCH /admin/commerce/activations/{id}/status`.
- No se conectaron pagos reales.
- No se agrego Transbank.
- No se agrego PayPal.
- No se agrego billing.
- No se agregaron ordenes.
- No se agrego `PaymentIntent`.
- No se agrego `PaymentTransaction`.
- No se agrego automatizacion.
- No se asigno `ToolAccess` automaticamente.
- No se creo `Resource` automaticamente.

## Validaciones

- `provider` requerido.
- `productCode` requerido.
- `buyerEmail` requerido.
- `buyerEmail` con formato basico de correo.
- `organizationName` requerido.
- `status` requerido.
