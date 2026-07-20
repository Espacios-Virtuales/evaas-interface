# EVAAS MVP operational checklist

Fecha: 2026-07-20

## Cierre piloto Admin

- [x] Dashboard Admin funcional
- [x] Organizaciones funcionales
- [x] Recursos funcionales
- [x] Activaciones funcionales
- [x] Detalle de activacion corregido
- [x] Sidebar admin usa Instrumentos como seccion principal
- [x] `/dashboard/admin/instruments` creado
- [x] Comunicador definido como primer instrumento
- [x] Liora queda enmascarado como Comunicador en UI
- [x] Recursos globales tienen detalle read-only
- [x] Recursos pueden mostrar instrumento asociado si existe evidencia

## Pendientes post piloto

- [ ] Backend expone contratos especificos de instrumentos
- [ ] Comunicador consume CommunicationAction desde backend
- [ ] CREATE_DRAFT validado end-to-end desde Java
- [ ] GET_COMMUNICATION visible desde interfaz admin
- [ ] Envio real fuera de alcance piloto

## Merge controlado

```txt
feature/admin-dashboard-v0
↓
develop
↓
preview / produccion controlada
```
