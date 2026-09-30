# EVW-H08-L11-C03-R2 · Repetición del gate E2E gobernado

Fecha: 2026-09-30 (America/Santiago). Decisión: **FAILED_E2E_GATE**. Esta repetición conserva como traza el fallo anterior de C03 registrado en `606692a` y parte de la reparación de router `e15ddbd5bce1e137a7b11eb514a82b954f54aa71`. El gate sólo puede habilitar una futura integración conjunta a `develop`; no autoriza `main`, despliegue ni producción.

## Bases y alcance

| Repositorio | Rama utilizada | SHA inicial | Cambios de producto |
| --- | --- | --- | --- |
| CORE | `codex/core-h08-l11-c02-local-e2e-environment` | `0e129a0d7dd8fd2470be44fb68191a0ec592e0eb` | Ninguno; SHA final igual. |
| Interface | `codex/h08-l11-c03-r2-governed-e2e-gate`, desde `codex/h08-l11-c04-fix-admin-access-redirect` | `e15ddbd5bce1e137a7b11eb514a82b954f54aa71` | Ninguno; sólo este registro documental. |

Ambos árboles estaban limpios antes de iniciar. La historia de Interface conserva C03 fallido y C04. El SHA final de Interface es el commit local que contiene este documento y se entrega junto al cierre; un documento no puede contener su propio hash de commit.

## Preflight y aislamiento

`./scripts/h08-local-e2e.sh check` validó el Compose renderizado antes de `up`: perfil CORE exclusivamente `e2e`, JDBC `db:5432/ev_h08_e2e`, red interna de CORE/PostgreSQL/Redis sin salida, API sin publicación directa y puente único en `127.0.0.1:8091`. PostgreSQL 16 y Redis 7 estuvieron healthy; Interface sirvió en `127.0.0.1:4200`. SMTP estuvo vacío/no-op; S2S, LIORA externo y seed piloto deshabilitados. Chrome bloqueó resolución de hosts externos.

Dos procesos efímeros de la imagen CORE con `--network none` confirmaron que `E2eEnvironmentGuard` rechaza `SPRING_PROFILES_ACTIVE=e2e,prod` (`E2E requires the e2e profile alone`) y un JDBC a `database.example.invalid` (`E2E refuses a nonlocal or unexpected database`). Ambos abortaron durante `EnvironmentPostProcessor`, antes de crear datasource. El smoke local confirmó Alpha, Beta y `H08_E2E_RESOURCE`.

## Matriz del gate

| Comprobación | Estado | Evidencia sanitizada |
| --- | --- | --- |
| Base limpia, C03/C04 preservados | PASS | SHA y ramas arriba; C03 `606692a` y corrección C04 `e15ddbd` en la historia. |
| Topología, integraciones deshabilitadas y guards negativos | PASS | `check`, `status` y los dos rechazos previos al datasource. |
| Login admin y router | PASS | `POST /auth/login` → 200; `/dashboard/admin/access` redirigió a `/dashboard/admin/instruments`, encabezado Instrumentos visible, sin `NG04014`. |
| Organización | PASS | Desde la lista se abrió Alpha en `/dashboard/admin/organizations/1`; sin evidencia comunicacional visible ni `GET /api/v1/me/instruments/liora/evidence` en esa navegación. |
| LIORA gobernado | PASS | Detalle real `/dashboard/admin/instruments/comunicador`; exactamente un GET de evidencia → 200. Alpha sólo `h08-e2e-liora`; Beta `evidence: []`; ausentes las acciones histórica y ASARIEL. No se mostraron cuerpos, destinatarios, tokens, secretos ni datos de envío. Sin 4xx/5xx en ese flujo. |
| Lista administrativa de Resource | FAIL | `GET /admin/resources` → 200, pero no renderizó filas; consola: `TypeError: this.valueFromKeys is not a function` en `AdminResourcesListComponent.trackResource`. |
| Resource por detalle operacional de Alpha | PASS | Se abrió `H08_E2E_RESOURCE` sin GET de detalle por ID. La UI cambió `PLANNED → MAINTENANCE → PLANNED` con exactamente dos `PATCH /admin/resources/1/status` → 200; cada respuesta de CORE y la UI mostraron el estado esperado. Lectura local final → 200, `PLANNED`. |
| Aislamiento anónimo | PASS | GET de evidencia sin credenciales → 401. |
| Cliente E2E independiente | PASS | Login local y GET de evidencia → 200; sólo Alpha con `h08-e2e-liora`; Beta y cualquier otra organización ausentes. |
| CORE `mvn clean verify`, JDK 17 | PASS | 431 pruebas, 0 fallos, 0 errores, 0 omitidas; `BUILD SUCCESS`. |
| Interface `npm test -- --watch=false --browsers=ChromeHeadless` | PASS | 135 éxitos, sólo las dos fallas heredadas permitidas abajo. |
| Interface `npm run build` | PASS | Bundle generado; sólo warnings de budgets ya existentes. |
| Limpieza final | PASS | `destroy` retiró cuatro contenedores, dos redes y el volumen E2E; filtros posteriores vacíos. |

