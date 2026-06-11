# Phase 4 - Alta EVAAS Onboarding

## Objetivo

Crear la estructura visual base de Alta EVAAS, conectar el flujo de borrador del intake del usuario autenticado y permitir el envio final para revision humana.

Alta EVAAS lee el territorio. El borrador guarda la primera cartografia. El envio deja la intencion preparada para revision humana.

## Ruta

- `/onboarding/alta-evaas`
- No usa Dashboard Shell.
- No muestra sidebar admin.
- Puede mostrar una invitacion a iniciar sesion si no existe sesion valida.

## Relacion con activacion

La ruta `/auth/activate` lee `code`, llama a `GET /onboarding/activate/{code}` y, cuando `activated === true`, redirige a `/onboarding/alta-evaas`.

## Contratos

Alta EVAAS consume endpoints protegidos:

- `GET /me/intake`
- `POST /me/intake`
- `PUT /me/intake`
- `POST /me/intake/submit`

El interceptor envia `Authorization: Bearer {token}` para `/me/intake` y `/me/intake/submit`. Los endpoints publicos de auth y onboarding siguen excluidos de Authorization.

## Estados UI

- `loading`
- `empty/new intake`
- `draft loaded`
- `saving`
- `saved`
- `submitting`
- `submitted`
- `validation-error`
- `error`

Si no hay sesion, la pantalla muestra: `Para continuar Alta EVAAS, inicia sesion con tu cuenta activada.` y un CTA hacia login.

## Creacion y actualizacion

Al entrar con sesion valida:

- `GET /me/intake` carga un borrador existente.
- Si el backend responde sin borrador, se muestra el wizard vacio.
- `Guardar borrador` usa `POST /me/intake` cuando no existe intake.
- `Guardar borrador` usa `PUT /me/intake` cuando ya existe intake.
- Despues de guardar, los datos quedan en pantalla y el flujo queda marcado como borrador existente.

## Envio final

`Enviar Alta EVAAS` valida campos minimos, guarda borrador si hay cambios pendientes y luego llama `POST /me/intake/submit`.

Validaciones minimas para enviar:

- `projectName`: `Indica el nombre de tu proyecto.`
- `primaryPillar`: `Selecciona un pilar principal.`
- `mainNeed`: `Describe la necesidad principal.`
- `acceptsDataUseForDiagnosis = true`: `Debes aceptar el uso de datos para diagnostico.`
- `acceptsContact = true`: `Debes aceptar que podamos contactarte.`

El estado `submitting` se muestra durante el envio. Si el backend responde correctamente, el estado pasa a `submitted` y se muestra:

`Alta EVAAS enviada correctamente. Revisaremos tu informacion para preparar el siguiente paso.`

La pantalla final incluye CTA `Ir al Dashboard` hacia `/dashboard`.

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

El submit no crea organizacion, activacion ni recursos. Solo deja el intake preparado para revision humana.

## Fuera de alcance

No se implementa admin intakes, `GET /admin/intakes`, `PATCH /admin/intakes/{id}/status`, creacion automatica de organizacion, creacion automatica de activacion, ToolAccess, recursos, scoring, decisiones automaticas, billing, pagos ni dashboard cliente avanzado.
