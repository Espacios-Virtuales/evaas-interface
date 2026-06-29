# EVAAS Interface · Phase 3 admin organization detail consolidation

Fecha: 2026-06-29

## Objetivo

Consolidar `/dashboard/admin/organizations/:id` como consola interna dinamica para operar relaciones reales de una organizacion: resumen, ToolAccess, Resources, estado operacional y placeholders contractuales pendientes.

Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

## Ruta foco

```txt
/dashboard/admin/organizations/:id
```

`organizationId` viene desde la ruta. No existe input editable de `organizationId` y no se hardcodea el caso de validacion manual.

## Contratos consumidos

```http
GET  /admin/access/organizations/{organizationId}
GET  /admin/access/organizations/{organizationId}/tool-access
POST /admin/access/tool-access
GET  /admin/access/organizations/{organizationId}/resources
POST /admin/resources
```

No se consultan activaciones globales para simular una relacion por organizacion.

## Campos mostrados

Resumen de organizacion:

- `id`
- `name`
- `taxId`
- `ownerEmail`
- `ownerUserId`
- `enabled`
- `createdAt`

Accesos habilitados:

- `id`
- `toolKey`
- `toolName`
- `status`
- `grantedAt`
- `revokedAt`
- `userId`
- `userEmail`
- `externalCommerceActivationId`

Recursos asociados se muestran segun el DTO real recibido, incluyendo cuando existan `id`, `name`, `key`, `resourceKey`, `type`, `status`, `visibility`, `toolAccessId`, `url`, fechas y metadata.

Los campos ausentes se muestran de forma sobria como `-`.

## ToolAccess

La creacion usa:

```http
POST /admin/access/tool-access
```

Payload:

```ts
{
  organizationId: number;
  toolKey: string;
  userId?: number;
  externalCommerceActivationId?: number;
}
```

Reglas activas:

- `organizationId` se toma desde la ruta actual.
- `toolKey` es editable.
- `userId` es ingreso manual por ahora.
- `externalCommerceActivationId` es ingreso manual por ahora.
- Despues de crear se refresca `GET /admin/access/organizations/{organizationId}/tool-access`.
- Los ejemplos `EVAAS_ADMIN_OPERATIONS`, `EVAAS_WORKFLOW` y `EVAAS_LANDING_LAT` son solo sugerencias visuales.

## Resource

La creacion usa:

```http
POST /admin/resources
```

Payload:

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

Reglas activas:

- `organizationId` se toma desde la ruta actual.
- `toolAccessId` se selecciona desde ToolAccess reales cargados para la organizacion.
- Si no hay ToolAccess, se informa claramente y se permite enviar sin `toolAccessId` solo si backend lo acepta.
- `metadataJson` se edita como texto JSON.
- Si `metadataJson` no esta vacio, Angular valida que sea JSON valido antes de enviar.
- `metadataJson` se bloquea si contiene indicios de secretos como `password`, `token`, `secret`, `privateKey`, `apiKey` o `credential`.

## Activaciones asociadas

Se mantiene el placeholder:

```txt
Pendiente de contrato backend filtrado por organizacion.
```

Hasta que backend exponga un contrato filtrado por `organizationId`, la pantalla no consulta todas las activaciones ni infiere relaciones en frontend.

## Estados UI

- Carga de organizacion, accesos y recursos.
- Error al cargar detalle.
- Organizacion sin accesos.
- Organizacion sin recursos.
- Guardando ToolAccess.
- Error al crear ToolAccess.
- Guardando Resource.
- Error al crear Resource.
- `metadataJson` invalido.
- Creacion exitosa con refresh posterior.

## Estado operacional

El estado se deriva solo de datos cargados:

- `enabled === true`
- `enabled === false`
- cantidad real de accesos asociados
- cantidad real de recursos asociados
- activaciones activas quedan pendientes mientras no exista contrato filtrado

No hay KPIs, metricas ni datos inventados.

## Validacion manual

Caso base:

```txt
/dashboard/admin/organizations/1
```

Permite validar Organizacion ID 1 - Espacios Virtuales:

- resumen real de la organizacion;
- `organizationId` desde ruta;
- sin input editable de `organizationId`;
- ToolAccess reales;
- asignacion de ToolAccess con `organizationId` automatico;
- Resources reales;
- creacion de Resource asociado a ToolAccess real;
- seleccion de `toolAccessId` desde accesos cargados;
- validacion de `metadataJson`;
- activaciones sin datos falsos si falta contrato filtrado.

## Fuera de alcance

- portal cliente;
- colaborador;
- commerce completo;
- ProductOffering;
- PaymentIntent;
- automatizacion;
- workers;
- Liora;
- multi-tenant;
- Program;
- Phase;
- dashboard cliente;
- admin intakes.
