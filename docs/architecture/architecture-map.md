# EVAAS Interface · Mapa real de arquitectura

Fecha: 2026-05-22

## Estructura observada

```txt
src/app/
├─ core/
│  ├─ auth/
│  ├─ http/
│  ├─ models/
│  ├─ services/
│  └─ types/
├─ features/
│  ├─ auth/
│  └─ dashboard/
├─ shared/
│  └─ components/
└─ utils/
```

No existen carpetas raíz `src/app/auth`, `src/app/dashboard`, `src/app/services`, `src/app/models`, `src/app/guards` ni `src/app/interceptors`. Esas responsabilidades viven bajo `core` y `features`.

## Mapa funcional actual

```txt
main.ts
└─ App
   └─ app.routes.ts
      ├─ features/auth/auth.routes.ts
      │  ├─ login
      │  └─ register
      └─ features/dashboard/dashboard.routes.ts
         └─ dashboard shell
            ├─ home
            ├─ resources
            └─ projects
```

## Mapa de core

```txt
core/auth/
├─ auth.service.ts
├─ auth.store.ts
├─ auth.facade.ts
├─ auth.mapper.ts
├─ auth-guard.ts
├─ session-watcher.service.ts
├─ rbac.ts
├─ directives/has-role.ts
└─ validators/unique-email.ts

core/http/
├─ api.endpoints.ts
├─ auth-interceptor.ts
├─ error-interceptor.ts
└─ refresh-token-interceptor.ts

core/services/
├─ project.service.ts
├─ resources.service.ts
├─ software.service.ts
└─ toast.ts
```

## Mapa de contratos/modelos

```txt
core/models/
├─ auth.model.ts
├─ http.model.ts
├─ project.model.ts
├─ provisions.model.ts
├─ resources.model.ts
├─ software.model.ts
└─ broker-provision.api.ts

core/types/
├─ api.type.ts
├─ auth.types.ts
└─ project.types.ts
```

## Hallazgo

La arquitectura base `core/shared/features` existe y es una buena base para estabilizar EVAAS Interface.

## Impacto

Permite evolucionar con cambios pequeños: auth en `core/auth`, HTTP transversal en `core/http`, pantallas por `features`.

## Riesgo

Bajo

## Recomendación

Mantener esta frontera. Evitar crear nuevas carpetas raíz paralelas como `src/app/services` o `src/app/models`.

## Archivos involucrados

- `src/app/core/`
- `src/app/features/`
- `src/app/shared/`

## Hallazgo

`features/dashboard` contiene subdominios que pueden convertirse en features propias.

## Impacto

`resources` y `objects/projects` quedan acoplados al dashboard shell. Esto es aceptable para prototipo, pero puede dificultar rutas, permisos y carga diferida por dominio.

## Riesgo

Medio

## Recomendación

No mover ahora. Marcar como reorganización posterior cuando exista contrato backend estable. Candidato futuro:

```txt
features/resources
features/projects
features/profile
features/onboarding
features/clients
```

## Archivos involucrados

- `src/app/features/dashboard/resources/`
- `src/app/features/dashboard/objects/`
- `src/app/features/dashboard/dashboard.routes.ts`

## Hallazgo

Existen modelos duplicados o fronteras poco claras entre `core/models` y `core/types`.

## Impacto

El mismo dominio de provisión aparece en `models/provisions.model.ts` y `types/project.types.ts`. Esto puede producir casts incorrectos, estados incompatibles y deuda de mappers.

## Riesgo

Medio

## Recomendación

Consolidar en una fase pequeña posterior. Preferir `core/models` o renombrar a `core/contracts`, pero no mezclar DTO API, estado UI y enums de dominio sin convención.

## Archivos involucrados

- `src/app/core/models/provisions.model.ts`
- `src/app/core/types/project.types.ts`
- `src/app/core/types/api.type.ts`

## Hallazgo

La navegación mantiene `register`, `resources` y `projects` activos aunque la Fase 0 solo necesita login, dashboard y tool access.

## Impacto

La superficie visible puede sugerir capacidades operativas no estabilizadas. También aumenta el área de prueba antes de validar la estación mínima.

## Riesgo

Medio

## Recomendación

No eliminar todavía. En la siguiente fase, decidir si se ocultan detrás de feature flags, roles del backend o rutas no enlazadas hasta que el contrato exista.

## Archivos involucrados

- `src/app/features/auth/auth.routes.ts`
- `src/app/features/dashboard/dashboard.routes.ts`
- `src/app/features/dashboard/layout/dashboard-shell.component.html`

## Hallazgo

Hay lógica de negocio/operación dentro de componentes de proyectos.

## Impacto

`ProjectDetailsDialogComponent` arma DTO completo para update y ejecuta delete desde la UI. Esto va más allá de visualización operacional mínima y acopla pantalla a decisiones de escritura.

## Riesgo

Medio

## Recomendación

Congelar estos flujos hasta estabilizar tool access. Si se mantienen, mover luego la adaptación DTO a servicio/mappers y dejar componentes como orquestadores de UI.

## Archivos involucrados

- `src/app/features/dashboard/objects/dialog/project-details.dialog.ts`
- `src/app/core/services/project.service.ts`

## Hallazgo

El shell de dashboard usa `<dialog>` nativo y manipulación por `document.getElementById`.

## Impacto

Bypassea patrones Angular/CDK, complica testing y puede generar inconsistencias de accesibilidad/foco.

## Riesgo

Bajo

## Recomendación

No cambiar en Fase 0. En una fase UI base, migrar a Angular Material Dialog o CDK Dialog si sigue siendo necesario.

## Archivos involucrados

- `src/app/features/dashboard/layout/dashboard-shell.component.ts`
- `src/app/features/dashboard/layout/dashboard-shell.component.html`

## Hallazgo

`shared` contiene solo toasts y helpers, sin librería UI común consolidada.

## Impacto

Cada feature tiende a resolver estilos y layout por su cuenta. Esto explica la mezcla Bootstrap/Material.

## Riesgo

Bajo

## Recomendación

No crear design system aún. Primero estabilizar estación mínima y después extraer componentes repetidos reales.

## Archivos involucrados

- `src/app/shared/components/toasts/`
- `src/app/shared/lazy.ts`
- `src/app/shared/router-helpers.ts`
