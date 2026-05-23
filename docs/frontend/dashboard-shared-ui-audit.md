# EVAAS Interface · Dashboard shared UI audit

Fecha: 2026-05-23

## Objetivo

Identificar piezas visuales reutilizables dentro del Dashboard Shell para un futuro `features/dashboard/shared/`.

Esta auditoria no extrae componentes. La regla aplicada es conservadora: no se crea shared UI si solo existe un consumidor real o si el componente esta acoplado a contratos legacy.

## Alcance revisado

Archivos revisados:

- `src/app/features/client/client-dashboard.component.*`
- `src/app/features/dashboard/layout/dashboard-shell.component.*`
- `src/app/features/dashboard/home/home.component.ts`
- `src/app/features/dashboard/resources/resources-dashboard.component.*`
- `src/app/features/dashboard/objects/grid/objects-grid.component.*`
- `src/app/features/dashboard/objects/card/object-card.component.*`
- `src/app/features/dashboard/objects/dialog/project-details.dialog.ts`

No se revisaron contratos backend ni servicios porque esta fase no cambia API.

## Inventario visual

### Loading states

Fuentes actuales:

- Cliente: `.state.state-loading` con `spinner-border spinner-border-sm`.
- Proyectos legacy: spinner Bootstrap centrado.
- Recursos legacy: texto `Cargando...`.
- Dialog de proyecto: `ng-template #loading`.

Evaluacion:

`data-state` es candidato fuerte, pero todavia no debe extraerse porque el consumidor estable es la pantalla cliente. Recursos/proyectos usan patrones legacy distintos y no conviene normalizarlos antes de separar cauces client/admin.

Destino futuro:

```txt
features/dashboard/shared/data-state/
```

### Error states

Fuentes actuales:

- Cliente: `.state.state-error` con mensaje y boton `Reintentar`.
- Recursos legacy: texto rojo inline.
- Servicios/dialogs legacy: errores por toast o cierre de dialog.

Evaluacion:

El patron cliente es el mas cercano a shared UI. Recursos legacy no debe forzar extraccion porque mezcla Material table, toast y carga paginada.

Destino futuro:

```txt
features/dashboard/shared/data-state/
```

### Empty states

Fuentes actuales:

- Cliente: `.state.state-empty` general y `.state-empty.compact` por seccion.
- Proyectos legacy: texto centrado `Sin resultados.`
- Recursos legacy: no tiene empty state formal.

Evaluacion:

Candidato fuerte para `data-state`, con variantes `page` y `compact`. No extraer hasta que admin placeholder o una segunda vista del dashboard consuma el mismo contrato visual.

### Status pills / badges

Fuentes actuales:

- Cliente: `.status-pill` y `.status-pill.muted`.
- Shell: badge Bootstrap para rol principal.
- Recursos/proyectos legacy: no tienen badge de estado reusable.

Evaluacion:

`status-badge` es candidato fuerte. Debe aceptar texto y variante visual, pero no decidir semantica de negocio. La pantalla cliente o admin debe mapear estados backend a variantes.

Destino futuro:

```txt
features/dashboard/shared/status-badge/
```

API sugerida:

```txt
label: string
variant: success | neutral | muted | warning | danger
```

### Section headers

Fuentes actuales:

- Cliente: `.section-title` con titulo y contador.
- Recursos legacy: header con titulo y buscador Material.
- Proyectos legacy: header con titulo y buscador Bootstrap.
- Shell: topbar, no debe mezclarse con header de seccion.

Evaluacion:

`section-header` es candidato medio. Hay repeticion conceptual, pero los headers actuales mezclan controles de busqueda y frameworks distintos. Conviene extraer solo cuando client/admin tengan secciones homologas.

Destino futuro:

```txt
features/dashboard/shared/section-header/
```

API sugerida:

```txt
title: string
eyebrow?: string
count?: number | string
actions?: projected content
```

### Cards

Fuentes actuales:

- Home legacy: Bootstrap cards con metricas placeholder.
- Object card legacy: `ev-object-card`, acoplada a `ProjectCardItem`.
- Cliente: secciones tipo card, no cards individuales.

Evaluacion:

No conviene extraer cards ahora.

`ObjectCardComponent` no es shared UI: depende de `ProjectCardItem` y emite acciones `view/remove` propias de proyectos. Home usa metricas placeholder y no debe convertirse en base admin.

