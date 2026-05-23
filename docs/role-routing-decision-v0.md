# EVAAS Interface · Role routing decision v0

Fecha: 2026-05-23

## Decision

La navegacion post-login se decide con los roles ya normalizados en `UserSession.roles`.

```txt
ROLE_ADMIN tiene prioridad sobre ROLE_CLIENT.
```

Tabla de destino:

```txt
ROLE_ADMIN   -> /dashboard/admin
ROLE_CLIENT  -> /dashboard/client
ROLE_USER    -> /dashboard/client
ROLE_COMPANY -> /dashboard/client
desconocido  -> /dashboard/client
```

## Motivo

El bug observado no era de autorizacion backend. Era una decision visual de Angular: el login enviaba siempre a cliente sin mirar roles.

Angular debe observar el contrato autenticado para escoger landing page, pero no debe autorizar acciones sensibles.

## Rutas

La separacion minima queda bajo el mismo shell:

```txt
/dashboard/client
/dashboard/admin
```

`/client` queda solo como compatibilidad y redirige a `/dashboard/client`.

`/dashboard/admin` es un aterrizaje temporal sobre el componente legacy existente. No representa un panel admin nuevo ni habilita operaciones administrativas.

## Legacy

`ROLE_USER` y `ROLE_COMPANY` se consideran roles heredados compatibles con el destino cliente por ahora.

La razon es conservadora: `/dashboard/client` observa contratos `/me/*`; si el backend no permite esa sesion, debe responder con rechazo o ausencia de datos. No se inventa semantica administrativa para roles legacy.

## No decidido

No se agrega `RoleGuard` en esta decision. Las rutas documentan `data.roles`, pero la unica proteccion efectiva frontend sigue siendo sesion vigente con `authGuard`.

Un guard por rol puede agregarse despues, cuando existan capturas runtime del login real y una politica clara para usuarios sin rol reconocido.

## Archivos

- `src/app/core/auth/role-routing.ts`
- `src/app/features/auth/login/login.component.ts`
- `src/app/app.routes.ts`
- `src/app/features/dashboard/dashboard.routes.ts`
