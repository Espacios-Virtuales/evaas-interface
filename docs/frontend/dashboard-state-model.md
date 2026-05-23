# EVAAS Interface · Dashboard state model

Fecha: 2026-05-23

## Objetivo

Nombrar los estados visuales existentes y esperados en el Dashboard Shell, sin cambiar implementacion.

## Estados actuales

| Estado | Donde aparece | Representacion | Tecnologia | Duplicacion |
| --- | --- | --- | --- | --- |
| loading | client | panel `.state.state-loading` con spinner pequeno | Bootstrap + SCSS custom | Si, con projects/resources |
| loading | projects legacy | spinner centrado | Bootstrap | Si |
| loading | resources legacy | texto `Cargando...` | Bootstrap utility | Si |
| loading | project dialog | template `#loading` | Angular template | Si |
| error | client | panel rojo con mensaje y retry | Bootstrap button + SCSS custom | Si |
| error | resources legacy | texto rojo inline | Bootstrap utility | Si |
| error | interceptors/logout | snackbar | Angular Material | Si |
| error | resources create | toast custom | Bootstrap toast | Si |
| empty | client global | panel empty con texto | SCSS custom | Si |
| empty | client section | empty compacto | SCSS custom | Si |
| empty | projects legacy | `Sin resultados.` centrado | Bootstrap utility | Si |
| success | client | tabla con datos | Bootstrap table + SCSS custom | No formalizado |
| success | resources legacy | tabla Material con filas | Angular Material | No formalizado |
| success | projects legacy | grid con cards | Bootstrap + SCSS custom | No formalizado |
| unauthorized | global http | 401/419 via refresh/logout | interceptor + router | No visible como state de dashboard |
| disabled | login/register/resources/projects | botones `[disabled]` | Bootstrap / Material | Si |
| active | sidebar | `routerLinkActive=active` | Angular Router + SCSS custom | No |
| pending | admin placeholder | `Modulo en preparacion` | SCSS custom | Si, no normalizado |
| failed | no state dedicado | aparece como error generico | variable | Pendiente |
| revoked | client tool access | texto `Revocado fecha` | string derivado | No como badge |

## Estados contractuales futuros

Estados esperados por contratos:

- `ACTIVE` / activo;
- `ENABLED`;
- `PENDING`;
- `FAILED`;
- `REVOKED`;
- `DISABLED`;
- `UNKNOWN`.

Regla:

El backend emite estado. Angular decide solo representacion visual.

## Modelo recomendado

### Data state

```txt
loading
error
empty
ready
```

Uso:

- pantalla completa;
- seccion compacta;
- tabla/lista.

No debe incluir:

- llamadas HTTP;
- roles;
- nombres de endpoint;
- textos fijos del dominio.

### Status variant

```txt
success
neutral
muted
warning
danger
```

Uso:

- status badge;
- pills de herramientas;
- estado de recursos;
- activaciones admin futuras.

No debe incluir:

- mapeo de enums backend dentro del componente visual.

## Duplicacion observada

Hay tres familias de estados:

1. Cliente: SCSS custom consistente.
2. Legacy Bootstrap: projects, home, object cards.
3. Legacy Material: resources, dialogs, snackbar.

La primera extraccion candidata es `data-state`, pero solo cuando admin tenga un segundo uso real.

## Riesgos

- Extraer ahora crearia abstraccion con un solo consumidor.
- Normalizar legacy puede romper pantallas fuera del objetivo de Fase 2C.
- Los estados HTTP globales no deben mezclarse con estados visuales locales.
- `revoked` existe como texto, no como estado visual normalizado.

## Decision

Mantener estados locales por ahora.

Nombrar `data-state` y `status-badge` como futuros patrones de dashboard compartido.
