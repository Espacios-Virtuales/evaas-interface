# EVAAS Interface · Dashboard shared UI candidates

Fecha: 2026-05-23

## Objetivo

Proponer componentes reutilizables futuros para `features/dashboard/shared/`, sin implementarlos todavia.

## Criterios de extraccion

Extraer si:

- lo usa client y admin;
- tiene semantica transversal;
- reduce duplicacion real;
- no introduce abstraccion artificial;
- no mezcla negocio con presentacion;
- puede probarse sin endpoints.

No extraer si:

- solo tiene un consumidor;
- depende de textos especificos;
- mezcla negocio con presentacion;
- requiere demasiados inputs;
- nace desde legacy acoplado;
- compite con Material o Bootstrap sin decision visual.

## Candidatos

### data-state

Destino:

```txt
features/dashboard/shared/data-state/
```

Prioridad:

Alta, cuando exista segundo consumidor real.

Consumidores reales/proximos:

- client: loading, error, empty;
- admin: placeholder hoy, estados admin futuros.

Responsabilidad:

- loading;
- error;
- empty;
- retry opcional;
- modo compacto.

No incluir:

- llamadas HTTP;
- roles;
- endpoint names;
- textos fijos de negocio.

### status-badge

Destino:

```txt
features/dashboard/shared/status-badge/
```

Prioridad:

Alta, cuando admin muestre estados contractuales.

Consumidores reales/proximos:

- client: tool/resource status;
- admin futuro: organizaciones, accesos, recursos, activaciones.

Responsabilidad:

- renderizar label;
- aplicar variante visual.

API sugerida:

```txt
label: string
variant: success | neutral | muted | warning | danger
```

No incluir:

- mapeo de enums backend;
- fechas;
- permisos.

### section-header

Destino:

```txt
features/dashboard/shared/section-header/
```

Prioridad:

Media.

Consumidores reales/proximos:

- client: secciones con contador;
- admin futuro: secciones operacionales.

Responsabilidad:

- titulo;
- eyebrow opcional;
- contador opcional;
- slot de acciones.

Riesgo:

Recursos/proyectos legacy tienen headers con buscadores y frameworks distintos.

### action-card

Destino:

```txt
features/dashboard/shared/action-card/
```

Prioridad:

Baja.

Consumidores reales/proximos:

- admin futuro: accesos rapidos;
- client futuro: acceso a herramienta.

Responsabilidad:

- titulo;
- descripcion;
- icono;
- accion primaria.

Riesgo:

Puede mezclar navegacion, permisos y presentacion si se extrae temprano.

### kpi-card

Destino:

```txt
features/dashboard/shared/kpi-card/
```

Prioridad:

Baja.

Consumidores reales/proximos:

- admin futuro, si backend entrega metricas reales.

No usar como origen:

- `HomeComponent`, porque contiene metricas placeholder.

### data-table-shell

Destino:

```txt
features/dashboard/shared/data-table-shell/
```

Prioridad:

Media-baja.

Consumidores reales/proximos:

- client: tablas simples;
- admin futuro: tablas simples si no usa Material.

Responsabilidad:

- contenedor visual de tabla;
- header opcional;
- empty/loading/error shell.

No incluir:

- definicion dinamica completa de columnas;
- paginacion Material;
- busqueda;
- acciones de fila con negocio.

### confirm-dialog

Destino:

```txt
features/dashboard/shared/confirm-dialog/
```

Prioridad:

Baja.

Consumidores reales/proximos:

- legacy projects ya confirma/elimina dentro de dialog acoplado;
- admin futuro podria necesitar confirmaciones.

Condicion:

Extraer solo cuando exista segunda accion destructiva real y una politica UX de confirmacion.

## No candidatos por ahora

- `ObjectCardComponent`;
- `ResourcesDashboardComponent`;
- `CreateProjectDialogComponent`;
- `ProjectDetailsDialogComponent`;
- `HomeComponent`;
- toast/snackbar;
- botones genericos;
- tabla Material legacy.

## Orden recomendado

1. Esperar segundo consumidor.
2. Extraer `data-state`.
3. Extraer `status-badge`.
4. Extraer `section-header`.
5. Evaluar `data-table-shell` si admin usa tablas simples.
6. Evaluar `confirm-dialog` solo con politica de acciones destructivas.

## Decision

No implementar shared UI todavia.

El primer componente con mejor relacion costo/beneficio sera `data-state`, pero solo cuando admin deje de ser placeholder estatico o cuando exista otra vista dashboard que use los mismos estados.
