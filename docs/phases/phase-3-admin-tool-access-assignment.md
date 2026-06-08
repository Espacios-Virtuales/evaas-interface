# Phase 3 - Admin tool access assignment

## Objetivo

Agregar el flujo minimo para asignar accesos manuales desde el detalle de una organizacion en Dashboard Admin v0.

La decision funcional activa es que los accesos no flotan solos: nacen vinculados a una organizacion. Por eso el flujo vive en:

```txt
/dashboard/admin/organizations/:id
```

## Endpoint usado

```http
POST /admin/access/tool-access
```

La API productiva esperada es:

```txt
https://api.evaas.lat
```

La request usa `Authorization: Bearer {token}` mediante el interceptor HTTP global solo cuando existe un token valido.

## Payload enviado

```json
{
  "organizationId": 456,
  "toolKey": "FARQBIM_DASHBOARD",
  "userId": 123,
  "externalCommerceActivationId": 789
}
```

`organizationId` se toma desde la ruta actual y no se permite editarlo manualmente.

## Campos

- `toolKey`: requerido en frontend. Por ahora es input manual.
- `userId`: input numerico manual opcional en frontend hasta confirmar si backend lo exige siempre.
- `externalCommerceActivationId`: input numerico manual opcional en frontend hasta confirmar si backend lo exige para algun tipo de acceso.

La UI muestra ejemplos sugeridos de `toolKey`, pero no los trata como catalogo cerrado porque backend aun no expone un endpoint de herramientas.

## Estados UI

- `idle`: formulario cerrado y lista visible.
- `loading`: submit en curso con boton deshabilitado.
- `success`: al crear, se muestra confirmacion simple.
- `error`: rechazo de backend con mensaje util y sin stacktrace.
- `validation`: errores locales para `toolKey` requerido y campos numericos invalidos.

## Comportamiento post-creacion

Cuando el POST responde correctamente:

1. Se cierra el formulario.
2. Se refresca `GET /admin/access/organizations/{id}/tool-access`.
3. La seccion Accesos muestra la lista real actualizada.

No se agregan datos simulados.

## Limitaciones actuales

- No hay revocacion.
- No hay edicion de accesos.
- No hay catalogo real de tools.
- No hay busqueda ni seleccion de usuarios.
- No hay filtrado de activaciones por organizacion.
- No hay automatizacion, billing, Program ni Phase.
- No se implementa grilla global de accesos.

## Pendientes backend

- Catalogo de `toolKey`.
- Busqueda/seleccion de usuario cliente.
- Contrato exacto de obligatoriedad para `userId`.
- Relacion esperada con activaciones y obligatoriedad de `externalCommerceActivationId`.
- Endpoint futuro de revocacion.
