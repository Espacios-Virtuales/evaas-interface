# EVAAS Interface · Phase 2A summary

Fecha: 2026-05-22

## Alcance implementado

Se alineo la base Angular con los contratos backend EVAAS disponibles para Fase 2A:

- Registry por dominios en `src/app/core/http/api.endpoints.ts`.
- Helper `apiUrl()` para resolver rutas contra `environment.apiUrl`.
- Servicios base tipados y sin logica de negocio:
  - `MeService`
  - `AdminAccessService`
  - `AdminCommerceService`
  - `AdminResourceService`
- DTOs base en `src/app/core/models/evaas-contracts.model.ts`.
- Specs minimos para los cuatro servicios.
- Documentacion de mapa frontend/backend.

## Auth

`AuthService` usa los contratos reales:

```txt
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

El manejo de token queda en `AuthStore` y `authInterceptor`. El refresh flow esta centralizado en `refreshTokenInterceptor` y excluye login/refresh para evitar loops. No se agregaron logs sensibles.

## Compatibilidad

Los endpoints heredados de registro, integraciones y proyectos se conservaron temporalmente bajo `LEGACY_API`. Esto evita romper componentes existentes mientras Fase 2B/2C migra pantallas a contratos reales.

## Swagger/OpenAPI

No fue posible leer `http://localhost:8091/v3/api-docs` desde este entorno porque `localhost:8091` rechazo la conexion. Los campos no verificables de recursos y payloads se dejaron como `unknown` para no inventar estructura.

## Fuera de alcance

No se implemento dashboard complejo, billing, tickets, edicion profunda, automatizaciones, monitoreo ni datos falsos.
