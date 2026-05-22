# EVAAS Interface · Role and access model v0

Fecha: 2026-05-22

## Regla

Angular no decide acceso. Angular observa contratos. El backend sostiene la ley.

## Roles conocidos

El frontend reconoce estos nombres:

```ts
ROLE_CLIENT
ROLE_ADMIN
ROLE_USER
ROLE_COMPANY
```

`ROLE_CLIENT` y `ROLE_ADMIN` son los roles objetivo de la separación cliente/admin. `ROLE_USER` y `ROLE_COMPANY` permanecen como compatibilidad heredada hasta confirmar nombres reales emitidos por EVAAS Core.

## Uso permitido en Angular

Angular puede usar roles para:

- navegación condicional;
- textos/etiquetas;
- selección de vista;
- ocultamiento cosmético.

Angular no debe usar roles para autorizar acciones sensibles. Toda acción protegida debe ser validada por backend.

## Hallazgo

Existe directiva `hasRole` que oculta o muestra contenido localmente.

## Impacto

Es útil para navegación, pero no es seguridad. Un usuario podría llamar endpoints manualmente; backend debe rechazar si no corresponde.

## Riesgo

Medio

## Recomendación

Mantener `hasRole` solo como ayuda visual. Documentar cada uso nuevo con el contrato backend que lo respalda.

## Archivos involucrados

- `src/app/core/auth/directives/has-role.ts`
- `src/app/core/auth/auth.store.ts`

## Hallazgo

El dashboard actual no tiene rutas separadas cliente/admin.

## Impacto

No hay panel admin complejo, lo cual respeta Fase 1, pero todavía no existe una frontera de routing para una futura vista admin.

## Riesgo

Bajo

## Recomendación

Cuando se implemente admin, agregar rutas separadas bajo una feature propia, por ejemplo `features/admin`, protegidas por contrato backend y rol `ROLE_ADMIN`.

## Archivos involucrados

- `src/app/features/dashboard/dashboard.routes.ts`
- `src/app/app.routes.ts`

## Hallazgo

Hay referencias heredadas a `ROLE_USER` en navegación.

## Impacto

Si backend emite solo `ROLE_CLIENT`, esa navegación heredada puede quedar oculta. Como recursos/proyectos no son foco Fase 1, no se cambió el comportamiento.

## Riesgo

Medio

## Recomendación

Al construir dashboard cliente v0, usar `GET /me/tool-access` como fuente de verdad visual. Confirmar si `ROLE_CLIENT` reemplaza o convive con `ROLE_USER`.

## Archivos involucrados

- `src/app/features/dashboard/layout/dashboard-shell.component.html`
- `src/app/core/types/auth.types.ts`

## Hallazgo

`AuthResponse.role` se mapea a strings libres.

## Impacto

Permite aceptar roles backend no conocidos, pero reduce validación estática.

## Riesgo

Bajo

## Recomendación

Mantener flexibilidad hasta confirmar contrato real. Después se puede tipar con unión de roles conocidos y fallback.

## Archivos involucrados

- `src/app/core/models/http.model.ts`
- `src/app/core/models/auth.model.ts`
- `src/app/core/auth/auth.mapper.ts`
