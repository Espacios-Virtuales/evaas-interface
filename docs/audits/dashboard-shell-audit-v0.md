# EVAAS Interface · Dashboard Shell Audit v0

Fecha: 2026-05-23

## Regla

Dashboard es la estacion. Client y Admin son cauces dentro de la estacion.

No se deben duplicar shell, sidebar, nav, auth logic ni guards para construir vistas cliente/admin.

## 1. Composicion actual del layout

El layout activo vive en:

- `src/app/features/dashboard/layout/dashboard-shell.component.ts`
- `src/app/features/dashboard/layout/dashboard-shell.component.html`
- `src/app/features/dashboard/layout/dashboard-shell.component.scss`

La estructura actual es:

```txt
DashboardShellComponent
├─ aside.ev-sidebar
│  ├─ brand -> /dashboard
│  └─ nav.menu
│     ├─ /dashboard
│     ├─ /dashboard/resources  (*hasRole ROLE_USER)
│     └─ /dashboard/projects
├─ header.ev-topbar
│  ├─ toggle sidebar
│  ├─ email
│  ├─ primary role badge
│  └─ user modal trigger
├─ main.ev-content.container-fluid
│  └─ router-outlet
└─ dialog#userDlg
   ├─ email
   ├─ roles
   ├─ connectedAt
   └─ logout
```

Responsabilidades correctas para conservar:

- contener sidebar/topbar;
- exponer un unico `router-outlet`;
- mostrar sesion resumida;
- delegar contenido a rutas hijas;
- delegar logout a `AuthFacade`.

Riesgos actuales:

- el nav aun apunta a rutas legacy sin distinguir cauces cliente/admin;
- `primaryRole` usa el primer rol, no la prioridad de negocio;
- el modal usa `<dialog>` nativo por `document.getElementById`, aceptable por ahora pero no ideal si crece;
- el shell mezcla tokens visuales globales dentro de SCSS del componente.

## 2. Routing encapsulado actual

Rutas de app:

```txt
/                 -> /login
/login            -> LoginComponent
/register         -> RegisterComponent
/client           -> /dashboard/client
/dashboard        -> DashboardShellComponent
/**               -> /login
```

Rutas hijas de `/dashboard`:

```txt
/dashboard
/dashboard/client
/dashboard/admin
/dashboard/resources
/dashboard/projects
```

Estado de cada ruta:

| Ruta | Estado | Observacion |
| --- | --- | --- |
| `/dashboard` | legacy home | carga `HomeComponent` con metricas placeholder |
| `/dashboard/client` | cauce cliente minimo | monta `ClientDashboardComponent` dentro del shell |
| `/dashboard/admin` | aterrizaje temporal | reutiliza `HomeComponent`; no es panel admin |
| `/dashboard/resources` | legacy | tabla Material de recursos/software |
| `/dashboard/projects` | legacy | grilla de proyectos con cards y dialog |
| `/client` | compatibilidad | redirige a `/dashboard/client` |

`data.roles` esta presente en rutas cliente/admin, pero no existe `RoleGuard`. La proteccion real frontend sigue siendo `authGuard`, que solo valida sesion.

## 3. Home, recursos y proyectos heredados

### Home

Archivo:

- `src/app/features/dashboard/home/home.component.ts`

Es un placeholder con cards Bootstrap:

- Clientes;
- Recursos activos;
- Actividad.

No debe usarse como dashboard cliente real. Puede mantenerse como landing legacy o placeholder temporal de admin hasta construir vista admin.

### Recursos

Archivos:

- `src/app/features/dashboard/resources/resources-dashboard.component.*`
- `src/app/features/dashboard/resources/create-project.dialog.*`

Usa Angular Material:

- `mat-table`;
- `mat-paginator`;
- `mat-form-field`;
- `mat-dialog`;
- `mat-icon`;
- `mat-raised-button`.

Tiene loading/error basicos, pero no empty state formal. Esta pantalla mezcla busqueda, paginacion, creacion de proyecto y toast.

### Proyectos

Archivos:

- `src/app/features/dashboard/objects/grid/objects-grid.component.*`
- `src/app/features/dashboard/objects/card/object-card.component.*`
- `src/app/features/dashboard/objects/dialog/project-details.dialog.ts`

Usa Bootstrap para layout, spinner, botones y cards. Tiene:

- loading state;
- empty state simple;
- card reutilizable pero acoplada a `ProjectCardItem`;
- acciones `Ver` y `Eliminar`;
- dialog de detalle/edicion/eliminacion.

Es legacy operativo. No debe convertirse en shared sin desacoplar dominio.

