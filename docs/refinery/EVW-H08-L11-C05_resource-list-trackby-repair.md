# EVW-H08-L11-C05 · Reparación del tracking de la lista Resource

Fecha: 2026-10-01 (America/Santiago)

## Base y causa

`BASE_SHA`: `b9023357b91a73c969064b27d8baf9bf780ad9a5`. El árbol estaba limpio y la rama `codex/h08-l11-c05-fix-resource-trackby` se creó desde esa referencia.

En `AdminResourcesListComponent`, `trackResource` era un método de instancia entregado directamente a `*ngFor`. Angular ejecuta esa función de tracking como callback y no conserva el `this` del componente. Por eso, aunque `valueFromKeys` sí estaba declarado como método privado de esta clase, en esa invocación `this.valueFromKeys` no era una función. El fallo ocurría al evaluar el `trackBy` y evitaba que `NgFor` creara las filas después del HTTP 200.

## Tipo e identidad

La vista recibe `AdminResourceDto[]` desde `AdminResourceService.getResources()` (`GET /admin/resources`). La interfaz TypeScript declara `id?: number` por la compatibilidad abierta del DTO.

Se inspeccionó la implementación CORE del mismo entorno C02, sin modificarla: el DTO backend `AdminResourceDto` contiene `Long id`; la entidad `Resource` declara `id` con `@Id` y `@GeneratedValue`; `ResourceServiceImpl.toAdminDto` asigna `resource.getId()` al DTO de cada elemento de la colección. El estado también se opera mediante el ID numérico (`PATCH /admin/resources/{id}/status`). En la lectura autenticada local, el elemento `H08_E2E_RESOURCE` se recibió y se mostró con ID `1`.

El tracker usa directamente `resource.id` como clave numérica estable y se declara como propiedad flecha, que conserva su contexto. No usa el índice ni un fallback de identidad. La aserción no nula refleja que los Resources persistidos devueltos por la API tienen la clave primaria generada descrita arriba; no cambia el DTO ni el contrato.

## Archivos modificados

- `src/app/features/dashboard/admin/resources/admin-resources-list.component.ts`: tracker flecha basado directamente en `id`.
- `src/app/features/dashboard/admin/resources/admin-resources-list.component.spec.ts`: pruebas con el template y DTOs `AdminResourceDto` reales, dos filas, ejecución de tracking, estabilidad de identidad por ID, y estados de carga, vacío y error; se conserva la cobertura del ciclo de estado confirmado.
- `docs/refinery/EVW-H08-L11-C05_resource-list-trackby-repair.md`: esta evidencia.

No se modificaron contratos, servicios HTTP, modal, transición de estado, rutas, guards, estilos, CORE ni fixtures E2E.

## Verificación de Interface

| Comando | Resultado |
| --- | --- |
| `npm test -- --watch=false --include='src/app/features/dashboard/admin/resources/admin-resources-list.component.spec.ts'` | PASS, 7/7. |
| `npm test -- --watch=false` | 139 éxitos; fallan sólo las dos fallas heredadas permitidas: `ObjectCardComponent should create` y `ObjectsGridComponent should create`. |
| `npm run build -- --configuration=production` | PASS. Angular informó que `production` aparece dos veces porque el script `build` ya la establece; usó esa configuración. Permanecen warnings de budgets existentes. |

## Entorno local y navegador

CORE permaneció en `0e129a0d7dd8fd2470be44fb68191a0ec592e0eb`, con árbol limpio. El preflight `./scripts/h08-local-e2e.sh check` pasó: perfil único `e2e`, JDBC `db:5432/ev_h08_e2e`, red interna, puertos locales y mail, LIORA externo, S2S y seed piloto desactivados. Antes de `up`, dos procesos de la imagen CORE con `--network none` fueron rechazados por `E2eEnvironmentGuard`: `e2e,prod` con `E2E requires the e2e profile alone`; JDBC a `database.example.invalid` con `E2E refuses a nonlocal or unexpected database`. Ambos terminaron durante `EnvironmentPostProcessor`, antes de crear el datasource.

El smoke autenticado C02 pasó: login admin y cliente local, aislamiento Alpha/Beta, evidencia LIORA y presencia del fixture Resource. Chrome headless, autenticado como `admin@h08-e2e.local`, abrió `/dashboard/admin/resources`. Resultado: `GET /admin/resources` HTTP 200, una fila visible, ID `1`, key `H08_E2E_RESOURCE`, cero errores de consola y ausencia del error `valueFromKeys is not a function`.

No se abrió el detalle ni se envió `PATCH`. La observación de métodos HTTP registró `patchSent: false`; el smoke también confirmó que no hubo PATCH ni notificación. No se mutó el estado de Resource.

## Limpieza y decisión

Se detuvieron la UI y Chrome. `./scripts/h08-local-e2e.sh destroy` retiró los contenedores E2E, las redes y el volumen. Las consultas posteriores filtradas de contenedores, redes y volúmenes no devolvieron recursos. Se eliminó también el perfil temporal del navegador. El árbol CORE quedó limpio y sin cambios.

```text
READY_TO_REPEAT_L11_C03_R3
```
