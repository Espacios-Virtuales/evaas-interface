# EVW-H08-L11-C03 · Gate E2E gobernado de H08

Fecha: 2026-09-30 (America/Santiago). Decisión: **FAILED_E2E_GATE**. Este gate sólo evalúa la eventual integración conjunta a `develop`; no habilita `main`, despliegue ni producción.

## Bases, ramas y alcance

| Repositorio | Rama base C02 | SHA base | Rama C03 | SHA final |
| --- | --- | --- | --- | --- |
| CORE | `codex/core-h08-l11-c02-local-e2e-environment` | `0e129a0d7dd8fd2470be44fb68191a0ec592e0eb` | `codex/core-h08-l11-c03-governed-e2e-gate` | `0e129a0d7dd8fd2470be44fb68191a0ec592e0eb` |
| Interface | `codex/h08-l11-c02-local-e2e-environment` | `44884f379a621fd1ee7aaf1d978e8db8c38fa46e` | `codex/h08-l11-c03-governed-e2e-gate` | `44884f379a621fd1ee7aaf1d978e8db8c38fa46e` |

Las dos ramas C02 estaban limpias al iniciar. Interface conserva `c7573451a707e31a09a7a5d01a6d0bb98cfee55c` de L11-C01 en su historia. Los SHA finales coinciden con las bases porque el gate falló y no se ejecutó el commit condicionado al éxito; este documento es el único cambio de trabajo en Interface.

## Topología y preflight

Se usaron `./scripts/h08-local-e2e.sh check`, `up`, `status` y `destroy` en CORE, y `bash scripts/h08-local-e2e-ui.sh` en Interface. El guard del Compose renderizado pasó antes de levantar servicios. CORE arrancó únicamente con `SPRING_PROFILES_ACTIVE=e2e`; PostgreSQL 16 y Redis 7 estuvieron healthy. CORE, PostgreSQL y Redis estuvieron en la red Docker `internal`, sin ruta de salida. El único puente publicó `127.0.0.1:8091`; la UI sirvió en `127.0.0.1:4200`. SMTP fue vacío/no-op; LIORA externo, S2S y seed piloto estuvieron deshabilitados. No hubo cuentas reales ni destinos externos.

La instancia efímera de CORE ejecutada con `--network none` y `SPRING_PROFILES_ACTIVE=e2e,prod` terminó antes de crear datasource con `E2E requires the e2e profile alone`. Una segunda instancia sin red, con JDBC hacia `database.example.invalid`, terminó en el mismo guard con `E2E refuses a nonlocal or unexpected database`. Ambas pruebas negativas devolvieron código de proceso 1 por rechazo esperado. El smoke local confirmó los fixtures Alpha, Beta y `H08_E2E_RESOURCE`.

## Matriz del gate

| Comprobación | Resultado | Evidencia sanitizada |
| --- | --- | --- |
| Bases C02 limpias y traza C01 | PASS | SHA y ramas de la tabla; C01 presente en `git log`. |
| Aislamiento local, perfil, puertos e integraciones | PASS | Guard Compose, `status` con cuatro servicios E2E; API sólo mediante loopback. |
| Rechazo de JDBC remoto y perfil `e2e,prod` antes del datasource | PASS | Excepciones de `E2eEnvironmentGuard` durante `EnvironmentPostProcessor`; sin red en ambos procesos. |
| Login real de administrador en Chrome | PASS | `POST /auth/login` → 200; sesión local `ROLE_ADMIN` con expiración futura, sin imprimir credencial ni token. |
| Navegación de Organización y ausencia de lectura LIORA | BLOCKED | Angular abortó la navegación antes de renderizar la vista; no hubo request de evidencia durante el intento. No se puede afirmar el comportamiento de la vista. |
| Detalle LIORA: única lectura y presentación segura | BLOCKED | El árbol de rutas no cargó; sin lectura desde esa pantalla. La proyección de API sí pasó en el smoke, pero no sustituye el gate de navegador. |
| Resource: abrir sin GET de detalle, PATCH y restauración por UI | BLOCKED | La vista no cargó; no hubo GET de detalle ni PATCH. Estado inicial y final comprobado por lectura local: `PLANNED`. |
| Evidencia anónima | PASS | `GET /api/v1/me/instruments/liora/evidence` sin credenciales → 401. |
| Cliente E2E independiente | PASS | Login local → 200; lectura autenticada → 200; sólo Alpha, con `h08-e2e-liora`; Beta y otras organizaciones ausentes. |
| Administrador, proyección de API | PASS | Lectura autenticada → 200; Alpha y Beta; Alpha sólo `h08-e2e-liora`; Beta `evidence: []`; sin `h08-e2e-historical` ni `h08-e2e-asariel`. |
| Consola y respuestas HTTP inesperadas en el flujo UI | FAIL | Chrome informó `NG04014` al cargar rutas administrativas. El login fue 200; la UI no llegó a emitir las lecturas operacionales, por lo que tampoco se puede cerrar la comprobación de 4xx/5xx de esas vistas. |
| CORE `mvn clean verify` con JDK 17 | PASS | 431 pruebas, 0 fallos, 0 errores, 0 omitidas; `BUILD SUCCESS`. |
| Interface `npm test -- --watch=false --browsers=ChromeHeadless` | PASS | 131 ejecutadas: 129 éxitos y sólo las dos fallas heredadas autorizadas abajo. |
| Interface `npm run build` | PASS | Bundle generado; únicamente warnings de budgets existentes. |
| Destrucción y limpieza E2E | PASS | `destroy` eliminó cuatro contenedores, dos redes y el volumen; filtros posteriores de contenedores, redes y volúmenes vacíos. |

