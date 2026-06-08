# Admin Dashboard Data Baseline

## 1. Proposito

Esta linea base permite probar EVAAS como centro de operaciones interno antes de automatizar procesos. Su foco es poblar datos reales y significativos para que el Dashboard Admin v0 pueda visualizar organizaciones, activaciones, accesos y recursos con las entidades actuales.

Principio:

```txt
Primero visualizar.
Luego ordenar.
Despues automatizar.
```

## 2. Flujo manual actual

El flujo manual esperado para poblar el ecosistema EVAAS es:

```txt
Admin EVAAS
↓
crea Organization
↓
crea ExternalCommerceActivation INTERNAL
↓
asigna ToolAccess
↓
crea Resource
↓
Angular Interface visualiza
```

Este flujo no implica provision automatica. Solo registra la informacion operacional minima para que el centro de operaciones pueda observar el estado actual.

## 3. Entidades actuales

### Organization

Representa el cliente, proyecto o unidad operativa que EVAAS debe administrar o visualizar.

Ejemplos:

```txt
Espacios Virtuales
FarqBIM
Crypto Analytics
Escuela Mistica
```

### ExternalCommerceActivation

Representa la activacion comercial o interna que justifica la habilitacion de accesos o recursos.

Puede ser:

```txt
INTERNAL
MANUAL
WOOCOMMERCE
PAYPAL
TRANSBANK
```

Estos valores deben usarse solo si el backend los permite. Esta entidad no representa todavia EVAAS Commerce completo.

### ToolAccess

Representa el acceso habilitado a una herramienta o servicio.

Debe estar asociado a:

```txt
organizationId
userId si aplica
externalCommerceActivationId si aplica
toolKey
```

### Resource

Representa un descriptor operacional del ecosistema. No provisiona infraestructura automaticamente.

Puede describir:

```txt
API
WordPress
VPS
Power BI
Repositorio
Dashboard
Worker
Documentacion
```

## 4. Organizaciones base sugeridas

Linea base inicial sugerida:

```txt
1. Espacios Virtuales
2. FarqBIM
3. Crypto Analytics
4. Escuela Mistica
```

### Espacios Virtuales

Centro interno de operacion EVAAS.

### FarqBIM

Cliente o proyecto de arquitectura, BIM, automatizacion o sistema operativo digital.

### Crypto Analytics

Cliente o proyecto tecnico de API, dashboards, workers y analitica.

### Escuela Mistica

Cliente o proyecto de formacion, comunidad, contenidos y experiencia.

## 5. Tool keys sugeridos

Ejemplos de `toolKey` para carga manual inicial:

```txt
EVAAS_ADMIN
FARQBIM_DASHBOARD
CRYPTO_ANALYTICS_API
ESCUELA_MISTICA_PORTAL
WORDPRESS_SITE
POWER_BI_DASHBOARD
REPOSITORY_ACCESS
```

Los toolKey definitivos deben validarse con backend antes de usarse como catalogo cerrado.

## 6. Resource types sugeridos

Tipos operacionales sugeridos:

```txt
API
WORDPRESS
VPS
POWER_BI
REPOSITORY
DASHBOARD
WORKER
DOCUMENTATION
OTHER
```

Los valores definitivos dependen de las enumeraciones oficiales del backend.

## 7. Resource status sugeridos

Estados posibles si estan confirmados por backend:

```txt
PLANNED
ACTIVE
MAINTENANCE
DISABLED
```

Pendiente: confirmar si estos valores corresponden exactamente a la enumeracion oficial del backend.

## 8. Resource visibility sugerida

Visibilidades sugeridas:

```txt
ADMIN_ONLY
USER_VISIBLE
```

Pendiente: confirmar si estos valores corresponden exactamente a la enumeracion oficial del backend.

## 9. Que NO debe contener Resource

`Resource` es un descriptor operacional, no un provisionador.

No debe contener:

- secretos;
- credenciales;
- tokens;
- passwords;
- payloads de provision;
- logica de workers;
- broker topics sensibles;
- billing;
- datos de tarjeta;
- automatizacion compleja.

## 10. Ejemplo de flujo de carga manual

Ejemplo conceptual sin datos sensibles reales:

```txt
1. Crear Organization: FarqBIM
2. Crear ExternalCommerceActivation: INTERNAL / FARQBIM_SETUP
3. Crear ToolAccess: FARQBIM_DASHBOARD
4. Crear Resource:
   - type: DASHBOARD
   - name: Dashboard FarqBIM
   - visibility: ADMIN_ONLY o USER_VISIBLE
   - status: ACTIVE
5. Verificar en EVAAS Interface:
   - organizacion aparece
   - detalle muestra acceso
   - detalle muestra recurso
```

## 11. Relacion con Dashboard Admin v0

Esta linea base alimenta las vistas actuales del Dashboard Admin v0:

```txt
/dashboard/admin/organizations
/dashboard/admin/organizations/:id
/dashboard/admin/resources
/dashboard/admin/activations
```

La vista de organizaciones permite comprobar que las unidades operativas existen. El detalle de organizacion permite revisar accesos y recursos asociados. Las vistas globales de recursos y activaciones permiten auditar el ecosistema desde una perspectiva operacional.

## 12. Proximos pasos

Movimientos sugeridos:

```txt
1. Crear acceso manual desde detalle de organizacion.
2. Crear recurso manual asociado a organizacion.
3. Crear activacion interna desde admin.
4. Evaluar endpoint filtrado de activaciones por organizationId.
5. Mas adelante: Program -> Phase -> Progress.
```

## Fuera de alcance

Esta linea base no incluye:

- implementacion de codigo;
- fixtures productivos;
- seed automatico;
- modificaciones de backend;
- Program;
- Phase;
- billing;
- commerce completo;
- workers;
- broker;
- provision automatica;
- automatizacion de provision.

## Mantra tecnico

```txt
Primero nombrar la linea base.
Luego cargar datos reales.
Despues operar con claridad.
```
