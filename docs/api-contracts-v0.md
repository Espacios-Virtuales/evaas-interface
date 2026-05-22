# EVAAS Interface · API contracts v0

Fecha: 2026-05-22

Mantra técnico: Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

## Contratos registrados en Angular

```ts
API.auth.login          // POST /auth/login
API.auth.refresh        // POST /auth/refresh
API.auth.logout         // POST /auth/logout

API.me.toolAccess       // GET /me/tool-access

API.adminAccess.organizations
API.adminAccess.organizationById(id)
API.adminAccess.toolAccess
API.adminAccess.toolAccessById(id)

API.adminCommerce.activations
API.adminCommerce.activationStatus(id)
```

## Contrato cliente

El contrato cliente inicial vive en `src/app/core/models/access-contracts.model.ts`.

```ts
export type ToolAccessStatus = 'ENABLED' | 'DISABLED';

export interface MyToolAccessDto {
  toolKey: string;
  organizationId: number;
  organizationName: string;
  status: ToolAccessStatus;
  grantedAt: string;
  revokedAt?: string | null;
}
```

La vista cliente no debe mostrar provider, externalOrderId, externalMembershipId, billing details, payloadHash ni lógica comercial interna.

## Contratos admin

Los contratos admin conocidos también viven en `access-contracts.model.ts`:

- `OrganizationDto`
- `ExternalCommerceActivationDto`
- `AdminToolAccessDto`
- `ExternalCommerceActivationStatus`

Estos contratos están preparados para futuras pantallas admin, pero Fase 1 no construye panel admin.

## Hallazgo

El registry API quedó separado por dominio contractual: `auth`, `me`, `adminAccess` y `adminCommerce`.

## Impacto

Reduce acoplamiento y evita mezclar vista cliente con administración interna o comercio externo.

## Riesgo

Bajo

## Recomendación

Mantener esta frontera. Si aparecen nuevos endpoints, agregarlos por dominio y no desde componentes.

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `src/app/core/models/access-contracts.model.ts`

## Hallazgo

El servicio cliente preparado es read-only.

## Impacto

Respeta el flujo de producto v0: Angular observa el contrato operacional emitido por backend y no administra acceso desde cliente.

## Riesgo

Bajo

## Recomendación

Usar `ToolAccessService.getMyToolAccess()` para la primera visualización cliente. No agregar mutaciones en este servicio.

## Archivos involucrados

- `src/app/core/services/tool-access.service.ts`
- `src/app/core/services/tool-access.service.spec.ts`

## Hallazgo

Los endpoints heredados de recursos/proyectos siguen existiendo en `API`.

## Impacto

Permite que el código existente compile, pero no forman parte del foco contractual v0.

## Riesgo

Medio

## Recomendación

No expandirlos durante Fase 1. Revisarlos cuando se decida la continuidad de recursos/proyectos heredados.

## Archivos involucrados

- `src/app/core/http/api.endpoints.ts`
- `src/app/core/services/project.service.ts`
- `src/app/core/services/software.service.ts`
