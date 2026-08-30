# EVW-UI-H02-L04-C04 · Confirmaciones contextuales

## A. Operaciones sensibles

Esta cápsula cubre exclusivamente:

- cambio de estado de Organization desde la lista administrativa;
- deshabilitación de ToolAccess legacy desde Organization Detail.

No existe cambio de estado de Organization en Organization Detail. Por tanto la política se aplica al único consumidor real, la lista de Organizations.

## B. Antes

| Operación | Antes | Riesgo |
| --- | --- | --- |
| Organization status | click ejecutaba `PATCH` inmediatamente | no había intención explícita previa |
| ToolAccess disable | `window.confirm()` seguido de DELETE | contexto limitado y patrón no reutilizable |

## C. Después

`ConfirmationModalComponent` es un modal pequeño y agnóstico de dominio. Recibe título, mensaje, contexto visible, verbo de confirmación y variante visual; solo emite `confirmed` o `cancelled`.

```text
Click sensible
↓
confirmación contextual
├── Cancelar → cierre, sin HTTP ni refresh
└── verbo explícito → caller ejecuta request
                     ↓
                 SUBMITTING
                     ↓
              respuesta CORE
```

La confirmación de Organization nombra la Organization y el estado objetivo habilitado/deshabilitado. La de ToolAccess muestra la Organization y el `toolKey`, y mantiene explícitamente la etiqueta **acceso legacy**.

## D. Contratos preservados

| Operación | Antes | Confirmación nueva | Request |
| --- | --- | --- | --- |
| Organization status | inmediata | modal contextual | `PATCH /admin/access/organizations/{id}/status` |
| ToolAccess disable | `window.confirm` | modal contextual | `DELETE /admin/access/tool-access/{id}` |
| Create Resource | request modal | sin cambio | `POST /admin/resources` |
| Assign ToolAccess | request modal | sin cambio | `POST /admin/access/tool-access` |

No se cambian payloads, endpoints, `enabled` explícito de Organization ni semántica de ToolAccess. La UI no promete efectos secundarios que CORE no demuestra.

## E. Request state reutilizado

Después de confirmar, ambos callers usan `OperationRequestState`:

- `SUBMITTING` bloquea confirmaciones/peticiones duplicadas;
- `SUCCESS` se establece solo tras éxito HTTP;
- `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT` y `ERROR` usan `mapOperationHttpError`;
- no hay actualización optimista previa a la respuesta.

Organization actualiza la fila después del PATCH exitoso. ToolAccess encadena su refresh de colección después del DELETE exitoso; no recarga Resources ni Organization completa. Si falla, los datos existentes permanecen visibles y no se muestra éxito falso.

## F. Interceptores

Los interceptores existentes conservan la responsabilidad de token, refresh y logout ante 401/419. El helper de request solo representa el error si llega al caller; no duplica autenticación ni navegación a login.

## G. Tests

La cobertura valida:

- render y emisiones explícitas del modal común;
- cancelación de Organization status sin PATCH;
- confirmación de Organization status con un único PATCH, actualización tras éxito y sin actualización falsa ante conflicto;
- cancelación de ToolAccess sin DELETE;
- confirmación de ToolAccess con un único DELETE y refresh exclusivo de ToolAccess;
- error de ToolAccess sin ocultar el acceso ni mostrar éxito.

Los specs afectados ejecutados: **15 SUCCESS**.

## H. Confirmaciones futuras fuera de alcance

`projects/dialog/project-details.dialog.ts` conserva `confirm()` para eliminar un Project legacy. Se clasifica como `FUTURE_CONFIRMATION_CANDIDATE` y no se modifica en C04. No se agregaron confirmaciones para Resource, Activation, InstrumentAccess, Service ni Artifact.

## I. Alcance residual

El modal incluye título, contexto, Cancelar y verbo explícito, y se adapta a un ancho reducido. Focus trap, Escape, restauración de foco y auditoría responsive completa quedan para C05.
