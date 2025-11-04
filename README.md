# 🌌 EVAAS Interface

**EVAAS (Enterprise Virtual Apps & Services)** es una aplicación basada en **Angular 20 standalone** 

------------------------------------------------------------------------

## 🧱 Arquitectura General

``` plaintext
src/
├─ main.ts
├─ app/
│  ├─ app.routes.ts
│  ├─ core/
│  │  ├─ models/              # Interfaces
│  │  ├─ services/            # Toast, 
│  │  ├─ auth/                # AuthGuard, Auth, rbac, Directivas
│  │  │  └─ directives/       # has-role.directive.ts, can.directive.ts (opcional para permisos granulares)
│  │  │  └─ validators/       # unique-email.validator.ts
│  │  └─ http/                # AuthInterceptor, ErrorInterceptor, RefreshTokenInterceptor
│  ├─ shared/
│  │  ├─ components/          # ToastsComponent
│  │  ├─ ui/                  # wrappers Material reutilizables
│  │  └─ lazy.ts              # lazy loading
│  │  └─ router-helpers.ts    # helpers de ruteo
│  └─ features/
│  │  ├─ auth/                # login / register / rutas
│  │  └─ dashboard/           # layout / home / rutas
│  │  │ └─ home/
│  │  │ └─ layout/
│  │  │ └─ objects/
│  └─ utils/
└─ material-theme.scss
└─ styles.scss
```

**Stack:**\
Angular 20 + RxJS + Bootstrap 5 / Material UI + Signals + JWT + Docker

------------------------------------------------------------------------

## ⚙️ Configuración de entorno

Asegúrate de que los entornos apunten correctamente a la API:

``` ts
// src/environments/environment.development.ts
export const environment = {
  apiUrl: 'https://api.evaas.lat'
} as const;
```

------------------------------------------------------------------------

## 🚀 Servidor de desarrollo

### ⚙️ Servidor local y compilación

``` bash
ng serve            # Levanta el proyecto en localhost:4200
```

Luego abre en tu navegador:\
👉 `http://localhost:4200/`

El servidor se recargará automáticamente al detectar cambios en los
archivos fuente.

------------------------------------------------------------------------

## 🧩 Comandos útiles

### Generadores rápidos

``` bash

ng g c features/auth/login                         # Componente
ng g s core/services/auth --skip-tests --flat      # Servicio
ng g guard core/guards/auth --functional           # Guard funcional
ng g interceptor core/http/auth --functional       # Interceptor
ng g directive core/auth/directives/has-role 
ng g pipe shared/pipes/field-error                 # Pipe

```

### Construir para producción

``` bash
ng build
```

Los artefactos se almacenan en `/dist`, optimizados para despliegue.

### Ejecutar tests unitarios

``` bash
ng test
```

### Ejecutar tests E2E (opcional)

``` bash
ng e2e
```

------------------------------------------------------------------------

## 📁 Documentación

La documentación detallada está en [`docs/`](docs/):

- 📊 **Diagramas**
  - [Diagramas Principales](docs/diagramas)

- 🐞 **Flujos de Sesiones**
  - [Flujos Completos](docs/flujos)

- 🧩 **Ruta del Curso**
  - [Sprints](docs/sprints)

- 🗂 **Documentación Api**
  - [Evaas](https://api.evaas.lat/swagger-ui/index.html)

------------------------------------------------------------------------

## 🔒 API y Seguridad

El proyecto consume endpoints protegidos mediante JWT desde:

    https://api.evaas.lat

Endpoints principales: - `POST /users/register` - `POST /login` -
- `GET /integrations/software` - `POST /project/software` - `GET /project/{id}` - `GET /project/card` 

**Endpoints principales:**
```http
POST /users/register
POST /login
POST /logout
GET /integrations/software
POST /project
GET /project/{id}
PUT /project/{id}
DELETE /project/{id}
```

------------------------------------------------------------------------

## 🧠 Filosofía

> "Construimos no solo código, sino comprensión.\
> Cada capa es un paso más cerca del sentido."\
> --- *EVAAS / 2025*


------------------------------------------------------------------------

## 🪐 Créditos

**Autor:** David Utreras\
**Edición:** EVAAS Inspira\
**Licencia:** MIT\
**Tema visual:** Azul profundo `#003E6B`, Turquesa orbital `#2BD4E0`\
**Framework:** Angular 20 Standalone

------------------------------------------------------------------------