## Navegador, red y restauración

Chrome usó la UI local y la sesión ordinaria del administrador E2E. En Organización no se solicitó el endpoint LIORA. Desde el catálogo se abrió el detalle LIORA; la respuesta gobernada quedó sanitizada como `{Alpha: [h08-e2e-liora], Beta: []}` y el DOM mostró ambas organizaciones, incluida la leyenda de evidencia vacía para Beta. Se observó un único GET a `/api/v1/me/instruments/liora/evidence` con HTTP 200.

La ruta `/dashboard/admin/resources` emitió `GET /admin/resources` con HTTP 200, pero `trackResource` perdió el contexto `this` durante `*ngFor` y lanzó `TypeError: this.valueFromKeys is not a function`; el `tbody` permaneció vacío. El error se registró y no se alteró código funcional. La vista operacional existente del detalle de Alpha sí mostró el Resource y permitió completar la interacción por UI:

| Paso | Request de mutación | Estado devuelto por CORE | Estado visible en UI |
| --- | --- | --- | --- |
| Inicial y apertura de detalle | Ninguno; sin GET `/admin/resources/{id}` | `PLANNED` en colección | `PLANNED` |
| Cambio | `PATCH /admin/resources/1/status` con `MAINTENANCE` → 200 | `MAINTENANCE`, key `H08_E2E_RESOURCE` | `MAINTENANCE` |
| Restauración | `PATCH /admin/resources/1/status` con `PLANNED` → 200 | `PLANNED`, misma key | `PLANNED` |
| Confirmación posterior | GET local de `/admin/resources` → 200 | `PLANNED` | Sin cambio posterior |

La única mutación observada fue el endpoint de estado contratado, dos veces. Las lecturas adicionales posteriores a cada PATCH fueron la actualización de la colección de Resource de Alpha, no una lectura de detalle no contratada. No hubo respuestas HTTP 4xx/5xx inesperadas. El error de consola de la lista administrativa bloquea el gate aunque el flujo alternativo de Resource y la restauración hayan pasado.

## Regresión, deuda y cierre

Las únicas dos fallas de la suite de Interface fueron las de base autorizadas: `ObjectsGridComponent should create` (provider de `HttpClient` ausente) y `ObjectCardComponent should create` (`icon` indefinido). La falla nueva observada por navegador es `AdminResourcesListComponent.trackResource`; no está cubierta por esas excepciones y requiere reparación antes de repetir el gate. CORE y build de Interface pasaron.

Se detuvieron UI y Chrome. `./scripts/h08-local-e2e.sh destroy` eliminó contenedores, redes y volumen del proyecto; `docker ps -a`, `docker network ls` y `docker volume ls` filtrados devolvieron vacío. No hubo producción, VPS, Vercel, APIs externas, SMTP, S2S, Gmail, LIORA externo, notificaciones, push, merge ni despliegue. No se agregaron endpoints, rutas, mocks, servicios, migraciones o cambios funcionales.

```text
FAILED_E2E_GATE
```

La integración conjunta a `develop` no queda habilitada por esta ejecución.
