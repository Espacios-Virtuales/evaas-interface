# EVAAS Interface · Dashboard UI/UX inventory

Fecha: 2026-05-23

## Objetivo

Inventariar flujos, elementos visuales, estados y sistemas UI presentes en el Dashboard Shell antes de seguir refactorizando.

No se mueven archivos, no se extraen componentes y no se centraliza navegacion en esta auditoria.

## Flujos

| Flujo | Estado | Implementacion actual |
| --- | --- | --- |
| login -> dashboard | implementado | `LoginComponent` usa `dashboardRouteForSession()` para elegir `/dashboard/admin` o `/dashboard/client`. |
| dashboard -> client | implementado | `/dashboard/client` carga `ClientDashboardComponent` dentro de `DashboardShellComponent`. |
| dashboard -> admin | parcial | `/dashboard/admin` carga `AdminDashboardPlaceholderComponent` dentro del shell. No hay panel funcional. |
| client -> mis herramientas | implementado minimo | `ClientDashboardComponent` consulta `MeService.getMyToolAccess()` y renderiza tabla simple. |
| client -> mis recursos | implementado minimo | `ClientDashboardComponent` consulta `MeService.getMyResources()` y renderiza tabla simple con campos seguros. |
| admin -> organizaciones | pendiente | Solo aparece como proxima estacion en placeholder. |
| admin -> accesos | pendiente | Solo aparece como proxima estacion en placeholder. |
| admin -> recursos | pendiente | Solo aparece como proxima estacion en placeholder. |
| admin -> activaciones | pendiente | Solo aparece como proxima estacion en placeholder. |
| legacy -> resources | implementado legacy | `/dashboard/resources` carga tabla Material para recursos/software y creacion de proyecto. |
| legacy -> projects | implementado legacy | `/dashboard/projects` carga grilla de cards de proyectos y dialog de detalle. |

## Elementos visuales

## Elemento
Dashboard Shell.

## Ubicacion
`src/app/features/dashboard/layout/dashboard-shell.component.*`

## Tecnologia
Bootstrap, Bootstrap Icons, SCSS custom.

## Uso actual
Contiene sidebar, nav, topbar, modal de cuenta y `router-outlet`.

## Reutilizable
No como componente shared; es el layout propietario.

## Candidato a shared
No.

## Riesgo
Duplicar este shell romperia consistencia de auth, nav y layout.

---

## Elemento
Nav sidebar.

## Ubicacion
`src/app/features/dashboard/layout/dashboard-shell.component.html`

## Tecnologia
Bootstrap Icons, `routerLink`, `routerLinkActive`, directiva `hasRole`, SCSS custom.

## Uso actual
Muestra resumen, recursos legacy y proyectos legacy.

## Reutilizable
No. Debe centralizarse como configuracion de dashboard, no como componente UI generico.

## Candidato a shared
No.

## Riesgo
Rutas hardcodeadas y visibilidad parcial por `ROLE_USER` legacy.

---

## Elemento
Topbar y rol visible.

## Ubicacion
`src/app/features/dashboard/layout/dashboard-shell.component.html`

## Tecnologia
Bootstrap, Bootstrap badge, SCSS custom.

## Uso actual
Muestra email, primer rol y boton de cuenta.

## Reutilizable
No; pertenece al layout.

## Candidato a shared
No.

## Riesgo
`primaryRole` usa primer rol, no prioridad de negocio.

---

## Elemento
Modal de cuenta.

## Ubicacion
`src/app/features/dashboard/layout/dashboard-shell.component.html`

## Tecnologia
`<dialog>` nativo, Bootstrap buttons, SCSS custom.

## Uso actual
Muestra email, roles, conexion y logout.

## Reutilizable
Mas adelante.

## Candidato a shared
No en esta fase.

## Riesgo
Uso imperativo de `document.getElementById`.

---

## Elemento
Client dashboard state panel.

## Ubicacion
`src/app/features/dashboard/client/client-dashboard.component.html`
`src/app/features/dashboard/client/client-dashboard.component.scss`

## Tecnologia
Bootstrap spinner/button, SCSS custom.

## Uso actual
Loading, error con retry, empty global y empty compacto por seccion.

## Reutilizable
Si, cuando admin tenga estados equivalentes.

## Candidato a shared
Si: `features/dashboard/shared/data-state/`.

## Riesgo
Un solo consumidor estable hoy.

---

## Elemento
Client status pill.

## Ubicacion
`src/app/features/dashboard/client/client-dashboard.component.html`
`src/app/features/dashboard/client/client-dashboard.component.scss`

## Tecnologia
SCSS custom.

## Uso actual
Muestra estado de herramientas y recursos.

## Reutilizable
Si.

## Candidato a shared
Si: `features/dashboard/shared/status-badge/`.

## Riesgo
Debe recibir variante visual; no debe mapear semantica backend internamente.

---

## Elemento
Section header con contador.

## Ubicacion
`src/app/features/dashboard/client/client-dashboard.component.html`

## Tecnologia
SCSS custom.

## Uso actual
Titulos `Mis herramientas` y `Mis recursos` con contador.

## Reutilizable
Mas adelante.

## Candidato a shared
Si: `features/dashboard/shared/section-header/`.

## Riesgo
Recursos/proyectos legacy usan headers diferentes con buscadores.

---

## Elemento
Tablas simples cliente.

## Ubicacion
`src/app/features/dashboard/client/client-dashboard.component.html`

## Tecnologia
Bootstrap table, SCSS custom.

## Uso actual
Renderiza herramientas y recursos del usuario autenticado.

## Reutilizable
Mas adelante.

