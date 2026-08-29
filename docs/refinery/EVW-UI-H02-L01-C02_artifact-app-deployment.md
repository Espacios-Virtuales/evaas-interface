# EVW-UI-H02-L01-C02 · Refinería Artifact / App / Deployment

Fecha: 2026-08-29

## A. Definiciones

| Concepto | Definición semántica |
| --- | --- |
| Artifact | Resultado producido, identificable y versionable, con identidad, versión y provenance. |
| App | Artifact ejecutable. `App ⊂ Artifact`; no es entidad independiente mientras CORE no lo defina. |
| Deployment | Manifestación runtime de un Artifact/App sobre uno o más Resources. |

```txt
Service ── may produce → Artifact
Artifact ── executable → App
Artifact / App → Deployment → Resource
```

Estas relaciones son semántica objetivo. Interface no las presenta como relaciones runtime mientras CORE no las exponga.

```txt
Artifact != Resource
Artifact != Service
Artifact != Deployment
Deployment != Resource
Deployment != Artifact
Deployment != Service
```

## B. Inventario observado

| Representación actual | Clasificación legacy | Semántica candidata | Evidencia | Contrato actual | Decisión |
| --- | --- | --- | --- | --- | --- |
| Repository | Resource | `ARTIFACT_CANDIDATE` o Resource disponible | tipo `REPOSITORY`; `ProjectDto.gitRepo` solo legacy | `Resource` / `API.legacy.project` | Mantener legacy |
| Dashboard construido | Resource | `ARTIFACT_CANDIDATE`, `APP_CANDIDATE` si es ejecutable/versionado | tipo `DASHBOARD`; ejemplo de línea base | `Resource` | Mantener legacy |
| Worker desplegado | Resource | `APP_CANDIDATE` + `DEPLOYMENT_CANDIDATE` | tipo `WORKER`; `ProjectDto.provisioning.type` solo legacy | `Resource` / `API.legacy.project` | Mantener legacy |
| Plugin | No observado como Resource ni DTO Admin | `ARTIFACT_CANDIDATE` | solo ejemplo semántico; sin representación Interface | Ninguno | `SEMANTIC_RESERVED` |
| Theme | No observado como Resource ni DTO Admin | `ARTIFACT_CANDIDATE` | solo ejemplo semántico; sin representación Interface | Ninguno | `SEMANTIC_RESERVED` |

`observed` describe lo que existe en el árbol. `candidate` no crea un dominio: Repository, Dashboard y Worker no se convierten por nombre en Artifact, App o Deployment.

## C. Clasificación candidata sin migración

- `REPOSITORY`: puede ser Resource cuando se consume como capacidad/repositorio disponible; también puede aportar provenance a un Artifact. No hay evidencia suficiente para migrar.
- `DASHBOARD`: puede ser Artifact/App si existe producto construido, identidad y versión; puede seguir siendo Resource cuando solo se expone como URL o capacidad operativa.
- `WORKER`: puede involucrar Artifact/App, Deployment y Resources de ejecución. El tipo Resource único es semánticamente insuficiente, pero se conserva hasta un contrato explícito.

Estados documentales usados: `LEGACY_RESOURCE`, `ARTIFACT_CANDIDATE`, `APP_CANDIDATE`, `DEPLOYMENT_CANDIDATE`, `SEMANTIC_RESERVED`, `BLOCKED_BY_CORE_CONTRACT`.

## D. Contratos actuales

`Resource` es el único contrato Admin relevante consumido por Interface:

```http
GET  /admin/access/organizations/{id}/resources
GET  /admin/resources
GET  /admin/resources/{id}
POST /admin/resources
```

Existen modelos y rutas históricas bajo `API.legacy`:

```txt
LEGACY_API.integrations.software
LEGACY_API.project.software
LEGACY_API.project.view
LEGACY_API.project.byId(id)
```

`ProjectDto` incluye `version`, `gitRepo` y `provisioning` (`SERVICE`/`APP`/`WORKER`), y `PackageItem` incluye versión y enlace a repository. Son modelos legacy de software/proyecto, no evidencia de Artifact/App/Deployment canónicos. `objects/`, `projects/` e `integrations/software` quedan `LEGACY_MODEL` y `DO_NOT_MIGRATE_IN_C02`.

## E. Contratos ausentes

- Artifact: `SEMANTIC_MODEL_AVAILABLE`, `HTTP_NOT_CONSUMED`. No existen `ArtifactDto`, `ArtifactService`, `artifactId`, `artifactRef` ni `/admin/artifacts` en Interface.
- App: no existe entidad canónica consumida. Se reserva como Artifact ejecutable.
- Deployment: `SEMANTIC_RESERVED`, `NO_HTTP_CONTRACT`. La información de provisioning histórica no equivale a una entidad Deployment canónica.

CORE debe exponer, antes de una proyección futura:

- Artifact con identidad, versión y provenance.
- App solo si requiere una entidad distinta de Artifact.
- Deployment con identidad runtime, Artifact/App de origen y Resources de ejecución.

No se crean endpoints, DTOs, tablas, rutas ni relaciones anticipadas en esta cápsula.

## F. Decisión

`LEGACY_RESOURCE` se conserva para `REPOSITORY`, `DASHBOARD` y `WORKER`. `ARTIFACT_CANDIDATE`, `APP_CANDIDATE` y `DEPLOYMENT_CANDIDATE` son únicamente clasificación documental. La proyección Interface queda `BLOCKED_BY_CORE_CONTRACT` hasta recibir contratos canónicos verificables.
