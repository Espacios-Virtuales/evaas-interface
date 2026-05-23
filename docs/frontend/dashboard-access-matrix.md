# EVAAS Interface · Dashboard access matrix

Fecha: 2026-05-23

## Regla

Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

Esta matriz describe navegacion visual y routing asistido, no autorizacion sensible.

## Roles conocidos

```txt
ROLE_ADMIN
ROLE_CLIENT
ROLE_USER
ROLE_COMPANY
```

`ROLE_USER` y `ROLE_COMPANY` son compatibilidad legacy.

## Post-login

| Roles de sesion | Destino |
| --- | --- |
| contiene `ROLE_ADMIN` | `/dashboard/admin` |
| contiene `ROLE_CLIENT` | `/dashboard/client` |
| contiene `ROLE_USER` | `/dashboard/client` |
| contiene `ROLE_COMPANY` | `/dashboard/client` |
| sin rol conocido | `/dashboard/client` |

Si hay multiples roles, `ROLE_ADMIN` tiene prioridad.

## Rutas

| Ruta | Estado | Roles visuales esperados | Observacion |
| --- | --- | --- | --- |
| `/dashboard` | legacy | usuario autenticado | Home placeholder legacy. |
| `/dashboard/client` | activo minimo | `ROLE_CLIENT`, `ROLE_USER`, `ROLE_COMPANY` | Observa `/me/*`. |
| `/dashboard/admin` | placeholder | `ROLE_ADMIN` | No conecta endpoints admin. |
| `/dashboard/resources` | legacy | hoy visible en nav con `ROLE_USER` | Ruta sigue accesible si hay sesion. |
| `/dashboard/projects` | legacy | usuario autenticado | Visible en nav sin condicion de rol. |
| `/client` | compatibilidad | usuario autenticado | Redirige a `/dashboard/client`. |

## Nav actual

| Item | Ruta | Visibilidad actual |
| --- | --- | --- |
| Resumen | `/dashboard` | todos los autenticados |
| Recursos | `/dashboard/resources` | `*hasRole="'ROLE_USER'"` |
| Proyectos | `/dashboard/projects` | todos los autenticados |

No hay item visible para `/dashboard/client` ni `/dashboard/admin` todavia.

## Acciones actuales por rol

| Accion | Ubicacion | Visibilidad actual | Riesgo |
| --- | --- | --- | --- |
| Ver resumen legacy | `/dashboard` | autenticado | Puede confundir client/admin. |
| Ver recursos legacy | nav resources | `ROLE_USER` | Puede ocultarse a `ROLE_CLIENT`. |
| Crear proyecto desde recurso | resources legacy | depende de `r.actions?.createProject` | Accion legacy, backend debe validar. |
| Ver proyecto | object card | autenticado si llega a ruta | Backend debe validar. |
| Eliminar proyecto | object card/dialog | autenticado si llega a ruta | Accion sensible en legacy. |
| Reintentar client load | client | usuario en client | Solo reconsulta `/me/*`. |
| Logout | shell modal | autenticado | Global. |

## Si no tiene permisos

Estado actual:

- `authGuard` solo valida sesion.
- No existe `RoleGuard`.
- `route.data.roles` esta documentado, pero no se aplica.
- Errores 401/419 van al refresh/logout flow.
- 403 se muestra por `errorInterceptor` con snackbar.

Recomendacion:

- Mantener backend como autoridad.
- No agregar bloqueo frontend por rol hasta definir fallback y evitar loops.
- Para UX futura, agregar state visual `unauthorized` dentro de client/admin solo cuando exista contrato claro.

## Rutas legacy

Legacy que permanece:

- `/dashboard`;
- `/dashboard/resources`;
- `/dashboard/projects`.

Tratamiento recomendado:

- mantener accesibles;
- sacarlas del nav principal client/admin en una fase posterior;
- no borrarlas;
- no convertir sus componentes en shared sin desacoplar negocio.

## Matriz objetivo visual

| Rol | Landing | Nav principal futuro | Legacy |
| --- | --- | --- | --- |
| `ROLE_ADMIN` | `/dashboard/admin` | Admin, cuenta/logout | legacy oculto del nav principal |
| `ROLE_CLIENT` | `/dashboard/client` | Cliente, cuenta/logout | legacy oculto del nav principal |
| `ROLE_USER` | `/dashboard/client` | Cliente legacy compatible, cuenta/logout | legacy disponible segun decision |
| `ROLE_COMPANY` | `/dashboard/client` | Cliente legacy compatible, cuenta/logout | legacy disponible segun decision |

## Decision

La matriz actual es suficiente para navegacion visual, pero incompleta para autorizacion. No se debe construir seguridad frontend con esta tabla.
