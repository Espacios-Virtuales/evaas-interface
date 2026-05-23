# EVAAS Interface · Frontend/backend contract map v0

Fecha: 2026-05-22

## Cliente

```txt
MeService.getMyToolAccess()
-> GET /me/tool-access
-> MyToolAccessDto[]
-> Cliente / Mis herramientas

MeService.getMyResources()
-> GET /me/resources
-> MyResourceDto[]
-> Cliente / Mis recursos
```

## Admin Access

```txt
AdminAccessService.getOrganizations()
-> GET /admin/access/organizations
-> OrganizationDto[]
-> Admin / Organizaciones

AdminAccessService.getOrganizationById(id)
-> GET /admin/access/organizations/{id}
-> OrganizationDto
-> Admin / Organizacion seleccionada

AdminAccessService.getOrganizationToolAccess(id)
-> GET /admin/access/organizations/{id}/tool-access
-> AdminToolAccessDto[]
-> Admin / ToolAccess por organizacion

AdminAccessService.getOrganizationResources(id)
-> GET /admin/access/organizations/{id}/resources
-> AdminResourceDto[]
-> Admin / Resources por organizacion
```

## Admin Commerce

```txt
AdminCommerceService.getActivations()
-> GET /admin/commerce/activations
-> ExternalCommerceActivationDto[]
-> Admin / Activaciones comerciales

AdminCommerceService.getActivationById(id)
-> GET /admin/commerce/activations/{id}
-> ExternalCommerceActivationDto
-> Admin / Detalle de activacion comercial

AdminCommerceService.createActivation(payload)
-> POST /admin/commerce/activations
-> ExternalCommerceActivationDto
-> Admin / Crear activacion comercial

AdminCommerceService.updateActivationStatus(id, payload)
-> PATCH /admin/commerce/activations/{id}/status
-> ExternalCommerceActivationDto
-> Admin / Cambiar estado de activacion comercial
```

## Admin Resources

```txt
AdminResourceService.getResources()
-> GET /admin/resources
-> AdminResourceDto[]
-> Admin / Recursos globales

AdminResourceService.getResourceById(id)
-> GET /admin/resources/{id}
-> AdminResourceDto
-> Admin / Detalle de recurso global

AdminResourceService.createResource(payload)
-> POST /admin/resources
-> AdminResourceDto
-> Admin / Crear recurso global
```
