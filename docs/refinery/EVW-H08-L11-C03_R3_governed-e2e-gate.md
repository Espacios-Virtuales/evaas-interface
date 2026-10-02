# EVW-H08-L11-C03-R3 · Gate E2E gobernado

Fecha: 2026-10-01 (America/Santiago)

## Referencias y alcance

| Repositorio | SHA inicial | SHA final | Resultado de cambios |
| --- | --- | --- | --- |
| Interface | `c263d0aa188766dae556f5e87d243ce3f0f21c66` | Commit local de esta evidencia, informado al cierre | Sólo este documento; el código verificado corresponde al `SOURCE_SHA` indicado abajo. |
| CORE | `0e129a0d7dd8fd2470be44fb68191a0ec592e0eb` | `0e129a0d7dd8fd2470be44fb68191a0ec592e0eb` | Sin cambios versionados. |

`BASE_SHA` de Interface: `c263d0aa188766dae556f5e87d243ce3f0f21c66`.
`SOURCE_SHA` de Interface (código C04/C05 bajo prueba): `c263d0aa188766dae556f5e87d243ce3f0f21c66`.
La rama de evidencia `codex/h08-l11-c03-r3-governed-e2e-gate` parte de ese SHA. El identificador del commit que incluye este archivo se entrega al cierre, porque el documento no puede contener su propio hash.

No se modificaron componentes, servicios, contratos, rutas, estilos, CORE ni fixtures. CORE conservó su SHA y árbol Git limpios antes y después de la ejecución.

## Controles de aislamiento

- `./scripts/h08-local-e2e.sh check`: **PASS**. El Compose renderizado usa exclusivamente el proyecto `ev_h08_l11_c02`, JDBC `db:5432/ev_h08_e2e`, red interna para CORE/PostgreSQL/Redis y un puente API ligado a `127.0.0.1:8091`. CORE no publica puertos directamente.
- Antes de levantar Compose, dos procesos con `--network none` fueron rechazados antes del datasource: perfil `e2e,prod` con `E2E requires the e2e profile alone`; JDBC `database.example.invalid` con `E2E refuses a nonlocal or unexpected database`.
- PostgreSQL 16 y Redis 7 estuvieron `healthy`. CORE inició con el único perfil `e2e`; su API aceptó los logins y solicitudes autenticadas del smoke y del navegador.
- Inspección runtime sanitizada: JDBC `jdbc:postgresql://db:5432/ev_h08_e2e`; Redis `redis`; `EV_MAIL_NO_OP=true`; `SPRING_MAIL_HOST` vacío; S2S y cliente LIORA externo deshabilitados; URL y token LIORA vacíos; `EV_SEED_ENABLED=false` y `EV_SEED_PILOT_ENABLED=false`. `MailConfiguration` provee un `JavaMailSender` no-op en perfil E2E.
- El contenedor CORE sólo estuvo conectado a la red Docker `internal`, sin puerto publicado. La red reportó `Internal=true`; sólo el sidecar de loopback ofreció `127.0.0.1:8091`.
- Los fixtures se verificaron con una consulta de sólo lectura, sin extraer datos de destinatarios: `h08-e2e-liora`, `h08-e2e-historical` y `h08-e2e-asariel` estaban en `DRAFT_REQUESTED` y `recipient_address` vacío. Son registros sintéticos de la cápsula local; no se agregaron credenciales reales, endpoints de seeding ni datos productivos.

## API y aislamiento

`python3 scripts/h08-e2e-smoke.py`: **PASS**. La llamada anónima protegida devolvió `401`; funcionaron por separado el login de `admin@h08-e2e.local` y `client@h08-e2e.local`; el administrador vio Alpha y Beta, y el cliente independiente sólo Alpha. La evidencia LIORA del cliente quedó en Alpha y vacía para Beta. El Resource de fixture estuvo presente. El smoke no envió PATCH ni notificaciones.

## Navegador autenticado

Chrome headless usó un perfil temporal, inició sesión mediante el formulario ordinario como administrador y limitó la resolución DNS a loopback. El login emitió `OPTIONS /auth/login` y `POST /auth/login`, ambos `200`. La sesión mostró `ROLE_ADMIN`.