## Evidencia de navegador y bloqueo

Chrome abrió `http://127.0.0.1:4200/auth/login` y envió el login ordinario a `http://localhost:8091/auth/login` (200). La sesión del administrador quedó guardada. Al navegar a `/dashboard`, `/dashboard/admin/organizations` y las demás vistas administrativas, el `router-outlet` quedó vacío. La consola repitió:

```text
NG04014: Invalid configuration of route 'dashboard/admin/access': redirectTo and canActivate cannot be used together.
```

La definición de esa ruta ya está en la rama base C02. No se modificó porque C03 sólo valida y documenta. El error impide constatar desde la UI la ausencia de evidencia en Organización, la lectura única y el contenido de LIORA, y la transición de Resource. No se atribuye PASS a esos requisitos a partir de pruebas de API.

La solicitud autenticada segura del smoke usó sesiones independientes de administrador y cliente. Se registraron sólo códigos y forma de respuesta: administrador `{Alpha: [h08-e2e-liora], Beta: []}`; cliente `{Alpha: [h08-e2e-liora]}`. La proyección visible en la API incluye referencias y estado; la comprobación de que la UI no muestra cuerpos, destinatarios, secretos, tokens o datos de envío queda bloqueada por `NG04014`.

## Resource y regresión

`H08_E2E_RESOURCE` comenzó en `PLANNED` según el fixture. El bloqueo de rutas ocurrió antes de abrir el detalle; no se envió `PATCH /admin/resources/{id}/status`. Una lectura autenticada local posterior de `/admin/resources` (200) devolvió `PLANNED`. Por tanto, no hubo transición que restaurar mediante UI. El volumen E2E fue destruido al finalizar.

El primer intento de `mvn clean verify` dentro del sandbox tuvo cinco errores de Testcontainers por falta de acceso al socket Docker. Se repitió el mismo comando con acceso al Docker local y terminó `BUILD SUCCESS`; ese primer resultado fue una restricción del ejecutor, no un fallo funcional del repositorio.

Deudas heredadas de Interface, permitidas por este gate:

- `ObjectsGridComponent should create`: falta el provider de `HttpClient` en el test.
- `ObjectCardComponent should create`: el dato `icon` es indefinido en el test.

Falla bloqueante detectada por C03: la configuración de la ruta existente `dashboard/admin/access` provoca `NG04014` al iniciar el árbol de dashboard. Las rutas administrativas no renderizan y el gate real de navegador no puede completarse. No hubo fallas adicionales en la suite de Interface.

## Limpieza y decisión

La UI y Chrome headless se detuvieron. `./scripts/h08-local-e2e.sh destroy` eliminó contenedores, red interna, red de puente y volumen E2E; `docker ps -a`, `docker network ls` y `docker volume ls` filtrados por el proyecto devolvieron vacío. No hubo acceso a producción, VPS, Vercel ni API externa; tampoco notificaciones, SMTP, S2S, Gmail, WhatsApp, LIORA externa, push, merge o despliegue.

```text
FAILED_E2E_GATE
```

No se autoriza la integración conjunta a `develop` con este resultado.