## 4. Componentes visuales reutilizables

Reutilizables con extraccion pequena:

| Patron | Fuente actual | Reutilizacion recomendada |
| --- | --- | --- |
| status badge | `client-dashboard.component.scss` `.status-pill` | `dashboard/shared/status-badge` |
| section header | `client-dashboard.component.html` `.section-title` | `dashboard/shared/section-header` |
| loading/error/empty | `client-dashboard.component.html` `.state` | `dashboard/shared/data-state` |
| tabla operativa simple | `client-dashboard.component.html` | mantener local por ahora; extraer solo si se repite |
| action buttons | Bootstrap/Material en legacy | estandarizar despues, no mezclar durante esta auditoria |
| resource card | `object-card` como referencia visual | crear nuevo contrato generico antes de reutilizar |
| access card | no existe como componente | crear cuando haya vista client/admin concreta |

No reutilizar directamente:

- `ObjectCardComponent` para cliente/admin, porque depende de `ProjectCardItem` y acciones de proyecto.
- `ResourcesDashboardComponent` como tabla compartida, porque esta acoplado a `SoftwareService`, Material table y creacion de proyecto.
- `HomeComponent` como base de admin, porque contiene metricas placeholder.

## 5. Que debe quedar como shared/ui

Propuesta de shared local al dashboard:

```txt
features/dashboard/shared/
├─ status-badge/
├─ section-header/
├─ data-state/
├─ resource-card/
└─ access-card/
```

### status-badge

Responsabilidad:

- renderizar estado textual;
- soportar variantes `success`, `muted`, `warning`, `danger`, `neutral`;
- no decidir semantica de negocio.

Origen:

- `.status-pill` de cliente.

### section-header

Responsabilidad:

- titulo;
- contador opcional;
- slot/area de acciones opcional.

Origen:

- `.section-title` de cliente;
- headers de recursos/proyectos como referencia.

### data-state

Responsabilidad:

- loading;
- error con accion de retry opcional;
- empty;
- mensaje compacto para secciones internas.

Origen:

- `.state`, `.state-loading`, `.state-error`, `.state-empty`.

### resource-card

Responsabilidad futura:

- presentar recurso asignado;
- no incluir acciones administrativas;
- no depender de `ProjectCardItem`.

Debe esperar al contrato estable de `MyResourceDto`.

### access-card

Responsabilidad futura:

- presentar acceso a herramienta/servicio;
- organizacion;
- herramienta;
- estado;
- fechas de acceso.

Debe derivarse de `MyToolAccessDto` o de un view model local.

## 6. Que no debe duplicarse

No duplicar:

- `DashboardShellComponent`;
- sidebar;
- topbar/nav;
- modal de usuario/logout;
- `AuthService`, `AuthStore`, `AuthFacade`;
- `authGuard`;
- logica de seleccion post-login;
- rutas raiz fuera de `/dashboard` para client/admin.

Si cliente/admin necesitan navegacion distinta, debe resolverse con items condicionales dentro del mismo nav o con una configuracion de menu observando roles, no con otro shell.

## 7. Arquitectura propuesta

Objetivo incremental:

```txt
features/dashboard/
├─ layout/
│  └─ dashboard-shell.component.*
├─ shell/
│  ├─ dashboard-nav.model.ts
│  └─ dashboard-nav.ts
├─ client/
│  └─ client-dashboard.component.*
├─ admin/
│  └─ admin-dashboard-placeholder.component.*
├─ shared/
│  ├─ status-badge/
│  ├─ section-header/
│  ├─ data-state/
│  ├─ resource-card/
│  └─ access-card/
├─ resources/   # legacy
├─ objects/     # legacy
├─ home/        # legacy placeholder
└─ dashboard.routes.ts
```

Notas:

- `layout/` mantiene la estructura fisica del shell.
- `shell/` contiene configuracion de navegacion y modelos del shell, no vistas de negocio.
- `client/` y `admin/` son cauces dentro de `/dashboard`.
- `shared/` es shared local al dominio dashboard; no promover a `src/app/shared` hasta que lo usen otros dominios.
- `resources/`, `objects/` y `home/` quedan como legacy mientras se decide su futuro.

## 8. Refactor minimo propuesto

Orden recomendado, sin construir vistas completas:

