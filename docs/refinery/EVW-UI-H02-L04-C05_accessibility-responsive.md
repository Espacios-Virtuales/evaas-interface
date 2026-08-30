# EVW-UI-H02-L04-C05 · Interacción responsive y accesible

## Estado

`EVW-UI-H02-L04-C05 · CLOSED`

## Modales auditados e infraestructura

Los flujos administrativos activos usan overlays HTML/CSS propios. Se corrigieron mediante `ModalInteractionDirective`, una directiva acotada que captura/restaura foco, limita Tab y Shift+Tab al diálogo, procesa Escape, y bloquea el scroll del documento mientras el diálogo está abierto.

`MatDialog` sigue presente en flujos legacy de Resources/Projects y no fue modificado: no pertenece a los flujos administrativos activos de L04.

| Modal | Focus | Escape | Trap | Restore | Responsive | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| Organization Create | primer campo | cierra salvo SUBMITTING | FIXED | FIXED | FIXED | PASS |
| Activation Create | provider | cierra salvo SUBMITTING | FIXED | FIXED | FIXED | PASS |
| Resource Create | name | cierra salvo SUBMITTING | FIXED | FIXED | FIXED | PASS |
| ToolAccess Create | toolKey | cierra salvo SUBMITTING | FIXED | FIXED | FIXED | PASS |
| Resource Detail (admin / Organization) | Cerrar | cierra | FIXED | FIXED | FIXED | PASS |
| Confirmation | Cancelar, nunca la acción sensible | cancela | FIXED | FIXED | FIXED | PASS |

## Focus y teclado

- Cada overlay propio tiene un título, `role="dialog"`, `aria-modal`, `aria-labelledby` y una descripción asociada.
- El foco inicial llega al primer campo de los formularios, al control `Cerrar` para detalle, y a `Cancelar` para confirmaciones sensibles.
- `Tab` y `Shift+Tab` no alcanzan el contenido de fondo; al destruir el modal, el foco vuelve al elemento que lo abrió.
- `Escape` emite una intención de cierre únicamente cuando la operación no está en `SUBMITTING`. El mismo límite se conserva para el click sobre backdrop de los formularios existentes.
- La directiva bloquea el scroll del `body` durante el overlay y lo restaura al cierre.

## Request feedback y labels

- Los formularios preservan `SUBMITTING`, botón de envío deshabilitado y prevención de doble petición introducidos en C03.
- Los dialogs declaran `aria-busy` durante la petición.
- Los errores generales y de validación usan `role="alert"`; los campos ya usan elementos `label` reales y no dependen de placeholders.
- Los botones conservan verbos explícitos: Crear, Asignar, Habilitar, Deshabilitar, Cancelar y Cerrar.

## Responsive

- Los request dialogs y confirmaciones usan ancho fluido, `max-height` y scroll vertical interno.
- En viewport pequeño, backdrop usa padding reducido, grids de formulario pasan a una columna y las acciones se apilan para mantener labels y targets disponibles.
- Resource Detail mantiene metadata y URLs con wrapping/scroll controlado; los enlaces externos conservan `target="_blank"` y `rel="noopener noreferrer"`.

## Correcciones implementadas

1. Se agregó `ModalInteractionDirective` a Create Organization, Create Activation, Create Resource, Assign ToolAccess, ambos Resource Detail y Confirmation.
2. Se añadieron foco visible, regiones de error perceptibles y atributos ARIA para request dialogs.
3. Se endurecieron límites de altura y acciones móviles sin modificar payloads, rutas ni contratos.

## Validación y límites

- Los specs de modales/directiva cubren trap Tab, Escape, bloqueo/restauración de scroll, emisión de confirm/cancel y los lifecycles de request afectados.
- La comprobación de navegador con datos autenticados, lector de pantalla y viewports reales no se ejecutó en esta cápsula: `INTERACTIVE_SMOKE = NOT_EXECUTED`.
- `projects/dialog/project-details.dialog.ts` conserva su `confirm()` legacy como `FUTURE_CONFIRMATION_CANDIDATE / OUT_OF_SCOPE`.