## Candidato a shared
Condicional: `features/dashboard/shared/data-table-shell/`.

## Riesgo
Solo un consumidor estable; no debe competir con Material table legacy.

---

## Elemento
Admin placeholder.

## Ubicacion
`src/app/features/dashboard/admin/admin-dashboard-placeholder.component.*`

## Tecnologia
SCSS custom.

## Uso actual
Mensaje de modulo en preparacion y lista de proximas estaciones.

## Reutilizable
No.

## Candidato a shared
No.

## Riesgo
Puede inspirar `data-state`, pero no debe convertirse en panel admin funcional.

---

## Elemento
KPI cards legacy.

## Ubicacion
`src/app/features/dashboard/home/home.component.ts`

## Tecnologia
Bootstrap cards, `.ev-card`.

## Uso actual
Muestra metricas placeholder: clientes, recursos activos, actividad.

## Reutilizable
No ahora.

## Candidato a shared
Condicional futuro: `kpi-card`, pero no desde datos placeholder.

## Riesgo
Datos falsos o placeholder pueden contaminar admin.

---

## Elemento
Resources table legacy.

## Ubicacion
`src/app/features/dashboard/resources/resources-dashboard.component.*`

## Tecnologia
Angular Material table, paginator, form field, dialog, icon, Bootstrap utilities.

## Uso actual
Lista recursos/software y permite crear proyecto.

## Reutilizable
No.

## Candidato a shared
No en esta fase.

## Riesgo
Acoplamiento a `SoftwareService`, `CreateProjectDialogComponent` y Material table.

---

## Elemento
Projects grid legacy.

## Ubicacion
`src/app/features/dashboard/objects/grid/objects-grid.component.*`

## Tecnologia
Bootstrap layout, CSS grid custom, Angular Material dialog.

## Uso actual
Lista cards de proyecto con busqueda y paginacion simple.

## Reutilizable
No como shared.

## Candidato a shared
No.

## Riesgo
Acoplamiento a `ProjectsService`, `ProjectDetailsDialogComponent` y `ProjectCardItem`.

---

## Elemento
Object card legacy.

## Ubicacion
`src/app/features/dashboard/objects/card/object-card.component.*`

## Tecnologia
Bootstrap card/buttons/icons, SCSS custom.

## Uso actual
Card de proyecto con acciones `Ver` y `Eliminar`.

## Reutilizable
No ahora.

## Candidato a shared
No.

## Riesgo
Depende de `ProjectCardItem` y acciones de proyecto.

---

## Elemento
Dialogs legacy.

## Ubicacion
`src/app/features/dashboard/resources/create-project.dialog.*`
`src/app/features/dashboard/objects/dialog/project-details.dialog.ts`

## Tecnologia
Angular Material dialog/form fields/buttons, Bootstrap utilities.

## Uso actual
Crear proyecto y editar/ver detalle de proyecto.

## Reutilizable
No.

## Candidato a shared
Solo futuro: `confirm-dialog`, no estos dialogs.

## Riesgo
Mezcla negocio, formularios y presentacion.

---

## Elemento
Alerts/toasts.

## Ubicacion
`src/app/shared/components/toasts/toasts.ts`
`src/app/core/services/toast.ts`
`src/app/core/http/error-interceptor.ts`

## Tecnologia
Bootstrap toast, Angular Material snackbar.

## Uso actual
Toast custom para recursos; snackbar Material para interceptores/logout.

## Reutilizable
Ya es transversal, pero inconsistente.

## Candidato a shared
No dentro de `features/dashboard/shared`; pertenece a una politica global de notificaciones.

## Riesgo
Dos sistemas de notificacion activos.

## Sistemas visuales mezclados

### Angular Material

Usado en:

- resources table;
- paginator;
- form fields;
- dialogs;
- snackbar;
- buttons/icons en flujos legacy.

El tema Material vive en `src/material-theme.scss` y se carga en build despues de `src/styles.scss`.

### Bootstrap

Bootstrap CSS se carga globalmente en `angular.json` para build. Se usa para:

- layout utilities;
- buttons;
- badges;
- cards;
- forms;
- tables cliente;
- spinners;
- toasts.

En `test`, `angular.json` carga solo `src/styles.scss`; esto puede generar diferencias visuales en pruebas si algun spec depende de Bootstrap.

### SCSS custom

Existe en:

- `dashboard-shell.component.scss`;
- `client-dashboard.component.scss`;
- `admin-dashboard-placeholder.component.scss`;
- `object-card.component.scss`;
- dialogs legacy;
- `styles.scss`;
- `material-theme.scss`.

### Conflictos y riesgos

- `.ev-card` existe en `dashboard-shell.component.scss`, `object-card.component.scss` y `material-theme.scss`.
- Colores hardcodeados repetidos: `#10243c`, `#142033`, `#526173`, `#dfe7ef`, `#0D1B2A`.
- Border radius varía entre `8px`, `.5rem`, `.75rem`, `12px`, `16px`.
- Bootstrap se usa tanto para layout como para controles visuales.
- Material se usa en flujos legacy y tambien para snackbar global.
- `styles.scss` contiene overrides globales para `.evaas-dialog`, lo que acopla dialogs legacy a clase global.
- Google Fonts se importa por URL en `styles.scss`; el build de produccion requiere red para inlinear fuentes.

## No tocar todavia

- No mover legacy.
- No extraer `ObjectCardComponent`.
- No crear `data-table-shell` hasta que admin necesite tabla simple real.
- No mezclar placeholder admin con contratos admin.
- No unificar notificaciones sin decision global.
