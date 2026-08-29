# Admin instruments model

Fecha: 2026-08-29

## Alineación canónica EVW-UI-H01

`Instrument` es el catálogo canónico de capacidades y Interface lo consume desde `GET /admin/instruments`. `InstrumentAccess` es la autorización canónica por organización y corresponde a `GET /admin/organizations/{organizationRef}/instrument-access`.

`ToolAccess` es el contrato legacy aún disponible en el detalle de organización; no debe renombrarse internamente como `InstrumentAccess` ni usar `Organization.id` (`Long`) como `organizationRef` UUID. `Resource` es un activo operativo y no un Instrumento. Solo puede mostrarse asociado a un instrumento si el backend expone una relación o metadata explícita; de otro modo queda como `Sin clasificar`.

La ruta `/dashboard/admin/access` queda como compatibilidad temporal y redirige a la sección principal canónica, `/dashboard/admin/instruments`. Comunicador es la máscara UI de LIORA. La Interface no llama directamente a Liora: toda operación pasa por `ev-ecosystem-api`.

## Decision

`Instrumentos` pasa a ser la seccion principal visible del Dashboard Admin; esto no elimina ni reemplaza totalmente el contrato legacy `ToolAccess`.

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
| InstrumentAccess | Autorización canónica de un instrumento por organización. | Acceso a Comunicador por `organizationRef` UUID |
| ToolAccess | Autorizacion o habilitacion funcional para usar una herramienta/capacidad. | Acceso de una organizacion a una capacidad |
| Resource | Activo operacional asociado a una organización; una asociación con Instrument solo puede mostrarse con evidencia contractual explícita. | URL, VPS, dashboard, worker, repositorio |
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
- `GET /admin/instruments` es la fuente canónica del catálogo de instrumentos; `[]` se representa como estado vacío válido.
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

## Asociación de Resource a Instrument

La tabla global de recursos puede mostrar una columna `Instrumento asociado` solo cuando exista relación contractual o metadata explícita del backend:

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
Sin clasificar
```

No se persiste clasificacion local y no se inventan relaciones.
