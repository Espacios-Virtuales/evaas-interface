# EVW-UI-H02-L04-C02 · Modales de petición contextual

## Antes

```text
Organization Detail
├── Resource inline form
└── ToolAccess inline form
```

Los formularios expandibles competían visualmente con Identity, Ownership, Resources y ToolAccess. La operación y la observación ocurrían dentro de la misma sección de detalle.

## Después

```text
Organization Detail
├── [Crear recurso] → AdminResourceCreateModalComponent
└── [Asignar acceso] → AdminToolAccessCreateModalComponent
```

Ambos modales reciben únicamente el contexto necesario (`organizationId`, nombre para la cabecera y, para Resource, los ToolAccess disponibles para el selector). Se crean y destruyen con la apertura/cierre, por lo que no reutilizan formulario, error ni estado de envío de una interacción anterior.

## Contratos preservados

| Operación | Antes | Después | Contrato |
| --- | --- | --- | --- |
| Create Resource | formulario inline | modal contextual | `POST /admin/resources` / Resource |
| Assign ToolAccess | formulario inline | modal contextual | `POST /admin/access/tool-access` / ToolAccess legacy |
| Resource detail | modal | modal | Resource |
| Organization status | PATCH inmediato | sin cambio C02 | Organization |
| Disable ToolAccess | `window.confirm` + DELETE | sin cambio C02 | ToolAccess |

El payload de Resource conserva `organizationId`, `name`, `type`, `key?`, `toolAccessId?`, `url?`, `status?`, `visibility?` y `metadataJson?`, incluidas las validaciones existentes de URL, JSON, referencias de ToolAccess y contenido sensible.

El payload legacy de ToolAccess conserva `organizationId`, `toolKey`, `userId` y `externalCommerceActivationId?`. La búsqueda por correo sigue siendo un subflujo local del modal. No se promueve ToolAccess a InstrumentAccess ni se deduce una relación Organization → Activation desde el campo opcional.

## Flujo de éxito y error

```text
Modal valida y ejecuta un único POST
↓ éxito
Emite resultado y se cierra
↓
Organization Detail refresca solo la colección afectada
```

- Resource refresca `getOrganizationResources(organizationId)` y conserva sus estados de colección.
- ToolAccess refresca `getOrganizationToolAccess(organizationId)`.
- Un error de POST permanece dentro del modal y no emite éxito.
- Si falla el refresh de ToolAccess, no se muestra éxito falso; se informa que el acceso se creó pero la colección no pudo actualizarse.
- Cancelar solo cierra el modal: no ejecuta request ni modifica colecciones.

## Operaciones no modificadas

- Cambio de estado de Organization: continúa fuera de C02 y será una confirmación contextual en C04.
- Deshabilitar ToolAccess: continúa usando `window.confirm` hasta C04.
- Resource detail: sigue siendo modal de lectura (`PATTERN_CANDIDATE`).
- Create Organization y Create Activation: ya eran modales y no se unifican en esta cápsula.

## Evidencia de tests

Los specs de `organization-detail` cubren:

- payload Resource y emisión de éxito;
- error Resource sin éxito falso;
- payload ToolAccess legacy y emisión de éxito;
- error ToolAccess sin éxito falso;
- refresh exclusivo de Resources después del resultado Resource;
- refresh exclusivo de ToolAccess después del resultado ToolAccess.

Resultado de los specs afectados: **6 SUCCESS**.

## Alcance residual

La cápsula añade accesibilidad mínima (`role="dialog"`, título identificable, botones textuales y bloqueo durante submit) y tamaño/contenido scrollable básico en viewport pequeño. Focus trap, Escape, restauración de foco y auditoría responsive completa quedan para C05; la normalización transversal de estados queda para C03.
