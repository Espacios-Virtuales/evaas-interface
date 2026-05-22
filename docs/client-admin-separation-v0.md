# EVAAS Interface · Separación cliente/admin v0

Fecha: 2026-05-22

## Flujo comercial a vista Angular

```txt
Web Station / WooCommerce
↓
Activación comercial
↓
EVAAS Core crea o vincula organización
↓
EVAAS Core asigna rol cliente
↓
EVAAS Core asocia herramientas/servicios
↓
EVAAS Interface consulta GET /me/tool-access
↓
Dashboard Cliente muestra contrato operacional
```

## Vista cliente v0

La vista cliente debe mostrar únicamente:

```txt
Organización | Herramienta / Servicio | Estado | Acceso
```

Fuente contractual:

```txt
GET /me/tool-access
```

DTO:

```ts
MyToolAccessDto[]
```

Campos permitidos:

- `organizationId`
- `organizationName`
- `toolKey`
- `status`
- `grantedAt`
- `revokedAt`

Campos no permitidos en cliente:

- `provider`
- `externalOrderId`
- `externalMembershipId`
- `billing details`
- `payloadHash`
- lógica comercial interna

## Vista administrador EVAAS v0

En Fase 1 solo se preparan contratos. No se construye panel admin.

Contratos disponibles:

```txt
POST   /admin/access/organizations
GET    /admin/access/organizations/{id}
POST   /admin/access/tool-access
DELETE /admin/access/tool-access/{id}

POST  /admin/commerce/activations
PATCH /admin/commerce/activations/{id}/status
```

La futura vista admin debe representar clientes, servicios contratados, recursos asociados, estado y configuración base, siempre observando datos emitidos por backend.

## Hallazgo

Cliente y admin tienen DTOs separados.

## Impacto

Evita exponer en la vista cliente campos comerciales o administrativos.

## Riesgo

Bajo

## Recomendación

No reutilizar `AdminToolAccessDto` para dashboard cliente. La vista cliente debe depender de `MyToolAccessDto`.

## Archivos involucrados

- `src/app/core/models/access-contracts.model.ts`
- `src/app/core/services/tool-access.service.ts`

## Hallazgo

El panel admin no fue implementado.

## Impacto

Respeta el alcance de Fase 1 y evita construir CRUD o dashboards complejos antes de cerrar contratos.

## Riesgo

Bajo

## Recomendación

Cuando se implemente, crear feature separada y no mezclar administración con dashboard cliente.

## Archivos involucrados

- `src/app/features/`
- `src/app/core/http/api.endpoints.ts`

## Hallazgo

El registro local todavía existe como feature heredada.

## Impacto

Puede contradecir el flujo principal de activación comercial si se presenta como entrada normal del cliente.

## Riesgo

Medio

## Recomendación

Decidir en fase posterior si se oculta, se restringe o se transforma en flujo auxiliar. No se eliminó en Fase 1.

## Archivos involucrados

- `src/app/features/auth/register/`
- `src/app/features/auth/auth.routes.ts`

## Hallazgo

El dashboard heredado aún contiene recursos/proyectos.

## Impacto

No representa todavía la grilla cliente v0 basada en `GET /me/tool-access`.

## Riesgo

Medio

## Recomendación

En la siguiente fase, construir una vista mínima de tool access o reemplazar el home mock por un estado contractual. No tocar operación profunda.

## Archivos involucrados

- `src/app/features/dashboard/home/home.component.ts`
- `src/app/features/dashboard/resources/`
- `src/app/features/dashboard/objects/`