Futuros candidatos:

```txt
features/dashboard/shared/access-card/
features/dashboard/shared/resource-card/
```

Pero deben nacer desde view models de client/admin, no desde legacy.

### Tablas simples

Fuentes actuales:

- Cliente: tablas Bootstrap simples para herramientas y recursos.
- Recursos legacy: Angular Material table con paginator.

Evaluacion:

No extraer todavia. Aunque la tabla cliente es simple y limpia, solo tiene un consumidor estable. La tabla legacy Material es otro paradigma y esta acoplada a `SoftwareService`, paginacion y creacion de proyectos.

Destino posible futuro:

```txt
features/dashboard/shared/simple-data-table/
```

Condicion:

- extraer solo si admin necesita una tabla simple similar y sin Material.

### Botones de accion

Fuentes actuales:

- Cliente: boton Bootstrap `Reintentar`.
- Shell: toggle sidebar, boton cuenta, botones de modal.
- Recursos legacy: Material buttons.
- Proyectos legacy: Bootstrap buttons.

Evaluacion:

No extraer. Hay mezcla Bootstrap/Material y cada boton tiene comportamiento contextual. Antes de crear botones shared debe existir una decision de sistema visual del dashboard.

## Componentes candidatos

Lista priorizada:

1. `data-state`
   - loading;
   - error con retry opcional;
   - empty;
   - compact empty por seccion.

2. `status-badge`
   - texto de estado;
   - variantes visuales;
   - sin semantica backend.

3. `section-header`
   - titulo;
   - contador opcional;
   - acciones proyectadas.

4. `access-card`
   - futuro;
   - depende de estabilizar presentacion de `MyToolAccessDto`.

5. `resource-card`
   - futuro;
   - depende de estabilizar `MyResourceDto`.

## Componentes que no conviene extraer aun

No extraer por ahora:

- `ObjectCardComponent`
  - acoplado a `ProjectCardItem`;
  - emite acciones de proyecto;
  - pertenece a legacy `objects`.

- `ResourcesDashboardComponent`
  - acoplado a `SoftwareService`;
  - usa Material table y paginator;
  - crea proyectos desde recursos.

- `HomeComponent`
  - contiene metricas placeholder;
  - no es admin real;
  - no debe usarse como plantilla de dashboard.

- Botones genericos
  - mezcla Bootstrap y Material;
  - sin decision visual comun.

- Tabla Material legacy
  - demasiado acoplada a recursos/software.

## Propuesta de extraccion por commits pequenos

### Commit 1: document shared UI candidates

Cambios:

- agregar esta auditoria;
- no tocar codigo.

Mensaje sugerido:

```txt
docs: audit dashboard shared ui candidates
```

### Commit 2: extract data-state after second consumer

Condicion:

- admin placeholder o vista admin minima necesita loading/error/empty con el mismo patron.

Destino:

```txt
src/app/features/dashboard/shared/data-state/
```

No incluir:

- llamadas HTTP;
- roles;
- textos especificos de cliente/admin.

Mensaje sugerido:

```txt
refactor: extract dashboard data state component
```

### Commit 3: extract status-badge

Condicion:

- cliente y admin muestran estados contractuales.

Destino:

```txt
src/app/features/dashboard/shared/status-badge/
```

Regla:

- el componente recibe `label` y `variant`;
- el mapper de estado queda en cada cauce.

Mensaje sugerido:

```txt
refactor: extract dashboard status badge
```

### Commit 4: extract section-header

Condicion:

- client/admin repiten titulo, contador y acciones.

Destino:

```txt
src/app/features/dashboard/shared/section-header/
```

Mensaje sugerido:

```txt
refactor: extract dashboard section header
```

### Commit 5: introduce access/resource cards only with stable view models

Condicion:

- `MyToolAccessDto` y `MyResourceDto` tienen view models claros;
- admin o cliente reutilizan estructura.

Destino:

```txt
src/app/features/dashboard/shared/access-card/
src/app/features/dashboard/shared/resource-card/
```

Mensaje sugerido:

```txt
refactor: add dashboard access and resource cards
```

## Decision

No se extrae ningun componente en esta fase.

La unica accion segura es documentar los candidatos y esperar al segundo consumidor real dentro de `features/dashboard/client` y `features/dashboard/admin`.
