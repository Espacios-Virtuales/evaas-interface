# Phase 4 - Account Activation Route

## Objetivo

Implementar la ruta publica de activacion de cuenta en EVAAS Interface. La API valida la identidad y la Interface guia al usuario hacia Alta EVAAS.

## Ruta frontend

- `/auth/activate`
- Lee el query param `code`.
- Si `code` no existe, muestra `Codigo de activacion no encontrado.` y no llama a la API.
- No requiere sesion iniciada.
- No se renderiza dentro del Dashboard Shell.

## Problema corregido

Durante pruebas, `/auth/activate?code=...` podia disparar dos requests hacia el backend. Como el codigo de activacion es de un solo uso, la primera llamada activaba la cuenta y la segunda fallaba como codigo invalido o inexistente.

La solucion agrega un guard local en el componente:

```txt
activationStarted
```

Si la activacion ya inicio durante la vida del componente, la interfaz no vuelve a llamar `GET /onboarding/activate/{code}` ni reintenta automaticamente con el mismo codigo.

## Endpoint backend

- `GET /onboarding/activate/{code}`
- Se consume desde `OnboardingService.activateAccount(code)`.
- El endpoint se declara en el registry como `API.onboarding.activate(code)`.
- Debe ejecutarse una sola vez por carga del componente.

## Estados UI

- `loading`: `Activando tu cuenta...`
- `success`: `Cuenta activada exitosamente.`
- `error`: `El enlace puede haber expirado, ya fue utilizado o no es valido.`

Cuando `activated === true`, la vista muestra exito y redirige a `/onboarding/alta-evaas` despues de una pausa breve.

## Error recuperable

Si la activacion falla, la pantalla muestra:

- `Ir a login`
- formulario `Reenviar correo de activacion`

`Ir a login` navega a `/auth/login`.

## Reenvio de activacion

El formulario de recuperacion pide:

```txt
email
```

Endpoint:

```txt
POST /onboarding/resend-activation
```

Payload:

```json
{
  "email": "usuario@dominio.com"
}
```

Estados del reenvio:

- `idle`
- `loading`
- `success`
- `error`
- `validation`

Validaciones minimas:

- email requerido
- formato basico de correo

Mensaje de exito:

```txt
Si el correo existe y requiere activacion, enviaremos un nuevo enlace.
```

Mensaje de error:

```txt
No pudimos reenviar el correo de activacion. Intenta nuevamente.
```

No se muestran stacktraces ni detalles sensibles.

## Seguridad / Interceptor

Los interceptores tratan como publicos estos endpoints:

- `/auth/login`
- `/auth/refresh`
- `/onboarding/register`
- `/onboarding/activate`
- `/onboarding/resend-activation`

Para esos endpoints no se agrega `Authorization` y no se dispara refresh token, evitando `Bearer null`, `Bearer undefined`, tokens expirados y loops durante activacion o reenvio.

Endpoints protegidos como `/me/intake` y `/admin/*` si reciben `Authorization` cuando hay sesion valida.

## Validaciones manuales

- `/auth/activate`: muestra `Codigo de activacion no encontrado.` y no llama backend.
- `/auth/activate?code=CODIGO_REAL`: llama una sola vez `GET /onboarding/activate/{code}`, no envia `Authorization`, muestra exito y redirige a `/onboarding/alta-evaas`.
- `/auth/activate?code=CODIGO_INVALIDO`: llama una sola vez, muestra error recuperable, muestra `Ir a login` y el formulario de reenvio.
- Reenvio: llama `POST /onboarding/resend-activation` con `{ "email": "usuario@dominio.com" }` y sin `Authorization`.

## Fuera de alcance

No se implementa login automatico post-activacion, nuevo registro, cambios backend, onboarding profundo adicional, creacion de organizacion, pagos, billing, captcha ni rate limit frontend artificial.
