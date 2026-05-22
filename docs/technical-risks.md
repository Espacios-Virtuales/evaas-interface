# EVAAS Interface · Riesgos técnicos

Fecha: 2026-05-22

## Hallazgo

Contrato de autenticación desalineado con la Fase 0.

## Impacto

El objetivo declara `POST /auth/login` y `POST /auth/logout`, pero la app usa `/login` y `/logout`. Si EVAAS Core expone solo los endpoints nuevos, login/logout fallarán. Si Core aún expone los antiguos, la documentación de producto está adelantada al código.

## Riesgo

Alto

## Recomendación

Confirmar contrato real con backend antes de tocar la implementación. Actualizar `API.auth` y scripts de chequeo en un único cambio.

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `src/app/core/auth/auth.service.ts`
- `package.json`

## Hallazgo

No existe integración `GET /me/tool-access`.

## Impacto

La app no puede cumplir el flujo mínimo declarado. Sin ese contrato, el dashboard no puede observar acceso operacional emitido por backend.

## Riesgo

Alto

## Recomendación

Crear después un servicio read-only dedicado, por ejemplo `MeService` o `ToolAccessService`, con DTO mínimo y sin lógica de autorización local.

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `src/app/core/services/`
- `src/app/features/dashboard/home/home.component.ts`

## Hallazgo

Angular mantiene roles y privilegios derivados del login en el store.

## Impacto

Esto es útil para UI condicional, pero puede confundirse con autorización real si se usa para decidir acceso. La regla del sistema exige que Angular observe contratos, no que sostenga la ley.

## Riesgo

Medio

## Recomendación

Mantener roles solo para visualización, ocultamiento cosmético o navegación asistida. Toda acción protegida debe depender de backend. Documentar esto al implementar `tool-access`.

## Archivos involucrados

- `src/app/core/auth/auth.store.ts`
- `src/app/core/auth/directives/has-role.ts`
- `src/app/core/auth/rbac.ts`

## Hallazgo

El refresh token interceptor puede entrar en estados inconsistentes si la respuesta de refresh no trae fechas normalizadas.

## Impacto

El store puede recibir strings o campos faltantes en `accessTokenExp`/`refreshExp`, afectando `isLoggedIn`, guards y watcher.

## Riesgo

Alto

## Recomendación

Agregar DTO y mapper para refresh. Validar si el backend entrega `token`, `issuedAt`, `refreshExpiresIn` o una forma distinta.

## Archivos involucrados

- `src/app/core/http/refresh-token-interceptor.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.store.ts`
- `src/app/core/models/http.model.ts`

## Hallazgo

El interceptor de auth adjunta JWT a todas las requests si existe token.

## Impacto

Esto es aceptable si todas las llamadas van al backend EVAAS. Si en el futuro se consultan dominios externos desde Angular, se podría filtrar Authorization.

## Riesgo

Medio

## Recomendación

En fase posterior, limitar Authorization a `environment.apiUrl` o a endpoints registrados.

## Archivos involucrados

- `src/app/core/http/auth-interceptor.ts`
- `src/app/core/http/api.endpoints.ts`

## Hallazgo

`AuthFacade.logout()` no envía refresh token aunque lo recibe como parámetro.

## Impacto

Si backend requiere refresh token para revocar sesión, logout remoto puede ser incompleto. Si backend usa Authorization header o cookie, está bien, pero no está documentado.

## Riesgo

Medio

## Recomendación

Confirmar contrato de logout. Ajustar solo después de confirmar si la revocación depende del body, header o cookie.

## Archivos involucrados

- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.facade.ts`

## Hallazgo

Build producción está bloqueado por Node local incompatible.

## Impacto

No se validan bundles, budgets, optimización ni reemplazo final de environments.

## Riesgo

Alto

## Recomendación

Usar Node `20.19+` o `22.12+`. Ajustar `engines.node` a una versión mínima concreta en vez de `20.x`.

## Archivos involucrados

- `package.json`
- `angular.json`

## Hallazgo

El test runner completo no fue ejecutado con navegador.

## Impacto

`tsc` valida tipos, pero no ejecuta comportamiento de componentes, interceptores ni templates en Karma/Chrome.

## Riesgo

Medio

## Recomendación

Después de actualizar Node, ejecutar `npm test` o configurar un runner headless estable para CI.

## Archivos involucrados

- `package.json`
- `tsconfig.spec.json`
- `src/app/**/*.spec.ts`

## Hallazgo

La UI mezcla Bootstrap, Bootstrap Icons y Angular Material sin una convención de responsabilidad.

## Impacto

Puede generar estilos duplicados, overrides con `!important`, inconsistencias de accesibilidad y tamaño visual.

## Riesgo

Medio

## Recomendación

No rediseñar ahora. Definir luego una regla simple: Material para controles complejos, Bootstrap solo para layout/utilidades o migración gradual.

## Archivos involucrados

- `src/styles.scss`
- `src/material-theme.scss`
- `src/app/features/**/*.html`
- `src/app/features/**/*.scss`

## Hallazgo

Existen flujos de escritura operativa activos en proyectos.

## Impacto

Crear, actualizar y eliminar proyectos no pertenecen al foco de Fase 0. Pueden introducir errores de backend o UI mientras se intenta estabilizar login/tool-access.

## Riesgo

Medio

## Recomendación

No expandirlos. Evaluar luego si se ocultan, se protegen por contrato backend o se mantienen como feature separada.

## Archivos involucrados

- `src/app/features/dashboard/resources/create-project.dialog.ts`
- `src/app/features/dashboard/objects/dialog/project-details.dialog.ts`
- `src/app/core/services/project.service.ts`
