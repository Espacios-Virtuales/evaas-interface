# EVAAS Interface · Phase 3 admin access overview route

## Razon de la ruta

El sidebar admin tenia preparada la entrada `Accesos`, pero permanecia deshabilitada porque `/dashboard/admin/access` no existia como ruta real dentro del Dashboard Shell.

Se crea una pantalla orientadora para que el acceso visual exista sin prometer una gestion global nueva.

## Decision

Los accesos no se gestionan como entidad aislada en esta fase. La operacion real vive en el detalle de cada organizacion, donde se vinculan:

```txt
Organization -> User -> ToolAccess -> Resource
```

La pantalla `/dashboard/admin/access` explica ese flujo y lleva al administrador hacia organizaciones.

## Ruta final

```txt
/dashboard/admin/access
```

La ruta queda registrada como hija del Dashboard Shell y protegida para:

```txt
ROLE_ADMIN
```

## Sidebar actualizado

El sidebar admin visible queda:

```txt
Organizaciones
Recursos
Accesos
Activaciones
```

`Accesos` apunta a:

```txt
/dashboard/admin/access
```

## Fuera de alcance

- listado global de ToolAccess;
- creacion de ToolAccess fuera de organizacion;
- edicion de permisos;
- revocacion;
- filtros;
- metricas;
- datos mock;
- cards con numeros falsos;
- acceso cliente;
- matriz visual compleja;
- orquesta admin;
- herramientas nuevas.
