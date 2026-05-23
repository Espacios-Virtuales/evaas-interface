# Client Dashboard v0

## Objetivo

`/client` es la primera pantalla visible para clientes EVAAS. Su responsabilidad es observar el contrato del usuario autenticado y mostrar lo que el backend declara disponible.

## Flujo

```txt
Login
-> /client
-> MeService.getMyToolAccess()
-> MeService.getMyResources()
-> Mis herramientas | Mis recursos
```

## Datos consumidos

La pantalla usa únicamente `MeService`:

- `GET /me/tool-access`
- `GET /me/resources`

No usa servicios admin y no crea datos de respaldo falsos.

## Mis herramientas

Se renderiza `MyToolAccessDto` con:

- Organización
- Herramienta
- Estado
- Acceso

`Acceso` se deriva de `grantedAt` o `revokedAt` cuando existen.

## Mis recursos

`MyResourceDto` aún está tipado como contrato abierto. La pantalla intenta mostrar campos seguros y comunes:

- Recurso: `resourceName`, `name`, `displayName`, `resourceKey`, `toolKey` o `id`
- Estado: `status`, `state` o `resourceStatus`
- Configuración base: `baseConfiguration`, `configurationBase`, `baseConfig` o `configBase`
- Acceso: `access`, `accessStatus`, `permission`, `permissions`, `grantedAt`, `assignedAt` o `createdAt`

Si la configuración base no existe o no está clara, se muestra `Pendiente contrato`.

## Estados

- `loading`: consulta `/me/tool-access` y `/me/resources`.
- `error`: falla alguna consulta y permite reintentar.
- `empty`: ambas respuestas son listas vacías.
- `success`: al menos una sección tiene datos; cada sección maneja su vacío local.
