# Client UI Decisions v0

## Principios

- Angular no decide acceso; observa contratos emitidos por el backend.
- La pantalla cliente no mezcla responsabilidades de administración.
- No se agregan datos falsos cuando existe una API real.
- La UI evita volcar objetos completos para no exponer campos internos.

## Ruta elegida

Se creó `/client` en lugar de reemplazar `/dashboard`.

Motivos:

- Mantiene intacto el dashboard general existente.
- Permite que la primera experiencia post-login sea cliente sin bloquear evolución futura.
- Evita mezclar una pantalla contractual mínima con módulos legacy o paneles más complejos.

## Protección

`/client` usa `authGuard`. En esta fase no se agregan guards por rol porque los roles reales no están completamente confirmados para cliente. El backend mantiene el control efectivo de acceso por los endpoints `/me/*`.

## Render de recursos

`MyResourceDto` está abierto en Fase 2A. Por eso la UI:

- muestra solo campos esperados y seguros,
- no renderiza JSON completo,
- no muestra nombres de campos internos,
- usa `Pendiente contrato` cuando falta configuración base clara.

Cuando el backend estabilice `MyResourceDto`, esta pantalla debe cambiar a propiedades tipadas explícitas.

## Campos excluidos

La pantalla cliente no debe mostrar:

- identificadores externos de comercio,
- provider,
- detalles de billing,
- hashes o payloads,
- campos de operación admin.

Esta decisión aplica aunque esos campos aparezcan accidentalmente en una respuesta futura.
