# EVAAS Interface · Documentation Map

Fecha: 2026-05-23

## Estructura final

```txt
docs/
├─ README.md
├─ DOCUMENTATION_MAP.md
├─ architecture/
├─ policies/
├─ phases/
├─ flows/
├─ contracts/
├─ frontend/
├─ backend/
├─ operations/
├─ roadmap/
├─ decisions/
├─ audits/
└─ legacy/
```

## Categorias

### architecture/

Define la forma del sistema frontend: boundaries, mapa de carpetas, responsabilidades y separacion del dashboard.

Documentos:

- `DASHBOARD_SHELL_ARCHITECTURE.md`
- `architecture-map.md`
- `dashboard-shell-boundaries.md`

### policies/

Contiene reglas que condicionan implementaciones futuras. No son simples notas; son restricciones de producto y arquitectura.

Documentos:

- `client-admin-separation-v0.md`
- `role-and-access-model-v0.md`

### phases/

Guarda memoria cronologica de fases ejecutadas o planificadas.

Documentos:

- `phase-1-summary.md`
- `phase-2a-summary.md`
- `phase-2b-summary.md`
- `phase-2c-admin-placeholder.md`
- `phase-2c-dashboard-shell-refactor-plan.md`

### flows/

Describe flujos transversales de la aplicacion.

Documentos:

- `auth-flow-v0.md`

### contracts/

Agrupa contratos API, DTOs y mapas entre frontend y backend.

Documentos:

- `api-contracts-v0.md`
- `frontend-backend-contract-map-v0.md`

### frontend/

Registra decisiones de UI Angular y pantallas especificas.

Documentos:

- `client-dashboard-v0.md`
- `client-ui-decisions-v0.md`
- `dashboard-access-matrix.md`
- `dashboard-shared-ui-audit.md`
- `dashboard-shared-ui-candidates.md`
- `dashboard-state-model.md`
- `dashboard-ui-inventory.md`

### backend/

Reservado para notas backend relevantes para EVAAS Interface. Debe usarse solo cuando afecte contratos, integraciones o despliegue consumidos por este frontend.

Documentos actuales:

- ninguno.

### operations/

Reservado para operacion, despliegue, soporte, ejecucion local y diagnostico recurrente.

Documentos:

- `admin-dashboard-data-baseline.md`

### roadmap/

Reservado para direccion futura, secuencia de producto y planes de alto nivel.

Documentos actuales:

- ninguno.

### decisions/

Contiene decisiones puntuales con impacto en implementacion.

Documentos:

- `ADR-001-dashboard-shell.md`
- `role-routing-decision-v0.md`

### audits/

Contiene diagnosticos, riesgos, hallazgos y recomendaciones. Puede incluir documentos historicos mientras sigan siendo utiles para entender el estado del sistema.

Documentos:

- `audit-phase-0.md`
- `audit-transformation.md`
- `cleanup-recommendations.md`
- `dashboard-shell-audit-v0.md`
- `phase-2b-routing-roles-audit.md`
- `technical-risks.md`

### legacy/

Preserva documentos obsoletos o de arquitectura anterior sin eliminarlos.

Documentos actuales:

- ninguno.

## Continuidad

No se elimino documentacion legacy. Los documentos existentes se movieron a categorias semanticas y se mantuvo `kebab-case.md` como convencion para evitar romper referencias externas innecesariamente.
