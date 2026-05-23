# EVAAS Interface · API contracts v0

Fecha: 2026-05-22

Mantra tecnico: Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

## Fuente contractual

Backend esperado:

```txt
http://localhost:8091
http://localhost:8091/swagger-ui/index.html
http://localhost:8091/v3/api-docs
```

En esta ejecucion `GET http://localhost:8091/v3/api-docs` no respondio porque no habia servicio escuchando en el puerto 8091. Por eso los endpoints se alinearon con el contrato entregado para Fase 2A y los DTOs de recursos/payloads que no tenian campos verificables quedaron abiertos con `unknown` en vez de inventar nombres.

## Registry Angular

`src/app/core/http/api.endpoints.ts` expone rutas contractuales, no URLs absolutas. Las llamadas HTTP usan `apiUrl(path)` para resolver contra `environment.apiUrl`.

```ts
API.auth.login
API.auth.refresh
API.auth.logout

API.me.toolAccess
API.me.resources

API.adminAccess.organizations
API.adminAccess.organizationById(id)
API.adminAccess.organizationToolAccess(id)
API.adminAccess.organizationResources(id)

API.adminCommerce.activations
API.adminCommerce.activationById(id)
API.adminCommerce.activationStatus(id)

API.adminResources.resources
API.adminResources.resourceById(id)
```

## Legacy

Los endpoints anteriores permanecen bajo `API.legacy` y `LEGACY_API` para que el codigo existente compile mientras se decide su continuidad:

```ts
LEGACY_API.auth.register
LEGACY_API.integrations.software
LEGACY_API.project.software
LEGACY_API.project.view
LEGACY_API.project.byId(id)
```

## DTOs

Los contratos de Fase 2A viven en `src/app/core/models/evaas-contracts.model.ts`:

- `MyToolAccessDto`
- `MyResourceDto`
- `OrganizationDto`
- `AdminToolAccessDto`
- `AdminResourceDto`
- `ExternalCommerceActivationDto`

`src/app/core/models/access-contracts.model.ts` queda como re-export de compatibilidad.

## Auth

AuthService usa:

```txt
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

El access token se adjunta en `authInterceptor`. El refresh flow evita loops en login/refresh y reintenta la request original luego de actualizar la sesion. Logout no envia el refresh token en body.
