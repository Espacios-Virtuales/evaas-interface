# EVAAS Interface · Fase 2B-Audit · Roles, routing y redireccion

Fecha: 2026-05-23

## Regla

Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

Angular si puede usar roles autenticados para navegacion visual, seleccion de vista y routing asistido.

## 1. Login response observado por Angular

El contrato que consume `AuthService.login()` es `AuthResponse`:

```ts
{
  token: string;
  username: string;
  role: Role[];
  issuedAt: string;
  refreshToken: string;
  refreshExpiresIn: number;
  message: string;
}
```

Cada `Role` esperado por Angular tiene esta forma:

```ts
{
  id: number;
  roleEnum: string;
  privileges: { id: number; type: string }[];
}
```

Ubicacion:

- `src/app/core/models/http.model.ts`
- `src/app/core/models/auth.model.ts`
- `src/app/core/auth/auth.mapper.ts`

Campos revisados:

- `roles`: no se consume como campo raiz.
- `authorities`: no se consume.
- `privileges`: no se consume como campo raiz; se deriva desde `role[].privileges[].type`.
- `user.roles`: no se consume.
- token claims: se decodifica el JWT, pero solo se usa `exp` para `accessTokenExp`.
- JWT payload tipado: `iss`, `sub`, `jti`, `ver`, `iat`, `exp`.
- profile response: no existe llamada de perfil para roles en el flujo post-login actual.

No se encontro captura runtime versionada del payload real de desarrollo dentro del repositorio. El contrato real que Angular observa hoy es el DTO anterior y su mapper.

## 2. AuthService / AuthStore

`AuthService.login()` llama `POST /auth/login`, mapea la respuesta con `mapAuthResponseToSession()` y guarda la sesion en `AuthStore`.

`AuthStore` persiste la sesion completa en `localStorage` bajo la clave `session`.

La sesion interna queda asi:

```ts
{
  email: res.username,
  roles: res.role.map(r => r.roleEnum),
  privileges: res.role.flatMap(r => r.privileges).map(p => p.type),
  accessToken: res.token,
  accessTokenExp: from jwt exp,
  refreshToken: res.refreshToken,
  refreshExp: issuedAt + refreshExpiresIn,
  loginAt: issuedAt
}
```

Por lo tanto:

- `ROLE_ADMIN` llega a Angular solo si viene como `role[].roleEnum`.
- `ROLE_CLIENT` llega a Angular solo si viene como `role[].roleEnum`.
- `ROLE_USER` y `ROLE_COMPANY` pueden seguir llegando como compatibilidad legacy.
- Antes de esta auditoria, ningun rol era considerado para decidir la ruta post-login.

## 3. Guards y RBAC

Existe `authGuard`:

- valida solo `store.isLoggedIn()`;
- redirige a `/login` si no hay sesion vigente;
- no valida roles.

No se encontro `RoleGuard`, `CanActivateFn` por rol ni guard que lea `route.data.roles`.

Existe `HasRoleDirective`:

- usa `AuthStore.roles()`;
- muestra u oculta contenido localmente;
- no es seguridad.

## 4. Routing actual

Rutas de nivel app:

```txt
/                 -> /login
/login            -> LoginComponent
/register         -> RegisterComponent
/client           -> redirect /dashboard/client
/dashboard        -> DashboardShellComponent
/**               -> /login
```

Rutas bajo `/dashboard`:

```txt
/dashboard
/dashboard/client
/dashboard/admin
/dashboard/resources
/dashboard/projects
```

`/dashboard/client` carga la pantalla cliente existente dentro del shell de dashboard.

`/dashboard/admin` existe como aterrizaje temporal y reutiliza `HomeComponent`. No es panel admin funcional y no agrega capacidades administrativas.

## 5. Sidebar / nav existente

El sidebar actual pertenece a `DashboardShellComponent`.

Items actuales:

- marca y resumen navegan a `/dashboard`;
- recursos navega a `/dashboard/resources` y se muestra solo con `*hasRole="'ROLE_USER'"`;
- proyectos navega a `/dashboard/projects` sin condicion de rol.

No existe item explicito para `/dashboard/client` ni `/dashboard/admin` en esta fase. No se duplico layout.

## 6. Causa del bug

El administrador era redirigido a cliente por un destino hardcodeado post-login:

```ts
this.router.navigate(['/', PATHS.client])
```

Archivo causante:

- `src/app/features/auth/login/login.component.ts`

Ese destino llevaba a `/client`, ruta protegida solo por sesion y sin interpretacion de roles.

## 7. Cambio minimo aplicado

Se agrego `dashboardRouteForSession()`:

```txt
ROLE_ADMIN  -> /dashboard/admin
ROLE_CLIENT -> /dashboard/client
ROLE_USER   -> /dashboard/client
ROLE_COMPANY -> /dashboard/client
sin rol conocido -> /dashboard/client
```

Si existen multiples roles, `ROLE_ADMIN` tiene prioridad sobre `ROLE_CLIENT`.

Archivos tocados:

- `src/app/core/auth/role-routing.ts`
- `src/app/features/auth/login/login.component.ts`
- `src/app/app.routes.ts`
- `src/app/features/dashboard/dashboard.routes.ts`

## 8. Que no tocar todavia

- No construir grillas nuevas.
- No crear panel admin funcional.
- No eliminar compatibilidad `ROLE_USER` / `ROLE_COMPANY`.
- No convertir la directiva `hasRole` en mecanismo de autorizacion.
- No conectar recursos nuevos ni endpoints administrativos a la UI.
- No refactorizar masivamente el dashboard legacy.

## 9. Riesgos abiertos

`route.data.roles` esta documentado en rutas, pero aun no hay `RoleGuard`. Esto es intencional para no bloquear rutas por frontend antes de estabilizar contrato backend. Si se agrega guard en una fase futura, debe redirigir sin loops y mantener al backend como autoridad final.

Falta una captura runtime del payload real de `POST /auth/login` con usuario admin y usuario cliente. La auditoria confirma el contrato que Angular consume, no una muestra viva de credenciales.
