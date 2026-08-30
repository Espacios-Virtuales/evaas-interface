# EVW-UI-H02-L04-C03 · Estados de petición administrativos

## A. Estado anterior

| Operación | Idle | Validation | Submitting | Success | 401/403/404/409 | Generic |
| --- | --- | --- | --- | --- | --- | --- |
| Create Organization | `idle` | `validation` | `loading` | `success` transitorio | sin estado de operación específico | `error` con mensaje raw posible |
| Create Activation | `idle` | `validation` | `loading` | `success` transitorio | sin estado de operación específico | `error` con mensaje raw posible |
| Create Resource | formulario nuevo al abrir | mensaje local | boolean `submitting` | emisión inmediata | mapeo local de mensajes | mapeo local |
| Assign ToolAccess | formulario nuevo al abrir | mensaje local | boolean `submitting` | emisión inmediata | mapeo local de mensajes | mapeo local |

`Activation.status` ya era un estado del payload/dominio y no se usa como estado de request. ResourceCollectionState también permanecía separado de los formularios modales.

## B. Patrón común demostrado

Los cuatro consumidores tienen el mismo ciclo de petición:

```text
IDLE
→ VALIDATION_ERROR (solo validación local)
→ SUBMITTING
→ SUCCESS | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | ERROR
```

`SUCCESS` es transitorio para los modales: solo ocurre tras respuesta HTTP exitosa y precede el cierre/emisión. Un error mantiene el modal abierto y permite corregir, reintentar o cancelar. Todos los métodos de submit también bloquean explícitamente una segunda llamada durante `SUBMITTING`, además de deshabilitar botones.

## C. Abstracción extraída

`core/http/operation-request-state.ts` contiene:

- `OperationRequestState`: estado de UI, no tipo de dominio CORE;
- `mapOperationHttpError(error, messages)`: mapea transporte a `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT` o `ERROR` y recibe mensajes funcionales por operación.

No se creó motor CRUD, payload genérico ni state machine de entidades. Los contratos de Organization, Activation, Resource y ToolAccess continúan independientes.

## D. Mapping HTTP y manejo global

| HTTP | Estado de request | Tratamiento visible |
| --- | --- | --- |
| 400 | `ERROR` | rechazo de operación; no se presenta como validación Angular automática |
| 401 | `UNAUTHORIZED` | mensaje operacional solo si el error llega al componente |
| 403 | `FORBIDDEN` | mensaje de permisos por operación |
| 404 | `NOT_FOUND` | mensaje de contexto requerido no disponible |
| 409 | `CONFLICT` | mensaje de conflicto sin asumir causa contractual |
| otro / transporte | `ERROR` | mensaje seguro de fallback |

Los interceptores existentes siguen siendo responsables de token, refresh y logout. El refresh interceptor reintenta `401/419` o cierra sesión si no puede renovar; el helper no duplica esa lógica. El error interceptor conserva su feedback global; los formularios mantienen el error de la operación dentro de su contexto.

## E. Matriz final

| Operación | Estado común | Error mapping | Success | Refresh |
| --- | --- | --- | --- | --- |
| Create Organization | `OperationRequestState` | helper + mensajes Organization | cierra modal | Organizations + navegación al detalle cuando existe id |
| Create Activation | `OperationRequestState` | helper + mensajes Activation | cierra modal | Activations |
| Create Resource | `OperationRequestState` | helper + mensajes Resource | emite/cierra modal | Resources |
| Assign ToolAccess | `OperationRequestState` | helper + mensajes ToolAccess legacy | emite/cierra modal | ToolAccess |

## F. Responsabilidades

```text
Modal / formulario
├── validación local
├── SUBMITTING y bloqueo de duplicados
├── POST y error contextual
└── SUCCESS + emisión

Padre
├── apertura/cierre de modal
└── refresh de la colección afectada
```

El padre no replica validación, payload ni mapping de errores de los modales Resource/ToolAccess. Los estados de colección no cambian al abrir un modal; solo se actualizan con el refresh posterior.

## G. Tests

Se agregaron pruebas para:

- mapping `401`, `403`, `404`, `409` y fallback;
- estado inicial, success, error y prevención de doble submit en Resource y ToolAccess;
- ciclo `SUBMITTING`/success de Organization;
- separación entre `SUBMITTING` y `Activation.status`;
- error `FORBIDDEN`/`CONFLICT` sin cierre falso de los modales de Organization y Activation;
- refresh de Resources y ToolAccess en el padre (cobertura C02 conservada).

## H. Fuera de alcance y riesgos residuales

Organization status y disable ToolAccess mantienen sus interacciones actuales para C04. C05 sigue siendo responsable de la auditoría completa de foco, Escape, focus trap y responsive. Los errores backend se reducen a mensajes funcionales seguros; esta cápsula no añade ni interpreta schemas de validación remotos.
