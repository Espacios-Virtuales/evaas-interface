# EVAAS Interface · Dashboard Shell Architecture

Fecha: 2026-05-23

## Objetivo

Convertir `features/dashboard` en la estacion operacional compartida para los cauces `client` y `admin`, sin construir nuevas funcionalidades, duplicar layouts ni borrar legacy.

## Regla

Dashboard es la estacion. Client y Admin son cauces dentro de la estacion.

Angular observa contratos para navegacion visual. El backend sostiene la ley.

## Estado actual observado

Estructura actual:

```txt
src/app/features/
├─ client/
│  └─ client-dashboard.component.*
└─ dashboard/
   ├─ dashboard.routes.ts
   ├─ home/
   ├─ layout/
   │  └─ dashboard-shell.component.*
   ├─ objects/
   └─ resources/
```

Rutas actuales bajo el shell:

```txt
/dashboard
/dashboard/client
/dashboard/admin
/dashboard/resources
/dashboard/projects
```

`/client` existe solo como compatibilidad y redirige a `/dashboard/client`.

## Responsabilidades por area objetivo

Arquitectura objetivo:

```txt
features/dashboard/
├─ layout/
├─ shared/
├─ client/
└─ admin/
```

### layout/

Pertenece a `layout/`:

- `DashboardShellComponent`;
- sidebar;
- topbar;
- contenedor principal;
- unico `router-outlet`;
- modal de cuenta si sigue siendo parte del marco operacional;
- toggle de sidebar;
- lectura visual minima de sesion.

No pertenece a `layout/`:

- consultas `/me/*`;
- tablas cliente/admin;
- CRUD legacy;
- reglas de negocio por rol;
- endpoints admin.

### shared/

Pertenece a `shared/` solo cuando haya reutilizacion real entre `client` y `admin`.

Candidatos:

- `data-state`: loading, error, empty, retry;
- `status-badge`: estado textual con variantes visuales;
- `section-header`: titulo, contador, acciones;
- `access-card`: tarjeta de acceso a herramienta/servicio;
- `resource-card`: tarjeta de recurso asignado.

No promover todavia:

- `ObjectCardComponent`, porque depende de `ProjectCardItem`;
- tabla Material de recursos legacy, porque depende de `SoftwareService` y creacion de proyecto;
- home cards legacy, porque contienen metricas placeholder.

### client/

Pertenece a `client/`:

- dashboard cliente minimo;
- consumo de `MeService`;
- visualizacion de `GET /me/tool-access`;
- visualizacion de `GET /me/resources`;
- estados cliente derivados de contratos `/me/*`.

No pertenece a `client/`:

- endpoints admin;
- recursos/proyectos legacy;
- autorizacion sensible;
- duplicacion de sidebar o topbar.

### admin/

Pertenece a `admin/`:

- placeholder explicito mientras no exista panel admin;
- futuras vistas administrativas observando contratos admin;
- estados de carga/error propios de admin cuando se conecten endpoints.

No pertenece a `admin/` todavia:

- CRUD funcional;
- grillas completas;
- datos falsos;
- reutilizacion de `HomeComponent` como si fuera panel admin.

## Legacy que debe permanecer

Queda legacy operativo:

```txt
features/dashboard/home/
features/dashboard/resources/
features/dashboard/objects/
```

Tratamiento:

- no borrar;
- no mover en el primer refactor;
- no exponer como flujo principal client/admin;
- mantener rutas si todavia se usan para diagnostico o compatibilidad.

## Routing deseado

Destino estable:

```txt
/dashboard/client
/dashboard/admin
```

Rutas legacy toleradas:

```txt
/dashboard
/dashboard/resources
/dashboard/projects
```

Regla de post-login:

```txt
ROLE_ADMIN   -> /dashboard/admin
ROLE_CLIENT  -> /dashboard/client
ROLE_USER    -> /dashboard/client
ROLE_COMPANY -> /dashboard/client
```

Si hay multiples roles, `ROLE_ADMIN` tiene prioridad.

## Navegacion

El nav debe ser configuracion del dashboard shell, no HTML hardcodeado a largo plazo.

Objetivo futuro:

```txt
features/dashboard/shell/
├─ dashboard-nav.model.ts
└─ dashboard-nav.ts
```

La configuracion puede incluir:

- label;
- icon;
- route;
- roles visibles;
- flag `legacy`;
- orden.

La visibilidad por rol es ayuda visual, no autorizacion.

## Plan por commits pequenos

### Commit 1: separate shell/layout boundaries

Objetivo:

- mantener `DashboardShellComponent` como unico shell;
- documentar responsabilidades de `layout/`;
- no mover contenido funcional.

Mensaje sugerido:

```txt
docs: define dashboard shell architecture
```

### Commit 2: identify shared UI candidates

Objetivo:

- crear inventario de patrones compartibles;
- definir API esperada para `data-state`, `status-badge` y `section-header`;
- no extraer componentes hasta tener segundo consumidor.

Mensaje sugerido:

```txt
docs: identify dashboard shared ui candidates
```

### Commit 3: move client under dashboard

Objetivo:

- mover `features/client/client-dashboard.component.*` a `features/dashboard/client/`;
- actualizar import lazy de `/dashboard/client`;
- mantener `/client -> /dashboard/client`.

No hacer:

- no cambiar UI;
- no cambiar `MeService`;
- no cambiar contratos `/me/*`.

Mensaje sugerido:

```txt
refactor: move client dashboard under dashboard feature
```

### Commit 4: create explicit admin placeholder

Objetivo:

- crear `features/dashboard/admin/`;
- reemplazar el uso temporal de `HomeComponent` en `/dashboard/admin`;
- mostrar estado no implementado sin datos falsos.

No hacer:

- no crear panel admin funcional;
- no conectar endpoints admin;
- no crear grillas.

Mensaje sugerido:

```txt
refactor: add explicit admin dashboard placeholder
```

### Commit 5: centralize nav config

Objetivo:

- mover items de nav a configuracion;
- renderizar nav desde esa configuracion;
- mantener un solo sidebar.

Mensaje sugerido:

```txt
refactor: centralize dashboard navigation config
```

### Commit 6: hide legacy from primary nav

Objetivo:

- quitar legacy del nav principal client/admin;
- mantener rutas legacy accesibles;
- no borrar `home`, `resources` ni `objects`.

Mensaje sugerido:

```txt
refactor: separate legacy dashboard navigation
```

## Validacion esperada por commit funcional

Ejecutar:

```bash
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
npm run build
```

Si el build falla por version de Node, usar la version indicada por `.nvmrc`.

## No hacer en esta fase

- no duplicar layout;
- no crear pantalla admin funcional;
- no construir nuevas grillas;
- no eliminar legacy;
- no mover recursos/proyectos;
- no convertir componentes de proyecto en componentes shared antes de desacoplarlos.

## Inventario UI relacionado

La auditoria de UI/UX del dashboard vive en:

- `../frontend/dashboard-ui-inventory.md`
- `../frontend/dashboard-state-model.md`
- `../frontend/dashboard-access-matrix.md`
- `../frontend/dashboard-shared-ui-candidates.md`
