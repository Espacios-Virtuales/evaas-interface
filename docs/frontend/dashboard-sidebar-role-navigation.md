# Dashboard sidebar role navigation

Fecha: 2026-06-29

## Problema

El Dashboard Shell mostraba entradas legacy como resumen general, recursos cliente y proyectos, aunque el Dashboard Admin v0 ya opera sobre rutas admin especificas. Esto generaba navegacion que prometia pantallas fuera del flujo operativo actual.

## Decision

El sidebar usa una configuracion simple de navegacion por rol. El sidebar no decide permisos; solo muestra accesos visuales disponibles para los roles presentes en la sesion. El backend y los guards siguen sosteniendo la ley.

## ROLE_ADMIN

Rutas admin reales visibles hoy:

```txt
/dashboard/admin/organizations
/dashboard/admin/resources
/dashboard/admin/instruments
/dashboard/admin/activations
```

Etiquetas visibles:

```txt
Organizaciones
Recursos
Instrumentos
Activaciones
```

La entrada `Instrumentos` apunta a `/dashboard/admin/instruments` y representa capacidades operables e integraciones disponibles. La ruta legacy `/dashboard/admin/access` queda como compatibilidad transitoria y redirige a Instrumentos.

Los accesos siguen gestionandose desde el detalle de cada organizacion. ToolAccess no vuelve a ser menu principal para usuarios humanos.

## Rutas legacy ocultas

El sidebar admin ya no muestra como navegacion principal:

```txt
/dashboard
/dashboard/resources
/dashboard/projects
/resources
/projects
/objects
```

No se eliminan rutas legacy del router en esta fase.

## Roles futuros

Quedan pendientes configuraciones visibles para:

```txt
ROLE_CLIENT
ROLE_COLLABORATOR
ROLE_USER
```

No se muestran placeholders visuales ni rutas inexistentes para esos roles.

## Fuera de alcance

- nuevas rutas fuera de Instrumentos;
- dashboard cliente;
- dashboard colaborador;
- portal usuario;
- permisos backend;
- guards complejos nuevos;
- eliminacion inmediata de rutas legacy;
- refactor visual grande del shell;
- mobile drawer completo.
