# EVW-H08-L11-C01 · Validación E2E gobernada y gate de promoción conjunta

Fecha: 2026-09-29, America/Santiago.

## Bases y preflight

| Repositorio | Rama inicial | HEAD = origin/develop tras fetch y pull --ff-only |
| --- | --- | --- |
| CORE `ev-ecosystem-api` | `develop` | `21caf700d237d0799f1c6fbc6e6a496bcf1830c2` |
| `evaas-interface` | `develop` | `1e9c5c7948c0f1de195b86ac0dfa86a2f7a44c8b` |

Ambos árboles estaban limpios. La evidencia se registra en `codex/h08-l11-c01-governed-e2e-release-gate`, creada desde el SHA de Interface indicado. CORE permanece en `develop` sin cambios de fuente.

## Ambiente y autenticación

Se usó desarrollo local para builds y pruebas aisladas. Interface configura `http://localhost:8091`; `GET /api/v1/me/instruments/liora/evidence` en ese origen no conectó (`curl` código 7, HTTP 000). No hay contenedor CORE activo. No se arrancó CORE contra una base de datos de procedencia no verificada. No se identificaron usuarios de prueba ni Resource fixture local/QA expresamente autorizado. Producción no se usó.

Autenticación disponible: pruebas CORE con identidades de prueba en MockMvc y PostgreSQL efímero de Testcontainers; pruebas Interface con dobles de `MeService` y `HttpTestingController`. No hubo sesión integrada de navegador ni token local/QA. No se exponen secretos.

## Regresión

| Repositorio | Comando | Resultado |
| --- | --- | --- |
| CORE, JDK 17, desde `ev-root` | `mvn -pl ev-api,ev-integrations -am test` | PASS: `ev-integrations` 19/19; `ev-api` 431/431; `BUILD SUCCESS`. Primera ejecución bloqueada por Docker en sandbox; repetición con Docker disponible pasó. |
| CORE, JDK 17, desde `ev-root` | `mvn -pl ev-api -am package -DskipTests` | PASS: `BUILD SUCCESS`. |
| Interface | `npm test -- --watch=false` | 131 pruebas: 129 PASS y exactamente 2 FAIL heredados: `ObjectsGridComponent should create`, `ObjectCardComponent should create`; ninguna falla nueva. |
| Interface | `npm run build` | PASS; advertencias de presupuesto de bundle inicial y dos SCSS. |

Las dos fallas de Interface están documentadas en `docs/refinery/EVW-UI-H02-L03_CIERRE.md`; son deuda heredada no bloqueante para este gate porque nombre y cantidad coinciden exactamente.

## Matriz

`PASS` en respaldo significa prueba existente aprobada o inspección de código; `BLOCKED` en E2E significa que no se observó el flujo CORE + Interface con sesión y datos seguros. Los tests aislados no sustituyen el E2E.

| Comprobación | Respaldo | E2E integrado |
| --- | --- | --- |
| Organización no solicita ni renderiza evidencia LIORA | PASS: inspección de `AdminOrganizationDetailComponent`; la proyección LIORA se consume en detalle de Instrumento. | BLOCKED: sin sesión local/QA. |
| Instrumento LIORA usa sólo `GET /api/v1/me/instruments/liora/evidence` | PASS: `MeService` prueba método, URL exacta, ausencia de selectores y cuerpo; componente invoca ese servicio. | BLOCKED: sin tráfico de navegador contra CORE. |
| Organizaciones habilitadas siguen visibles con evidencia vacía | PASS: prueba de componente e integración PostgreSQL. | BLOCKED: sin sesión/datos seguros. |
| UI conserva orden de CORE | PASS: prueba de componente y orden estable del servicio en PostgreSQL. | BLOCKED: sin sesión/datos seguros. |
| No muestra secretos, cuerpos, destinatarios ni tokens | PASS: serialización CORE excluye campos sensibles; prueba de componente verifica texto visible. | BLOCKED: sin navegador conectado. |
| Anónimo recibe 401 | PASS: `L09MeLioraEvidenceControllerSecurityTest` comprueba 401 y cero llamadas al servicio. | BLOCKED: no hubo respuesta HTTP local. |
| Administrador ve organizaciones habilitadas | PASS: integración PostgreSQL cubre accesos habilitados y suspendidos. | BLOCKED: sin administrador de prueba integrado. |
| Usuario ve sólo organizaciones con membresía activa | PASS: integración PostgreSQL cubre estados activo, suspendido, revocado y eliminado. | BLOCKED: sin usuario de prueba integrado. |
| Excluye acciones sin `instrument_id` y de otro instrumento | PASS: fixture PostgreSQL incluye ambos y comprueba la proyección. | BLOCKED: sin datos seguros integrados. |
| Selección de Resource reutiliza lectura existente | PASS: inspección de detalle y contrato L10: `GET /admin/resources`, selección en memoria. | BLOCKED: sin tráfico integrado. |
| Cambio de estado usa sólo `PATCH /admin/resources/{id}/status` | PASS: `AdminResourceService` prueba método, ruta y cuerpo; modal invoca ese servicio. | BLOCKED_BY_MISSING_SAFE_FIXTURE: no se emitió PATCH. |
| Estados válidos: `PLANNED`, `ACTIVE`, `MAINTENANCE`, `DISABLED` | PASS: pruebas de modal y servicio cubren exactamente los cuatro. | BLOCKED_BY_MISSING_SAFE_FIXTURE. |
| UI adopta respuesta confirmada; restauración | PASS parcial: pruebas de modal y detalle cubren emisión y actualización de colección, sin mutación real. | BLOCKED_BY_MISSING_SAFE_FIXTURE: no hubo estado que restaurar. |

## Requests observadas

- Intento local sin autenticación: `GET http://localhost:8091/api/v1/me/instruments/liora/evidence`; conexión rechazada, sin código HTTP de servidor. No valida el 401.
- Pruebas aisladas verificaron `GET /api/v1/me/instruments/liora/evidence`, `GET /admin/resources` y `PATCH /admin/resources/{id}/status` con dobles o infraestructura efímera; no son requests E2E.
- No hubo requests autenticadas a QA o producción, PATCH real, cambios de datos reales ni notificaciones.

## Decisión final

**BLOCKED_BY_MISSING_SAFE_E2E_ENVIRONMENT**.

Las regresiones cumplen dentro de la deuda heredada permitida. Para cerrar el gate conjunto falta un CORE local/QA seguro con identidades administradora y usuaria, organizaciones y acciones LIORA controladas, y Resource fixture autorizado para mutación y restauración. Se debe repetir la matriz E2E antes de promover. No hubo push, merge, despliegue ni promoción.
