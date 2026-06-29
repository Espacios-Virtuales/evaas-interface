# EVAAS Interface · Phase 3 admin organization detail relations

Fecha: 2026-06-29

## Objetivo

Conectar `/dashboard/admin/organizations/:id` con relaciones operativas reales entre organizacion, usuario, ToolAccess, Resource y activaciones comerciales disponibles.

La pantalla no hardcodea IDs ni simula relaciones. `organizationId` viene siempre desde la ruta.

## Contratos usados

```http
GET    /admin/access/organizations/{id}
GET    /admin/access/organizations/{id}/tool-access
GET    /admin/access/organizations/{id}/resources
GET    /admin/users/by-email?email={email}
POST   /admin/access/tool-access
DELETE /admin/access/tool-access/{id}
POST   /admin/resources
GET    /admin/commerce/activations
```

## Busqueda de usuario por email

El formulario `Asignar acceso` reemplaza el `userId` manual por busqueda:

```http
GET /admin/users/by-email?email={email}
```

Reglas:

- se valida formato basico de email antes de buscar;
- se muestra loading, error y resultado;
- si backend retorna usuario, se guarda `selectedUser.id`;
- el payload de ToolAccess usa ese `selectedUser.id`;
- se puede limpiar la seleccion;
- no se permite asignar ToolAccess sin usuario resuelto.

DTO esperado:

```ts
export interface AdminUserLookupDto {
  id: number;
  email: string;
  name?: string;
  enabled?: boolean;
  activated?: boolean;
}
```

## Creacion de ToolAccess

Contrato:

```http
POST /admin/access/tool-access
```

Payload:

```ts
{
  organizationId: organizationIdFromRoute,
  userId: selectedUser.id,
  externalCommerceActivationId?: number,
  toolKey: string
}
```

Despues de crear, se refresca:

```http
GET /admin/access/organizations/{id}/tool-access
```

## Deshabilitacion de ToolAccess

Contrato:

```http
DELETE /admin/access/tool-access/{id}
```

La UI confirma antes de ejecutar y lo rotula como soft disable: no borra historial, solo deshabilita el acceso operativo. Tras exito se refresca la lista real de ToolAccess.

No se implementa edicion de ToolAccess.

## Resource ligado a ToolAccess real

El formulario `Crear recurso` mantiene `organizationId` desde ruta y selecciona `toolAccessId` desde los ToolAccess reales cargados de la organizacion.

Payload:

```ts
{
  organizationId: organizationIdFromRoute,
  toolAccessId?: selectedToolAccessId,
  type,
  key,
  name,
  url,
  status,
  visibility,
  metadataJson
}
```

Reglas:

- `name` requerido;
- `type` requerido;
- `visibility` usa `ADMIN_ONLY` y `USER_VISIBLE`;
- `metadataJson`, si se informa, debe ser JSON valido;
- `metadataJson` se bloquea si contiene indicios de secretos como `password`, `token`, `secret`, `privateKey`, `apiKey` o `credential`;
- si no hay ToolAccess, se mantiene `toolAccessId` opcional y se documenta que backend define si lo permite.

## Activaciones comerciales

Contrato disponible:

```http
GET /admin/commerce/activations
```

Deuda tecnica:

- no existe filtro backend por `organizationId`, `buyerEmail` o `status`;
- la pantalla puede cargar activaciones globales para ayudar al formulario;
- el selector se rotula como vista transitoria filtrada en frontend;
- se filtra client-side por `organizationName`, `buyerEmail` del usuario seleccionado y `status === ACTIVE`;
- no se inventan activaciones ni se afirma vinculo backend si no existe.

## Validacion manual

Ruta:

```txt
/dashboard/admin/organizations/1
```

Validar Organizacion ID 1 - Espacios Virtuales:

- resumen real;
- `organizationId` desde ruta;
- sin input editable de `organizationId`;
- ToolAccess reales;
- busqueda de usuario por email;
- creacion de ToolAccess con `userId` resuelto;
- soft disable de ToolAccess con refresh posterior;
- Resources reales;
- creacion de Resource asociado a ToolAccess real;
- validacion de `metadataJson`;
- activaciones sin datos falsos.

## Fuera de alcance

- portal cliente;
- colaborador;
- commerce completo;
- ProductOffering;
- PaymentIntent;
- workers;
- automatizacion;
- Liora;
- multi-tenant;
- admin intakes;
- dashboard cliente;
- Program;
- Phase;
- Progress.
