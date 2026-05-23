# ADR-001 · Dashboard Shell como estacion operacional

Fecha: 2026-05-23

## Estado

Propuesta aceptada para refactor incremental.

## Contexto

EVAAS Interface ya tiene un `DashboardShellComponent` con sidebar, topbar y `router-outlet`.

Tambien existen cauces que deben convivir dentro de la misma estacion:

- cliente: `/dashboard/client`;
- admin: `/dashboard/admin`;
- legacy: `/dashboard`, `/dashboard/resources`, `/dashboard/projects`.

El riesgo principal es duplicar layouts o convertir pantallas legacy en base de nuevas experiencias. Eso haria mas dificil mantener roles, routing, sesion y navegacion.

## Decision

`features/dashboard` sera la estacion operacional compartida.

La estructura objetivo es:

```txt
features/dashboard/
├─ layout/
├─ shared/
├─ client/
└─ admin/
```

`layout/` contiene el shell unico.

`client/` y `admin/` contienen cauces dentro del shell.

`shared/` contiene UI local del dashboard solo cuando exista reutilizacion real.

Legacy se conserva sin borrarlo.

## Consecuencias

Positivas:

- un solo sidebar;
- un solo `router-outlet` operacional;
- menos duplicacion de auth, guards y sesion;
- rutas client/admin quedan alineadas bajo `/dashboard`;
- legacy puede seguir funcionando sin definir la arquitectura futura.

Costos:

- se requiere un refactor por pasos;
- algunas rutas legacy seguiran conviviendo durante una transicion;
- el nav necesita configuracion centralizada antes de crecer.

## Alternativas descartadas

### Crear un layout cliente y un layout admin separados

Descartado porque duplica sidebar, topbar, logout, sesion y reglas visuales de navegacion.

### Mantener `features/client` como feature paralela permanente

Descartado como destino final porque el cliente debe vivir dentro de la estacion `/dashboard`, aunque `/client` pueda mantenerse como redireccion de compatibilidad.

### Convertir recursos/proyectos legacy en shared

Descartado por ahora porque esos componentes estan acoplados a servicios, DTOs y acciones legacy.

## Plan incremental

1. Separar limites shell/layout en documentacion.
2. Identificar shared UI antes de extraer.
3. Mover client bajo `features/dashboard/client`.
4. Crear admin placeholder explicito.
5. Centralizar configuracion de nav.
6. Ocultar legacy del nav principal sin borrar rutas.

## Validacion

Cada commit funcional debe pasar:

```bash
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
npm run build
```

## Referencias

- `../architecture/DASHBOARD_SHELL_ARCHITECTURE.md`
- `../audits/dashboard-shell-audit-v0.md`
- `../policies/role-and-access-model-v0.md`
- `role-routing-decision-v0.md`