1. Mover `src/app/features/client/client-dashboard.component.*` a `src/app/features/dashboard/client/`.
2. Actualizar `dashboard.routes.ts` para importar desde `./client/client-dashboard.component`.
3. Crear carpeta `features/dashboard/admin/` con placeholder explicito solo si se necesita diferenciarlo de `HomeComponent`.
4. Extraer solo estilos/patrones repetidos a `features/dashboard/shared/` cuando haya segunda vista que los use.
5. Cambiar nav del shell para apuntar a `/dashboard/client` y `/dashboard/admin` segun rol, manteniendo rutas legacy sin exponerlas como flujo principal.

No hacer en este refactor:

- no mover `resources/` ni `objects/`;
- no convertir `ObjectCardComponent` en generico todavia;
- no crear una libreria UI global;
- no agregar `RoleGuard` sin politica de fallback;
- no redisenar visualmente el shell.

## 9. Decision recomendada

Mantener un unico `DashboardShellComponent`.

Construir cliente y admin como rutas hijas de `/dashboard`, no como apps paralelas.

Usar `features/dashboard/shared` para patrones visuales locales cuando se repitan en cliente/admin. La primera extraccion candidata es `data-state`; la segunda es `status-badge`.

El dashboard legacy debe seguir funcionando, pero no debe dirigir el flujo post-login ni definir la arquitectura futura.

## 10. Plan por commits pequenos

### Commit 1: document dashboard shell boundaries

Objetivo:

- dejar documentado que `features/dashboard/layout` es propietario del shell;
- declarar que `client` y `admin` son rutas hijas, no layouts separados;
- marcar `resources`, `objects` y `home` como legacy.

Cambios esperados:

- documentacion solamente.

Mensaje sugerido:

```txt
docs: define dashboard shell boundaries
```

### Commit 2: align dashboard folder targets without moves

Objetivo:

- crear carpetas vacias solo si el equipo acepta placeholders versionables, o esperar al primer componente real;
- preparar imports futuros en documentacion;
- no mover `features/client` todavia.

Cambios esperados:

- ninguno en codigo si no se aceptan carpetas vacias;
- opcional: archivos `.gitkeep` solo si el repositorio usa ese patron.

Mensaje sugerido:

```txt
docs: outline dashboard feature structure
```

### Commit 3: extract shared data-state when second consumer exists

Objetivo:

- extraer loading/error/empty desde la pantalla cliente solo cuando admin tambien lo necesite;
- mantener API simple: `type`, `message`, `detail`, `retry`.

Destino:

```txt
features/dashboard/shared/data-state/
```

No incluir:

- llamadas HTTP;
- conocimiento de roles;
- textos especificos de cliente/admin.

Mensaje sugerido:

```txt
refactor: extract dashboard data state component
```

### Commit 4: extract status badge

Objetivo:

- convertir `.status-pill` en componente visual local del dashboard;
- aceptar texto y variante visual;
- dejar que cliente/admin decidan la semantica del estado.

Destino:

```txt
features/dashboard/shared/status-badge/
```

Mensaje sugerido:

```txt
refactor: extract dashboard status badge
```

### Commit 5: move client under dashboard

Objetivo:

- mover `features/client/client-dashboard.component.*` a `features/dashboard/client/`;
- actualizar `dashboard.routes.ts`;
- mantener `/dashboard/client`;
- mantener `/client -> /dashboard/client` como compatibilidad.

No hacer:

- no cambiar UI;
- no cambiar servicios `/me/*`;
- no cambiar contratos.

Mensaje sugerido:

```txt
refactor: colocate client dashboard under dashboard feature
```

### Commit 6: add explicit admin placeholder

Objetivo:

- reemplazar el uso temporal de `HomeComponent` en `/dashboard/admin`;
- crear placeholder minimo que indique estado no implementado sin simular datos;
- mantenerlo dentro de `features/dashboard/admin/`.

No hacer:

- no crear CRUD;
- no conectar endpoints admin;
- no agregar tablas o metricas falsas.

Mensaje sugerido:

```txt
refactor: add explicit admin dashboard placeholder
```

### Commit 7: centralize dashboard nav config

Objetivo:

- mover definicion de items de nav a `features/dashboard/shell`;
- usar roles solo para visibilidad visual;
- no duplicar sidebar ni nav.

Destino:

```txt
features/dashboard/shell/dashboard-nav.ts
features/dashboard/shell/dashboard-nav.model.ts
```

Mensaje sugerido:

```txt
refactor: centralize dashboard navigation config
```

### Commit 8: hide legacy routes from primary nav

Objetivo:

- dejar `/dashboard/resources` y `/dashboard/projects` accesibles si se necesitan;
- retirarlas del flujo principal cliente/admin si no corresponden al contrato actual;
- no borrar legacy.

Mensaje sugerido:

```txt
refactor: separate legacy dashboard nav entries
```
