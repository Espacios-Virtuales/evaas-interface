# EVAAS Interface · Phase 3 admin activation detail routing

## Problema detectado

Desde `/dashboard/admin/activations`, la accion `Ver detalle` apuntaba al cauce esperado `/dashboard/admin/activations/:id`, pero esa ruta no estaba registrada en las rutas hijas del Dashboard Shell.

Al no existir match para el detalle dentro de `/dashboard/admin`, la navegacion caia en el fallback global y terminaba redirigiendo a login.

## Decision

El detalle de activacion se mantiene dentro del Dashboard Shell y usa la misma proteccion declarativa que el listado admin:

```txt
data: { roles: ['ROLE_ADMIN'] }
```

No se relajo seguridad global y no se eliminaron guards.

## Ruta final

```txt
/dashboard/admin/activations
/dashboard/admin/activations/:id
```

## Contrato usado

```http
GET /admin/commerce/activations/{id}
```

El detalle carga read-only desde `AdminCommerceService.getActivationById(id)`.

## Alcance implementado

- carga por `id` desde route params;
- estado loading;
- error recuperable con reintento;
- empty/not found para 404;
- detalle read-only con campos presentes en el DTO;
- `metadataJson` en `<pre>`, formateado solo si es JSON valido;
- accion `Volver a activaciones`;
- accion `Ver organizacion` solo si existe `organizationId`.

## Fuera de alcance

- `PATCH /admin/commerce/activations/{id}/status`;
- edicion;
- eliminacion;
- filtros avanzados;
- activaciones filtradas por organizacion;
- billing;
- commerce completo;
- mocks o datos falsos.

## Validacion manual

1. Entrar como admin.
2. Ir a `/dashboard/admin/activations`.
3. Confirmar que la lista carga correctamente.
4. Abrir `Ver detalle` y confirmar URL `/dashboard/admin/activations/{id}`.
5. Confirmar que no deriva a login.
6. Confirmar que el Dashboard Shell permanece visible.
7. Confirmar request `GET /admin/commerce/activations/{id}`.
8. Simular error backend y confirmar error recuperable.
9. Usar `Volver a activaciones`.
10. Confirmar que no hay `PATCH status` ni datos mock.
