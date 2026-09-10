# DTOs alineados

- `OrganizationDto` incorpora `logoUrl` y `brandColor`; retira los aliases no expuestos `status` y `updatedAt`.
- Se agrega `OrganizationMemberDto` con `canonicalId`, `userId`, `userEmail`, `role` y `status`.

# Endpoint Members consumido

- `AdminAccessService.getOrganizationMembers(id)` consume `GET /admin/access/organizations/{id}/members` desde el detalle de la misma Organization.

# Cambios visibles

- El resumen muestra nombre, estado enabled, Tax ID, branding y creación; Owner permanece en su sección separada.
- Branding muestra únicamente logo/color recibidos o `Branding no configurado` cuando ambos son null o ausentes.
- La sección read-only `Miembros` muestra usuario, rol y estado; no agrega acciones de escritura.

# Estados EMPTY/ERROR

- Members utiliza `LOADING`, `EMPTY`, `READY` y `ERROR`. Un fallo de Members no descarta Organization, ToolAccess ni Resources.

# Archivos modificados

- `evaas-contracts.model.ts`, `api.endpoints.ts`, `admin-access.service.ts` y sus tests.
- Organization Detail, su test y Organization List para retirar aliases del DTO de Organization.

# Validación

- Typecheck app, typecheck spec, specs afectados y build ejecutados correctamente.
