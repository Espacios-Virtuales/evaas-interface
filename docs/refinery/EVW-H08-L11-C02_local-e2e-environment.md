# EVW-H08-L11-C02 · Interface local para E2E gobernado

Esta guía prepara L11-C03; no ejecuta el PATCH de Resource ni aprueba el gate. Base documental: `c7573451a707e31a09a7a5d01a6d0bb98cfee55c` (incluye L11-C01).

## Prerrequisitos y arranque

Requiere Node 20, npm, Chrome y CORE E2E iniciado según `docs/architecture/e1/EVW_CORE_H08_L11_C02_LOCAL_E2E_ENVIRONMENT.md` del repositorio CORE. Desde la raíz de Interface:

```bash
npm ci
bash scripts/h08-local-e2e-ui.sh
```

La UI abre en `http://127.0.0.1:4200` y la API real está en `http://127.0.0.1:8091`. El script comprueba que los dos archivos Angular de desarrollo indiquen exactamente `http://localhost:8091` y que CORE devuelva 401 anónimo antes de ejecutar `ng serve` con configuración `development`; cualquier URL distinta hace fallar el arranque. El archivo `environment.production.ts` permanece intacto y no se usa en esta ruta. El navegador puede iniciar sesión con `admin@h08-e2e.local` o `client@h08-e2e.local`; sus contraseñas aleatorias se generan en el archivo ignorado `ev-root/.env.h08-e2e` de CORE. No se versionan ni se imprimen tokens.

La conexión es el login ordinario `POST /auth/login` y las lecturas existentes. El puerto de la UI y el puente de API están ligados a loopback. CORE, PostgreSQL y Redis están en una red Docker interna; el puente sólo reenvía el puerto 8091, sin credenciales. El guard de CORE rechaza perfil o base no local y desactiva mail, LIORA externo y S2S. La UI no necesita proxy ni cambios en pantallas.

## Detención, reset y destrucción

Detener la UI con Ctrl+C. Desde `ev-root` de CORE: `./scripts/h08-local-e2e.sh down` conserva datos; `./scripts/h08-local-e2e.sh reset` elimina el volumen E2E y ejecuta Flyway y fixtures desde cero; `./scripts/h08-local-e2e.sh destroy` elimina contenedores, red y volumen del proyecto E2E. En Interface no se crean volúmenes. Para confirmar el entorno y las lecturas autenticadas, ejecutar `./scripts/h08-local-e2e.sh check` y `python3 scripts/h08-e2e-smoke.py` en CORE.

## Datos disponibles

Admin ve Alpha con una acción LIORA atribuida y Beta sin evidencia. Cliente tiene membresía activa sólo en Alpha. Existen una acción histórica sin instrumento y otra de ASARIEL para comprobar exclusión. `H08_E2E_RESOURCE` en Alpha comienza en `PLANNED`; L11-C03 puede modificarlo y restaurarlo, o reconstruir por `reset`. C02 no hace PATCH ni emite notificaciones.

## Validación de C02 (2026-09-29, America/Santiago)

- `bash scripts/h08-local-e2e-ui.sh`: PASS; Angular development server ligado exclusivamente a `127.0.0.1:4200` y HTTP 200 local.
- Chrome headless: PASS; la UI ejecutó `POST http://localhost:8091/auth/login` con el admin local y guardó una sesión válida con `ROLE_ADMIN` y expiración futura. No se imprimieron credenciales ni tokens.
- `npm run build` con Node 20.19.5: PASS; sólo warnings de budgets existentes.
- `npm test -- --watch=false --browsers=ChromeHeadless`: 129 PASS, 2 FAIL preexistentes y fuera de los archivos tocados: `ObjectCardComponent should create` (`icon` indefinido) y `ObjectsGridComponent should create` (provider de `HttpClient` ausente). No se alteraron pantallas, lógica ni pruebas para encubrir esa deuda de base.
- Smoke CORE autenticado: PASS para ambos usuarios, aislamiento Alpha/Beta, atribución LIORA y exclusiones históricas/de otro instrumento.

Esta cápsula no ejecutó PATCH de Resource ni promovió el gate. Tampoco realizó push, merge, despliegue o conexión a producción.
