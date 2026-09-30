# EVW-INTERFACE-H08-L11-C04 · Reparación de redirect administrativo inválido

Fecha: 2026-09-30 (America/Santiago). Base: `codex/h08-l11-c03-governed-e2e-gate` en `606692a0762f64fb601ef3617e37839b84735a76`. Rama de trabajo: `codex/h08-l11-c04-fix-admin-access-redirect`. El árbol estaba limpio antes de crearla.

## Causa y reparación

La entrada `dashboard/admin/access` tenía simultáneamente `redirectTo: '/dashboard/admin/instruments'` y `canActivate: [accessContextGuard]`. Angular rechaza esa combinación al configurar el router con `NG04014`, incluso si se navega a otra ruta del dashboard. Se eliminó `canActivate` **sólo de esa entrada de redirect**. Se conservaron el path, `pathMatch: 'full'`, el destino y el dato de rol.

| Lugar | Antes | Después |
| --- | --- | --- |
| Padre `/dashboard` | `canMatch: [authGuard]` | Igual; exige sesión. |
| Alias `/dashboard/admin/access` | Redirect a `/dashboard/admin/instruments` y `canActivate: [accessContextGuard]` | Mismo redirect, sin `canActivate`. |
| Destino `/dashboard/admin/instruments` | `data.roles: ['ROLE_ADMIN']` y `canActivate: [accessContextGuard]` | Igual; comprueba el contexto real y el rol de administrador. |

El destino efectivo sigue siendo la vista existente de Instrumentos. Un usuario con `ROLE_ADMIN` llega allí; uno autenticado sin ese rol es enviado por el guard del destino a su ruta contextual; el anónimo es detenido antes por `authGuard` del padre y enviado a `/login`. La navegación directa al destino usa los mismos guards.

## Evidencia de regresión

La prueba de rutas usa `RouterTestingHarness` con la configuración real de redirect y guards, componentes de pantalla vacíos y contexto de acceso en memoria. No consulta una API. Verifica construcción y navegación sin `NG04014`, alias para admin, denegación para no-admin y anónimo, y acceso directo al destino. Su ejecución aislada terminó **9/9 PASS**.

`npm test -- --watch=false --browsers=ChromeHeadless`: **135 éxitos, 2 fallas heredadas** entre 137 pruebas. Las únicas fallas fueron exactamente `ObjectsGridComponent should create` (provider de `HttpClient` ausente) y `ObjectCardComponent should create` (dato `icon` indefinido), ya registradas en L11-C03. No hubo fallas nuevas. `npm run build`: **PASS**, con los warnings de budgets preexistentes. `git diff --check`: **PASS**.

## Navegador E2E local

Se reutilizaron `./scripts/h08-local-e2e.sh check` y `up` de L11-C02. El guard del Compose pasó; CORE permaneció en perfil `e2e`, con PostgreSQL y Redis en la red Docker interna, salida y destinos externos deshabilitados, API en `127.0.0.1:8091` y UI en `127.0.0.1:4200`. Chrome headless bloqueó la resolución de hosts externos.

Una sesión real inició como `admin@h08-e2e.local`: `OPTIONS /auth/login` y `POST /auth/login` devolvieron 200. Al navegar a `/dashboard/admin/access`, la URL final fue `/dashboard/admin/instruments`; se renderizó el encabezado **Instrumentos** y apareció LIORA en el catálogo. Las solicitudes locales de contexto y catálogo (`/me/access-context`, `/api/v1/me/contextual-projection`, `/admin/instruments`) devolvieron 200. No hubo respuestas HTTP 4xx/5xx inesperadas ni errores de consola. No se imprimieron contraseñas, tokens ni cabeceras de autorización.

La UI y Chrome se detuvieron. `./scripts/h08-local-e2e.sh destroy` eliminó los cuatro contenedores, las dos redes y el volumen E2E. Las consultas filtradas de `docker ps -a`, `docker network ls` y `docker volume ls` devolvieron vacío.

## Alcance y decisión

La reparación no creó una vista de Access ni cambió rutas públicas, roles, guards compartidos, endpoints, servicios, componentes o contratos API. No se repitió el gate completo de LIORA ni Resource; corresponde a una nueva ejecución de L11-C03. No hubo cambios en CORE, producción, notificaciones, push, merge ni despliegue.

```text
READY_TO_REPEAT_L11_C03
```
