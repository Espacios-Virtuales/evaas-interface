# EVAAS Interface · Limpieza mínima recomendada

Fecha: 2026-05-22

Principio de Fase 0: cambios pequeños, reversibles y sin construcción de nuevas features.

## Limpieza mínima segura

1. Confirmar endpoints reales de auth antes de modificar `API.auth`.
2. Agregar endpoint `me.toolAccess` solo cuando backend confirme contrato.
3. Crear DTO explícito para refresh antes de tocar el interceptor.
4. Marcar dashboard mock como placeholder no productivo.
5. Revisar storage de sesión y documentar política.
6. Mantener recursos/proyectos sin expansión hasta terminar estación mínima.
7. Actualizar Node y ejecutar build producción.

## Hallazgo

El proyecto conserva features fuera del foco actual.

## Impacto

Puede distraer el desarrollo y aumentar el área de regresión.

## Riesgo

Medio

## Recomendación

No eliminar. Congelar cambios ahí y evitar que guíen la arquitectura de Fase 0.

## Archivos involucrados

- `src/app/features/auth/register/`
- `src/app/features/dashboard/resources/`
- `src/app/features/dashboard/objects/`

## Hallazgo

Los endpoints auth deben alinearse con backend, pero no conviene cambiarlos sin confirmación.

## Impacto

Un cambio prematuro puede romper login si producción todavía usa `/login` y `/logout`.

## Riesgo

Alto

## Recomendación

Hacer un cambio único y auditable cuando backend confirme:

```txt
login: /auth/login
refresh: /auth/refresh
logout: /auth/logout
toolAccess: /me/tool-access
```

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `package.json`

## Hallazgo

El contrato `GET /me/tool-access` todavía no tiene servicio ni modelo.

## Impacto

El dashboard no puede representar acceso operacional real.

## Riesgo

Alto

## Recomendación

Después de confirmar backend, agregar solo:

- endpoint en `API`;
- DTO en `core/models`;
- servicio read-only;
- render mínimo en dashboard.

No agregar administración, CRUD ni métricas.

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `src/app/core/models/`
- `src/app/core/services/`
- `src/app/features/dashboard/home/home.component.ts`

## Hallazgo

`core/types` y `core/models` se solapan.

## Impacto

Duplicación de enums y contratos hace más probable usar el tipo incorrecto.

## Riesgo

Medio

## Recomendación

No reorganizar masivamente. En una limpieza posterior, mover un tipo a la vez hacia una frontera única.

## Archivos involucrados

- `src/app/core/models/provisions.model.ts`
- `src/app/core/types/project.types.ts`
- `src/app/core/types/api.type.ts`

## Hallazgo

Hay comentarios y convenciones de prototipo en servicios y componentes.

## Impacto

No rompen compilación, pero reducen claridad para mantenimiento enterprise.

## Riesgo

Bajo

## Recomendación

Limpiar gradualmente comentarios temporales, nombres inconsistentes y formato. Evitar mezclar esta limpieza con cambios funcionales.

## Archivos involucrados

- `src/app/core/auth/auth.store.ts`
- `src/app/core/auth/auth.mapper.ts`
- `src/app/core/http/refresh-token-interceptor.ts`
- `src/app/features/dashboard/resources/resources-dashboard.component.ts`

## Hallazgo

Navegación usa rutas absolutas hardcodeadas en varios lugares.

## Impacto

Si cambia `PATHS`, enlaces como `/login`, `/register`, `/dashboard` pueden quedar desalineados.

## Riesgo

Bajo

## Recomendación

Más adelante, centralizar navegación con `PATHS` o helpers de rutas. No es bloqueo de Fase 0.

## Archivos involucrados

- `src/app/core/auth/auth-guard.ts`
- `src/app/core/auth/auth.facade.ts`
- `src/app/features/auth/login/login.component.html`
- `src/app/features/auth/register/register.component.html`
- `src/app/features/dashboard/layout/dashboard-shell.component.html`

## Hallazgo

Existen overrides globales con `!important`.

## Impacto

Pueden dificultar cambios visuales y provocar efectos secundarios sobre Material/Bootstrap.

## Riesgo

Bajo

## Recomendación

No rediseñar en Fase 0. Cuando se estabilice la estación mínima, reducir overrides globales y mover estilos a componentes cuando corresponda.

## Archivos involucrados

- `src/styles.scss`
- `src/app/features/dashboard/resources/create-project.dialog.scss`
- `src/app/features/auth/register/register.component.scss`

## Hallazgo

El entorno local no permite build Angular 20.

## Impacto

El equipo puede pensar que el proyecto está roto cuando el bloqueo real es runtime.

## Riesgo

Alto

## Recomendación

Instalar Node compatible y repetir:

```bash
npm run build
npm test
```

## Archivos involucrados

- `package.json`
- `package-lock.json`
- `angular.json`

## Orden recomendado para limpieza

1. Actualizar Node local/CI.
2. Confirmar contrato backend.
3. Alinear endpoints auth.
4. Agregar contrato mínimo `tool-access`.
5. Reemplazar mocks por estado real o empty state.
6. Consolidar modelos/tipos gradualmente.
7. Revisar UI global sin rediseño masivo.
