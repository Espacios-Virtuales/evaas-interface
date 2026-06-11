# Production API URL Behind Caddy

## Arquitectura

Produccion expone la API publica de EVAAS a traves de Caddy:

```txt
Caddy HTTPS :443
↓
reverse_proxy localhost:8091
↓
Spring Boot HTTP
```

La interfaz no debe llamar directamente el puerto interno de Spring Boot.

## URL productiva correcta

La URL productiva embebida en el build frontend debe ser:

```txt
https://api.evaas.lat
```

Configuracion esperada:

```ts
apiUrl: 'https://api.evaas.lat'
```

No usar en produccion:

```txt
https://api.evaas.lat:8091
https://IP_DEL_SERVIDOR:8091
https://localhost:8091
http://api.evaas.lat:8091
```

`src/environments/environment.production.ts` es la fuente para el build productivo de Angular y debe mantenerse sin `:8091`.

## Error observado

El log backend:

```txt
Invalid character found in method name [0x16 0x03 0x01...]
```

indica que trafico TLS/HTTPS llego a un puerto HTTP plano. En esta arquitectura suele ocurrir cuando un cliente apunta a `https://...:8091` en vez de entrar por Caddy en `https://api.evaas.lat`.

## API registry

Los servicios frontend deben construir URLs desde `environment.apiUrl` y endpoints relativos registrados, por ejemplo:

```txt
/onboarding/register
/onboarding/activate/{code}
/auth/login
/me/intake
/me/intake/submit
```

La funcion central es `apiUrl(path)` en `src/app/core/http/api.endpoints.ts`.

## Authorization

Los interceptores mantienen endpoints publicos sin `Authorization`:

```txt
/auth/login
/auth/refresh
/onboarding/register
/onboarding/activate
/onboarding/resend-activation
```

Endpoints protegidos como `/me/intake` y `/admin/*` si deben recibir `Authorization: Bearer {token}` cuando hay sesion valida.

## Validacion en Network

Despues de desplegar en Vercel, validar en DevTools -> Network:

```txt
POST https://api.evaas.lat/onboarding/register
GET https://api.evaas.lat/onboarding/activate/{code}
POST https://api.evaas.lat/auth/login
GET https://api.evaas.lat/me/intake
POST https://api.evaas.lat/me/intake
PUT https://api.evaas.lat/me/intake
POST https://api.evaas.lat/me/intake/submit
```

Ninguna request productiva debe apuntar a `:8091`.

## Vercel

Este proyecto usa environments estaticos de Angular. La URL queda embebida al momento del build.

Si en Vercel existe alguna variable externa como `API_URL`, `NG_APP_API_URL`, `VITE_API_URL` o `EVAAS_API_URL`, no debe contener `:8091`. Si se corrige una variable o un environment file, se debe redeployar para regenerar el bundle productivo.
