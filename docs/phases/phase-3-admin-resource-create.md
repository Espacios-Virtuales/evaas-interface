# EVAAS Interface · Phase 3 admin resource create

## Objetivo

Agregar el flujo minimo para crear recursos operacionales desde `/dashboard/admin/organizations/:id`, dentro de la seccion `Recursos asociados`.

Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

## Endpoint usado

```http
POST /admin/resources
```

La API productiva es `https://api.evaas.lat`. La peticion usa `Authorization: Bearer {token}` solo por el interceptor de rutas protegidas.

## Payload enviado

```ts
{
  organizationId: number;
  toolAccessId?: number;
  type: string;
  key?: string;
  name: string;
  url?: string;
  status?: string;
  visibility?: string;
  metadataJson?: string;
}
```

`organizationId` viene desde la ruta actual y no se edita manualmente.

## Campos

Requeridos:

- `organizationId`
- `name`
- `type`

Opcionales:

- `toolAccessId`
- `key`
- `url`
- `status`
- `visibility`
- `metadataJson`

Los valores sugeridos de `type` son `API`, `WORDPRESS`, `VPS`, `POWER_BI`, `REPOSITORY`, `DASHBOARD`, `WORKER`, `DOCUMENTATION` y `OTHER`. No se asumen definitivos mientras el backend no exponga catalogo.

Los valores sugeridos de `status` son `PLANNED`, `ACTIVE`, `MAINTENANCE` y `DISABLED`; el valor inicial es `ACTIVE`.

Los valores sugeridos de `visibility` son `ADMIN_ONLY` y `USER_VISIBLE`; el valor inicial es `ADMIN_ONLY`.

## Estados UI

- `idle`: formulario cerrado o listo para editar.
- `loading`: envio del POST y refresco posterior bloquean los botones.
- `success`: se muestra confirmacion al cerrar el formulario.
- `error`: se muestra rechazo del backend o error de red.
- `validation`: se muestran errores locales antes de enviar.

## Comportamiento post-creacion

Cuando el backend confirma la creacion:

1. se cierra el formulario;
2. se refresca `GET /admin/access/organizations/{id}/resources`;
3. el nuevo recurso aparece dentro del detalle de la organizacion cuando el backend lo retorna en la lista.

No se navega a detalle de recurso porque esa vista queda fuera de esta fase.

## Validaciones

- `name` no puede ser vacio ni solo espacios.
- `type` no puede ser vacio.
- `toolAccessId`, si se informa, debe ser numerico positivo.
- `url`, si se informa, debe ser `http` o `https`.
- `metadataJson`, si se informa, debe ser JSON valido.
- `metadataJson` no debe contener claves o textos asociados a secretos, tokens o credenciales.

## Resource como descriptor operacional

Resource representa un descriptor operacional. Puede describir una API, WordPress, VPS, Power BI, repositorio, dashboard, worker o documentacion.

Resource no es un provisionador automatico y no debe contener passwords, tokens, secretos, llaves privadas, payloads de provision, credenciales, datos de tarjeta, logica de billing, broker topics sensibles ni automatizacion compleja.

## Fuera de alcance

- `GET /admin/resources/{id}`.
- Detalle de recurso.
- Edicion de recurso.
- Eliminacion de recurso.
- Provision automatica.
- Workers.
- Broker.
- Billing.
- Gestion de secretos.
- Integracion con VPS.
- Program.
- Phase.
- Metricas.
- Graficos.
