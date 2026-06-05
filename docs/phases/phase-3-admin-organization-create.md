# EVAAS Interface · Phase 3 admin organization create

Fecha: 2026-06-05

## Objetivo

Agregar flujo minimo de creacion manual de organizaciones desde `/dashboard/admin/organizations` dentro del Dashboard Admin v0.

La pantalla mantiene el rol de centro operacional: crea la entidad base y luego permite observar su universo mediante el detalle existente.

## Endpoint usado

```http
POST /admin/access/organizations
```

En produccion se resuelve contra:

```txt
https://api.evaas.lat
```

La autenticacion se mantiene mediante el interceptor HTTP existente, que envia `Authorization: Bearer {token}` solo cuando hay token utilizable y la ruta no es publica.

## Campos enviados

Payload minimo:

```txt
name
taxId
ownerUserId
```

Reglas aplicadas:

- `name` es requerido y se envia recortado.
- `taxId` es opcional y solo se envia si viene con valor.
- `ownerUserId` es opcional y solo se envia si el operador lo ingresa.
- `ownerUserId` pendiente de definicion operativa.

## Estados UI

- `idle`: modal abierto sin operacion activa.
- `loading`: envio de creacion en curso.
- `success`: organizacion creada correctamente.
- `error`: el backend o la red rechazaron la creacion.
- `validation`: el formulario tiene campos requeridos pendientes.

## Validaciones

- `name` requerido.
- No se agregan validaciones frontend para reglas de negocio no definidas por contrato.

## Comportamiento post-creacion

- Al crear exitosamente se cierra el modal.
- Se refresca el listado de organizaciones.
- Si el backend retorna `id`, se navega a `/dashboard/admin/organizations/:id`.
- Si el backend no retorna `id`, se conserva el listado refrescado.

## Limitaciones actuales

- No se edita organizacion.
- No se elimina organizacion.
- No se asignan accesos.
- No se crean recursos.
- No se conectan activaciones.
- No se implementa billing.
- No se implementa onboarding.
- No se crean usuarios internos.
- No se automatiza provision.

## Pendientes backend

- Definir operativamente si `ownerUserId` sera obligatorio, opcional o derivado por backend.
- Definir validaciones canonicas para `taxId` si el backend requiere formato especifico.
