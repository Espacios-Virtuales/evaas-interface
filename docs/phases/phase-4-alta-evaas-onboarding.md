# Phase 4 - Alta EVAAS Onboarding Shell

## Objetivo

Crear la estructura visual base de Alta EVAAS como shell del onboarding profundo posterior a la activacion de cuenta.

Alta EVAAS no decide todavia. Abre el mapa del proyecto para que el intake futuro guarde el territorio.

## Ruta

- `/onboarding/alta-evaas`
- No usa Dashboard Shell.
- No muestra sidebar admin.
- No consume backend en este commit.

## Relacion con activacion

La ruta `/auth/activate` lee `code`, llama a `GET /onboarding/activate/{code}` y, cuando `activated === true`, redirige a `/onboarding/alta-evaas`.

## Shell del wizard

La pantalla muestra navegacion local entre seis pasos:

- `Identidad`
- `Empresa / Formalizacion`
- `Proyecto`
- `Arquetipo EVAAS`
- `Necesidades`
- `Consentimiento etico`

El estado es local e incluye solo `idle` y navegacion de pasos. Los botones `Guardar borrador` y `Enviar Alta EVAAS` quedan deshabilitados con senal de proximo paso.

## Contratos futuros

Quedan fuera de este commit y se conectaran despues:

- `GET /me/intake`
- `POST /me/intake`
- `PUT /me/intake`
- `POST /me/intake/submit`

## Decision pendiente de autenticacion

Alta EVAAS requerira sesion antes de guardar o enviar intake.

En este commit no se define todavia si la ruta tendra auth guard. Si `/me/intake` requiere sesion, la pantalla podra invitar a iniciar sesion antes de cargar o guardar datos.

## Fuera de alcance

No se implementa guardado real, envio real, validaciones completas, creacion de organizacion, creacion de activacion, creacion de recursos, pagos, dashboard cliente ni decisiones automaticas.
