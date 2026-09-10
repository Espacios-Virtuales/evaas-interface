# Instrument alineado

- `AdminInstrumentDto` incorpora `canonicalId` y `status`; el catálogo muestra la clave y estado recibidos desde `GET /admin/instruments`.
- El catálogo declara que no representa disponibilidad por Organization. No consume ni suplanta InstrumentAccess.

# Resource alineado

- `AdminResourceDto` tipa `provider` y las vistas global y por Organization lo proyectan cuando llega en el GET.
- Se retiró de los detalles la lectura de metadata y aliases no expuestos por `AdminResourceDto`; no se reconstruye metadata.

# CommunicationAction proyectado

- `CommunicationActionDto` y `AdminCommunicationActionService` consumen `GET /admin/communication-actions`.
- Organization Detail filtra evidencia solo por igualdad entre `CommunicationAction.organizationId` y el `id` de Organization.
- La sección es read-only y muestra operación, canal, estado, correlación, evidencia y error registrados.

# Contratos utilizados

- `GET /admin/instruments`
- `GET /admin/resources`, `GET /admin/resources/{id}`, `GET /admin/access/organizations/{id}/resources`
- `GET /admin/communication-actions`

# Bloqueos que permanecen

- InstrumentAccess permanece bloqueado: Organization no expone un `organizationRef` UUID utilizable.
- Service, Artifact y Deployment permanecen bloqueados: no tienen DTO ni proyección HTTP administrativa consumible.

# Cambios visibles

- El catálogo de Instrument muestra estado canónico.
- Resource muestra proveedor y deja de presentar metadata no devuelta por el GET.
- Organization Detail incorpora evidencia comunicacional con `LOADING`, `EMPTY`, `READY` y `ERROR` independientes.

# Validación

- Typecheck app, typecheck spec, specs afectados y build ejecutados correctamente.
