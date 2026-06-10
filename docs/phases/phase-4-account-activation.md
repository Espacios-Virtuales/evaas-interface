# Phase 4 - Account Activation Route

## Objetivo

Implementar la ruta publica de activacion de cuenta en EVAAS Interface. La API valida la identidad y la Interface guia al usuario hacia Alta EVAAS.

## Ruta frontend

- `/auth/activate`
- Lee el query param `code`.
- Si `code` no existe, muestra `Codigo de activacion no encontrado.` y no llama a la API.
- No requiere sesion iniciada.
- No se renderiza dentro del Dashboard Shell.

## Endpoint backend

- `GET /onboarding/activate/{code}`
- Se consume desde `OnboardingService.activateAccount(code)`.
- El endpoint se declara en el registry como `API.onboarding.activate(code)`.

## Estados UI

- `loading`: `Activando tu cuenta...`
- `success`: `Cuenta activada exitosamente.`
- `error`: `No pudimos activar tu cuenta. El enlace puede estar vencido o ya utilizado.`

Cuando `activated === true`, la vista muestra exito y redirige a `/onboarding/alta-evaas` despues de una pausa breve.

## Seguridad / Interceptor

Los interceptores tratan como publicos estos endpoints:

- `/auth/login`
- `/auth/refresh`
- `/onboarding/register`
- `/onboarding/activate`
- `/onboarding/resend-activation`

Para esos endpoints no se agrega `Authorization` y no se dispara refresh token, evitando `Bearer null`, `Bearer undefined`, tokens expirados y loops durante activacion.

El login mantiene el contrato de token principal en `response.token`.

## Alta EVAAS

Se agrego placeholder publico en `/onboarding/alta-evaas`:

- `Alta EVAAS`
- `Proximamente completaremos tu entrada al ecosistema EVAAS.`

## Placeholder de resend

La vista muestra una accion deshabilitada:

- `Reenviar correo de activacion`
- `Disponible proximamente.`

Queda preparada para conectar posteriormente con `POST /onboarding/resend-activation`.

## Fuera de alcance

No se implementa wizard Alta EVAAS, formulario profundo, `GET /me/intake`, `POST /me/intake`, `PUT /me/intake`, `POST /me/intake/submit`, resend funcional, login automatico post-activacion, creacion de organizacion, creacion de recursos, pagos ni billing.
