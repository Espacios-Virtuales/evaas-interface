# Admin instruments model

Fecha: 2026-07-20

## Decision

`Instrumentos` reemplaza a `Accesos` como seccion principal visible del Dashboard Admin.

La ruta principal es:

```txt
/dashboard/admin/instruments
```

La ruta legacy:

```txt
/dashboard/admin/access
```

queda como compatibilidad transitoria y redirige a Instrumentos.

## Conceptos

| Concepto | Definicion | Ejemplo |
| --- | --- | --- |
| Instrumento | Capacidad operable del ecosistema EVAAS. | Comunicador |
| ToolAccess | Autorizacion o habilitacion funcional para usar una herramienta/capacidad. | Acceso de una organizacion a una capacidad |
| Resource | Recurso concreto asociado a una organizacion, herramienta o instrumento. | URL, dashboard, worker, repositorio |
| Activation | Origen comercial o manual que justifica acceso o continuidad. | Activacion externa recibida |

## Relacion conceptual

```txt
Comunicador
↓
ToolAccess
↓
Resource
↓
CommunicationAction
```

## Reglas

- Instrumentos no reemplaza ToolAccess.
- Recursos no son instrumentos.
- ToolAccess no es menu principal para usuarios humanos.
- La UI puede enmascarar nombres internos.
- Liora se muestra como Comunicador en la UI.
- Angular no llama proveedores externos directamente.
- Angular observa lo que ev-ecosystem-api expone.

## Comunicador

Comunicador es el primer instrumento admin definido para el piloto.

Alias tecnico interno:

```txt
Liora
```

Regla de UI:

```txt
Mostrar Comunicador.
No usar Liora como marca principal visible.
```

## Recursos e instrumentos

La tabla global de recursos puede mostrar una columna `Instrumento` cuando exista evidencia suficiente en campos ya expuestos por backend:

```txt
type
key
toolAccessId
visibility
metadataJson
url
organizationId
```

Valores actuales:

```txt
Comunicador
Sin clasificar
```

No se persiste clasificacion local y no se inventan relaciones.
