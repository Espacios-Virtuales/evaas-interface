# Account Activation Route

## Objetivo

Implementar la ruta pública de activación de cuenta en EVAAS Interface. La API valida la activación; la Interface guía al usuario hacia Alta EVAAS.

## Ruta frontend

- `/auth/activate`
- Lee el query param `code`.
- Si `code` no existe, muestra `Código de activación no encontrado.` y no llama a la API.

## Endpoint backend

- `GET /onboarding/activate/{code}`
- Se consume desde `OnboardingService.activateAccount(code)`.
- El endpoint se declara en el registry como `API.onboarding.activate(code)`.

## Estados UI

- `loading`: `Activando tu cuenta...`
- `success`: `Cuenta activada exitosamente.`
- `error`: `No pudimos activar tu cuenta. El enlace puede estar vencido o ya utilizado.`

Cuando `activated === true`, la vista muestra éxito y redirige a `/onboarding/alta-evaas` después de una pausa breve.

## Seguridad / Interceptor

Los interceptores tratan como públicos estos endpoints:

- `/auth/login`
- `/auth/refresh`
- `/onboarding/register`
- `/onboarding/activate`
- `/onboarding/resend-activation`

Para esos endpoints no se agrega `Authorization` y no se dispara refresh token, evitando `Bearer null`, `Bearer undefined`, tokens expirados y loops durante activación.

## Alta EVAAS

Se agregó placeholder público en `/onboarding/alta-evaas`:

- `Alta EVAAS`
- `Próximamente completaremos tu entrada al ecosistema EVAAS.`

## Placeholder de resend

La vista muestra una accion deshabilitada:

- `Reenviar correo de activación`
- `Disponible próximamente.`

Queda preparada para conectar posteriormente con `POST /onboarding/resend-activation`.

## Fuera de alcance

No se implementa onboarding profundo, formulario completo de Alta EVAAS, resend funcional, login automático post-activación, creación de organización, recursos, dashboard cliente, lógica comercial, pagos ni billing.
