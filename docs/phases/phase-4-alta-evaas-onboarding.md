# Phase 4 - Alta EVAAS Onboarding

## Objetivo

Crear la estructura visual base de Alta EVAAS y conectar el flujo de borrador del intake del usuario autenticado.

Alta EVAAS lee el territorio. El borrador guarda la primera cartografia. El envio vendra cuando la intencion este clara.

## Ruta

- `/onboarding/alta-evaas`
- No usa Dashboard Shell.
- No muestra sidebar admin.
- Puede mostrar una invitacion a iniciar sesion si no existe sesion valida.

## Relacion con activacion

La ruta `/auth/activate` lee `code`, llama a `GET /onboarding/activate/{code}` y, cuando `activated === true`, redirige a `/onboarding/alta-evaas`.

## Contratos de borrador

Alta EVAAS consume endpoints protegidos:

- `GET /me/intake`
- `POST /me/intake`
- `PUT /me/intake`

El interceptor envia `Authorization: Bearer {token}` para `/me/intake`. Los endpoints publicos de auth y onboarding siguen excluidos de Authorization.

No se consume todavia:

- `POST /me/intake/submit`

## Estados UI

- `loading`
- `empty/new intake`
- `draft loaded`
- `saving`
- `saved`
- `error`

Si no hay sesion, la pantalla muestra: `Para continuar Alta EVAAS, inicia sesion con tu cuenta activada.` y un CTA hacia login.

## Creacion y actualizacion

Al entrar con sesion valida:

- `GET /me/intake` carga un borrador existente.
- Si el backend responde sin borrador, se muestra el wizard vacio.
- `Guardar borrador` usa `POST /me/intake` cuando no existe intake.
- `Guardar borrador` usa `PUT /me/intake` cuando ya existe intake.
- Despues de guardar, los datos quedan en pantalla y el flujo queda marcado como borrador existente.

## Pasos y payload

El wizard mantiene seis pasos:

- `Identidad`
- `Empresa / Formalizacion`
- `Proyecto`
- `Arquetipo EVAAS`
- `Necesidades`
- `Consentimiento etico`

Campos del payload:

- `phone`
- `clientType`
- `clientRut`
- `companyRut`
- `companyName`
- `legalStage`
- `hasCompany`
- `needsCompanyConstitution`
- `projectName`
- `currentStage`
- `websiteUrl`
- `hasWebsite`
- `hasDomain`
- `hasPayments`
- `primaryPillar`
- `secondaryPillars`
- `organizationArchetype`
- `mainNeed`
- `selectedServices`
- `urgency`
- `budgetRange`
- `message`
- `acceptsDataUseForDiagnosis`
- `acceptsContact`
- `wantsHumanReview`

Validaciones minimas de borrador:

- `websiteUrl` debe parecer URL si existe.
- `selectedServices` debe ser array.
- `secondaryPillars` debe ser array.
- Los campos booleanos deben ser booleanos.

## Decision pendiente de autenticacion

Alta EVAAS requerira sesion antes de guardar o enviar intake.

En este commit no se define todavia un auth guard para la ruta. La pantalla detecta sesion local y evita llamar `/me/intake` si el usuario no esta autenticado.

## Decision etica

No se implementa scoring oculto ni decisiones automaticas. La revision humana sigue siendo central y el consentimiento se guarda como parte del borrador.

## Fuera de alcance

No se implementa `POST /me/intake/submit`, validacion final obligatoria, creacion de organizacion, creacion de activacion, creacion de recursos, pagos, dashboard cliente, automatizacion, admin intakes ni cambios de estado admin.
