# 🌌 EVAAS Interface — *Pilot Release 2025*

**EVAAS (Enterprise Virtual Apps & Services)** es la interfaz oficial del ecosistema **Espacios Virtuales**, desarrollada en **Angular 20 Standalone** como parte del piloto productivo 2025.  

> Esta versión constituye el **piloto técnico funcional** de EVAAS, base del despliegue productivo en la nube y de la suite de aplicaciones integradas EVAAS LAT.

---

## 🧭 Propósito

EVAAS Interface provee la capa de interacción del entorno **EVAAS Platform**, conectando servicios empresariales, proyectos virtualizados y procesos de integración mediante API seguras.  

Su diseño busca:
- **Escalabilidad modular**, gracias a la arquitectura *standalone + signals*.  
- **Seguridad integrada**, con autenticación JWT y control de roles (RBAC).  
- **Extensibilidad**, compatible con entornos Docker y despliegue serverless (Vercel Cloud).

---

## 🧱 Arquitectura General

```plaintext
src/
├─ main.ts
├─ app/
│  ├─ app.routes.ts
│  ├─ core/
│  │  ├─ models/              # Interfaces de dominio y DTOs
│  │  ├─ services/            # Servicios: Toast, HTTP, Storage, etc.
│  │  ├─ auth/                # Guards, RBAC y Directivas de acceso
│  │  │  ├─ directives/       # has-role.directive.ts, can.directive.ts
│  │  │  └─ validators/       # unique-email.validator.ts
│  │  └─ http/                # Interceptores: Auth, Error, RefreshToken
│  ├─ shared/
│  │  ├─ components/          # ToastsComponent, Loaders, Dialogs
│  │  ├─ ui/                  # Wrappers y componentes reutilizables
│  │  └─ lazy.ts              # Lazy loading helpers
│  └─ features/
│     ├─ auth/                # Módulo de autenticación
│     └─ dashboard/           # Layout principal y vistas internas
│        ├─ home/
│        ├─ layout/
│        └─ objects/
│
├─ utils/
├─ material-theme.scss
└─ styles.scss
```

**Stack:**  
Angular 20 + RxJS + Material 3 + Bootstrap 5 + Signals + JWT + Docker + Vercel

---

## ⚙️ Configuración de entorno

```ts
// src/environments/environment.production.ts
export const environment = {
  apiUrl: 'https://api.evaas.lat'
} as const;
```

La aplicación se comunica directamente con el backend EVAAS API sin necesidad de proxy local.

---

## 🚀 Servidor de desarrollo

```bash
ng serve
# http://localhost:4200
```

El servidor se recarga automáticamente al detectar cambios.

---

## 🧩 Comandos útiles

### Generadores rápidos (Angular CLI)
```bash
ng g c features/auth/login                         # Componente
ng g s core/services/auth --skip-tests --flat      # Servicio
ng g guard core/guards/auth --functional           # Guard funcional
ng g interceptor core/http/auth --functional       # Interceptor
ng g directive core/auth/directives/has-role       # Directiva
ng g pipe shared/pipes/field-error                 # Pipe
```

### Build de producción
```bash
ng build --configuration=production
```

### Tests
```bash
ng test
ng e2e      # opcional
```

---

## 🐳 Despliegue y DevOps

- **Local:** entorno Docker + Nginx (`docker compose up --build`)  
- **Cloud:** despliegue estático en **Vercel** (`npx vercel --prod`)  
- **Output Directory:** `dist/evaas-interface/browser`  
- **Node.js Version:** 20.x  

`vercel.json`:
```json
{
  "version": 2,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

---

## 🔒 API y Seguridad

La interfaz consume endpoints protegidos con JWT desde  
**https://api.evaas.lat**

Endpoints principales:
```http
POST /users/register
POST /login
POST /logout
GET  /integrations/software
POST /project
GET  /project/{id}
PUT  /project/{id}
DELETE /project/{id}
```

> La API EVAAS aplica control de sesión sin estado, validación de tokens, y CORS habilitado para `https://*.vercel.app` y dominios EVAAS LAT.

---

## 🗂️ Estructura documental

Todos los documentos se almacenan bajo `docs/`:

```
docs/
├─ vision/               # Documentos de visión, alcance y objetivos
│   ├─ EVAAS_VISION.md
│   └─ ROADMAP.md
├─ diagramas/            # Diagramas técnicos (mermaid / UML)
│   ├─ arquitectura.md
│   ├─ despliegue.md
│   └─ flujo-autenticacion.md
├─ contratos/            # Contratos técnicos de integración (API / módulos)
│   ├─ endpoints.md
│   ├─ modelos.md
│   └─ versionado.md
├─ firmas/               # Documentos firmados / validaciones del piloto
│   ├─ ACTA_PILOTO_EVAAS_2025.pdf
│   └─ CONTRATO_EVAAS_PILOTO.pdf
└─ manuales/             # Manuales de usuario y operación
    ├─ interfaz.md
    └─ despliegue.md
```

### 🔗 Enlaces sugeridos

- [Visión y Roadmap](docs/vision/EVAAS_VISION.md)  
- [Arquitectura general](docs/diagramas/arquitectura.md)  
- [Flujo de autenticación](docs/diagramas/flujo-autenticacion.md)  
- [Contratos API](docs/contratos/endpoints.md)  
- [Firmas y actas del piloto](docs/firmas/ACTA_PILOTO_EVAAS_2025.pdf)  

> Se recomienda incluir encabezados estandarizados en cada documento técnico:  
> **Versión · Fecha · Revisor · Estado**.

---

## 🧠 Filosofía EVAAS

> “Construimos presencia digital con propósito.  
> Cada entrega es una extensión del entendimiento colectivo.”  
> — *EVAAS Pilot 2025*

---

## 🪐 Créditos

**Autor:** David Utreras  
**Dirección técnica:** EVAAS Labs / Espacios Virtuales  
**Edición:** EVAAS Inspira — Piloto 2025  
**Licencia:** MIT  
**Tema visual:** Azul profundo `#003E6B`, Turquesa orbital `#2BD4E0`  
**Framework:** Angular 20 Standalone  