| Flujo | Resultado observado |
| --- | --- |
| Redirect `/dashboard/admin/access` | La URL final fue `/dashboard/admin/instruments`; se mostró **Instrumentos** y no apareció `NG04014`. |
| Destino administrativo directo | `/dashboard/admin/instruments` permaneció accesible con la misma sesión que contiene `ROLE_ADMIN`. |
| Organización | Desde la lista se abrió Alpha (`/dashboard/admin/organizations/1`) mediante el enlace de UI. No solicitó `/api/v1/me/instruments/liora/evidence` durante esa navegación. |
| Detalle LIORA | Desde el catálogo se abrió el detalle por UI. Hubo exactamente un `GET /api/v1/me/instruments/liora/evidence` → `200`. Alpha mostró sólo `h08-e2e-liora`, estado `DRAFT_REQUESTED`; no apareció `h08-e2e-historical` ni ASARIEL. Beta tuvo `evidence: []` y el estado vacío visible. |
| Lista administrativa de Resource | `/dashboard/admin/resources` mostró `H08_E2E_RESOURCE`; `GET /admin/resources` → `200`, ID `1`, estado inicial `PLANNED`. No apareció `valueFromKeys is not a function`. |
| Detalle de Alpha y transición | Desde el detalle de Alpha se realizaron las dos transiciones de estado mediante el modal de UI. El Resource se mantuvo visible con cada respuesta. |
| Confirmación final | La vista administrativa volvió a obtener `GET /admin/resources` → `200`; respuesta y fila mostraron `H08_E2E_RESOURCE`, ID `1`, `PLANNED`. Una lectura final de base confirmó `1|H08_E2E_RESOURCE|PLANNED`. |

Transiciones observadas en red y respuesta de CORE:

| Orden | Request | HTTP | Estado de respuesta | Estado visible en UI |
| --- | --- | --- | --- | --- |
| 1 | `PATCH /admin/resources/1/status` (`MAINTENANCE`) | `200` | `MAINTENANCE`, key `H08_E2E_RESOURCE` | `MAINTENANCE` |
| 2, restauración | `PATCH /admin/resources/1/status` (`PLANNED`) | `200` | `PLANNED`, key `H08_E2E_RESOURCE` | `PLANNED` |

La red del navegador registró exactamente esos dos PATCH de estado. No hubo otras mutaciones de Resource.

### Consola y red

En la pasada final estabilizada: consola con cero `console.error` y cero excepciones no capturadas; cero respuestas HTTP 4xx/5xx inesperadas; cero solicitudes locales fallidas. No hubo respuesta ni contacto con servicios externos. La hoja de estilos existente intentó cargar fuentes desde `fonts.googleapis.com`; Chrome bloqueó esos intentos en la resolución DNS (`net::ERR_NAME_NOT_RESOLVED`), sin respuesta HTTP. LIORA externo, S2S y SMTP permanecieron deshabilitados.

Una primera pasada del harness navegó fuera del catálogo antes de completar un `GET /admin/instruments` y observó `net::ERR_ABORTED`; se añadió espera de finalización y se repitieron las validaciones de sólo lectura sin cancelaciones locales. La pasada funcional posterior completó correctamente las dos mutaciones autorizadas y la restauración. No se observó error de Angular ni respuesta HTTP de error.

## Pruebas y build

| Repositorio | Comando | Resultado |
| --- | --- | --- |
| CORE | `env JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn clean verify` | `BUILD SUCCESS`, cero fallos/errores/omitidas. El resumen del módulo `ev-api` fue **431/0**; `ev-integrations` ejecutó 19 pruebas adicionales, también **0** fallos. Total de reportes XML del reactor: **450 pruebas, 0 fallos**. |
| Interface | `npm test -- --watch=false` | **139 éxitos, 2 fallas / 141**. Las únicas fallas son las dos heredadas autorizadas: `ObjectCardComponent should create` y `ObjectsGridComponent should create`. |
| Interface | `npm run build -- --configuration=production` | **PASS**. La opción `production` se pasó dos veces porque el script build ya la define. Se registraron warnings de budgets existentes: bundle inicial 871.97 kB frente a 500 kB; SCSS de detalle de organización 7.69 kB frente a 4 kB; SCSS de lista de organizaciones 4.23 kB frente a 4 kB. |
| Interface | `git diff --check HEAD~1 HEAD` | **PASS** después de guardar esta evidencia. |

## Limpieza y exclusiones

`./scripts/h08-local-e2e.sh destroy` eliminó los cuatro contenedores, las dos redes y el volumen E2E. Las consultas posteriores filtradas de `docker ps -a`, `docker network ls` y `docker volume ls` no devolvieron recursos. UI y Chrome se detuvieron; se borraron los perfiles y el harness temporales. Los puertos locales `4200` y `8091` devolvieron `000` después de la limpieza.

No se accedió a producción, VPS ni Vercel. No hubo despliegue, push, merge, notificaciones, envíos SMTP, llamadas LIORA externas ni tráfico S2S. La única escritura de aplicación fueron los dos PATCH de Resource descritos y la segunda restauró el estado original `PLANNED`.

```text
PASSED_E2E_GATE
```
