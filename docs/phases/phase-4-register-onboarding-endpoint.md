# Phase 4 - Register Onboarding Endpoint

## Problema detectado

El registro inicial de EVAAS Interface estaba conectado al registro legacy de usuarios. En produccion el flujo debe pertenecer al abordaje de onboarding.

Endpoint legacy observado o equivalente:

```txt
POST /users/register
POST /user/register
```

Endpoint correcto:

```txt
POST /onboarding/register
```

## Cambio aplicado

`AuthService.register()` ahora usa `API.onboarding.register`, que resuelve contra `environment.apiUrl`.

En produccion, la request esperada es:

```txt
POST https://api.evaas.lat/onboarding/register
```

No debe llamarse:

```txt
POST https://api.evaas.lat/users/register
POST https://api.evaas.lat/user/register
```

El payload actual del formulario se mantiene sin agregar campos nuevos.

## Endpoints publicos

Los interceptores mantienen sin `Authorization`:

```txt
/onboarding/register
/onboarding/activate
/onboarding/resend-activation
/auth/login
/auth/refresh
```

Esto evita `Bearer null` y `Bearer undefined` durante registro y activacion.

## UI

Despues de un registro exitoso, la interfaz redirige a login con mensaje:

```txt
Registro recibido. Revisa tu correo para activar tu cuenta.
```

No se redirige directamente a Alta EVAAS. El flujo sigue siendo:

```txt
Registro
↓
Correo de activacion
↓
/auth/activate?code=...
↓
Cuenta activada
↓
/onboarding/alta-evaas
```

## Validacion en Network

En DevTools -> Network, el registro debe verse como:

```txt
POST https://api.evaas.lat/onboarding/register
```

La request no debe enviar header `Authorization`.

## Fuera de alcance

No se implementa onboarding profundo adicional, resend activation funcional, login automatico, creacion de organizacion, creacion de recursos, pagos, billing ni cambios backend.
