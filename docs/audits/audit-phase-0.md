# EVAAS Interface · Fase 0 · Diagnóstico técnico

Fecha: 2026-05-22

Mantra técnico: Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

## Estado general

El proyecto compila a nivel TypeScript para aplicación y specs, y ya tiene una separación base razonable en `core`, `shared` y `features`. La estación Angular, sin embargo, todavía no está alineada con el foco operativo mínimo declarado para esta fase:

```txt
Login
↓
Dashboard
↓
GET /me/tool-access
↓
Visualización operacional mínima
```

Actualmente existen flujos adicionales de registro, recursos, proyectos, provisiones y edición/eliminación de proyectos. No conviene eliminarlos todavía, pero deben tratarse como superficie fuera de fase hasta estabilizar el contrato real con EVAAS Core.

## Validaciones ejecutadas

```bash
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/tsc -p tsconfig.spec.json --noEmit
npm run build
```

Resultado:

- TypeScript app: OK.
- TypeScript spec: OK.
- Build Angular producción: bloqueado por runtime local Node `v18.18.2`.

El proyecto declara `engines.node: 20.x`, pero Angular CLI 20 exige Node `20.19` o `22.12` como mínimo.

## Hallazgo

La arquitectura base existe, pero la estación Angular tiene más alcance funcional del permitido para Fase 0.

## Impacto

El diagnóstico de login, dashboard y `GET /me/tool-access` se contamina con código de recursos, proyectos, provisiones, registro y edición de proyectos. Esto aumenta el riesgo de corregir lo equivocado antes de estabilizar el contrato principal.

## Riesgo

Medio

## Recomendación

Congelar nuevas features y declarar recursos/proyectos/registro como superficie heredada o pendiente. La siguiente fase debe introducir primero el contrato `GET /me/tool-access` y una vista operacional mínima antes de ampliar dashboards.

## Archivos involucrados

- `src/app/features/auth/register/`
- `src/app/features/dashboard/resources/`
- `src/app/features/dashboard/objects/`
- `src/app/core/services/project.service.ts`
- `src/app/core/services/software.service.ts`

## Hallazgo

Los endpoints configurados no coinciden completamente con el contrato objetivo de Fase 0.

## Impacto

El contrato esperado declara:

```txt
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /me/tool-access
```

El código actual usa:

```txt
POST /login
POST /auth/refresh
POST /logout
```

Además, no existe todavía un endpoint registrado para `GET /me/tool-access`.

## Riesgo

Alto

## Recomendación

No cambiar los contratos a ciegas. Confirmar primero con EVAAS Core si los endpoints reales son los declarados en esta fase o los actualmente usados por la app. Después, ajustar `API.auth` y crear un servicio mínimo de lectura para `me/tool-access`.

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `src/app/core/auth/auth.service.ts`
- `package.json`

## Hallazgo

La autenticación persiste sesión completa en `localStorage`.

## Impacto

La sesión sobrevive a cierres de pestaña y queda expuesta al perfil de riesgo habitual de `localStorage` ante XSS. Para una estación operacional, esto debe ser una decisión explícita del ecosistema, no accidental.

## Riesgo

Alto

## Recomendación

Definir política de sesión con backend: duración, renovación, revocación y almacenamiento. Si el backend sostiene cookies httpOnly en el futuro, Angular debe observar ese contrato. Si se mantiene JWT en storage, reducir superficie XSS y documentar expiración.

## Archivos involucrados

- `src/app/core/auth/auth.store.ts`
- `src/app/core/auth/auth.mapper.ts`
- `src/app/core/http/auth-interceptor.ts`

## Hallazgo

`SessionWatcherService` inicia su revisión 10 minutos después del primer render.

## Impacto

Una sesión ya vencida puede permanecer visible hasta que otro evento o request fuerce logout/refresh. La guardia protege navegación inicial, pero el watcher no revalida inmediatamente tras boot.

## Riesgo

Medio

## Recomendación

En una fase posterior, revisar sesión al boot y recalcular expiración inmediatamente. Mantenerlo como cambio pequeño y verificable porque toca UX de logout.

## Archivos involucrados

- `src/app/core/auth/session-watcher.service.ts`
- `src/app/core/auth/auth.store.ts`
- `src/app/core/auth/auth.facade.ts`

## Hallazgo

El refresh token asume que la respuesta del backend tiene forma parcial de `UserSession`.

## Impacto

`AuthService.refresh()` retorna `Partial<UserSession>`, pero un backend normalmente responde DTO API, no fechas `Date` ni la estructura interna de UI. Esto acopla el store al contrato HTTP y puede romper expiraciones.

## Riesgo

Alto

## Recomendación

Crear un DTO explícito para refresh y mapper equivalente al login. Angular debe adaptar contratos, no convertir respuestas backend en estado interno sin normalización.

## Archivos involucrados

- `src/app/core/auth/auth.service.ts`
- `src/app/core/http/refresh-token-interceptor.ts`
- `src/app/core/models/http.model.ts`
- `src/app/core/models/auth.model.ts`

## Hallazgo

El dashboard home muestra métricas estáticas.

## Impacto

Los valores `Clientes 12`, `Recursos activos 37` y actividad placeholder pueden confundirse con datos reales. Esto contradice la regla de que Angular observa contratos.

## Riesgo

Medio

## Recomendación

Para Fase 1, reemplazar mock visual por estado derivado de `GET /me/tool-access` o por un empty state honesto. No agregar métricas hasta que el backend las exponga.

## Archivos involucrados

- `src/app/features/dashboard/home/home.component.ts`

## Hallazgo

La verificación de build está bloqueada por versión Node local.

## Impacto

No se puede confirmar `ng build --configuration=production` en este entorno aunque TypeScript pase. Esto bloquea validación completa de budgets, reemplazos de environment, empaquetado y compatibilidad CLI.

## Riesgo

Alto

## Recomendación

Actualizar runtime local/CI a Node `20.19+` o `22.12+`. Después ejecutar build producción y test runner Angular.

## Archivos involucrados

- `package.json`
- `angular.json`

## Bloqueos actuales

- Build producción no ejecutable con Node `18.18.2`.
- Contrato real de auth no confirmado: `/login` vs `/auth/login`, `/logout` vs `/auth/logout`.
- Falta contrato implementado para `GET /me/tool-access`.
- No hay servicio/modelo dedicado para tool access.

## Próximas fases sugeridas

1. Fase 1: confirmar contratos backend y alinear `API.auth`.
2. Fase 2: crear DTO + servicio read-only para `GET /me/tool-access`.
3. Fase 3: renderizar dashboard mínimo desde tool access.
4. Fase 4: revisar guards y roles solo como observación de contrato backend.
5. Fase 5: decidir qué hacer con registro, recursos y proyectos heredados.

## Orden recomendado de desarrollo

1. Actualizar Node y validar build.
2. Confirmar endpoints EVAAS Core.
3. Alinear auth sin cambiar UX.
4. Agregar `GET /me/tool-access` con tipado mínimo.
5. Sustituir mocks del dashboard por estado contractual.
6. Recién después evaluar recursos/proyectos/onboarding.
