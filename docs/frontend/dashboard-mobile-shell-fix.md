# Dashboard Mobile Shell Fix

## Problema detectado

En pantallas moviles, el sidebar del Dashboard Shell podia quedar fijo sobre el contenido. Eso tapaba botones operacionales y dificultaba tocar acciones principales en vistas admin.

## Decision UX

En mobile, el sidebar se comporta como drawer controlado:

- cerrado por defecto;
- boton de menu en la topbar;
- apertura lateral sobre el contenido;
- backdrop translucido;
- cierre por backdrop, Escape o seleccion de enlace.

El contenido no queda empujado ni cubierto permanentemente por el sidebar.

## Comportamiento mobile

Para `max-width: 768px`:

- el sidebar sale del viewport cuando esta cerrado;
- al abrir, aparece como panel lateral overlay;
- el backdrop queda detras del drawer y sobre el contenido;
- el boton de menu queda por encima para permitir cerrar;
- la topbar queda visible;
- se evita scroll horizontal;
- el contenido conserva padding inferior con `safe-area-inset-bottom`.

## Comportamiento desktop

En desktop se mantiene el layout existente:

- sidebar visible por defecto;
- colapso lateral disponible desde el boton de la topbar;
- mismas rutas de navegacion;
- mismos permisos;
- sin cambios en servicios ni contratos API.

## Validaciones manuales

Validar en anchos:

- `360px`
- `390px`
- `430px`
- `768px`
- `1024px`

Checklist:

- el sidebar no queda abierto por defecto en mobile;
- el boton de menu abre y cierra el sidebar;
- el backdrop cierra el sidebar;
- un link del sidebar navega y cierra el drawer en mobile;
- botones como `Nueva organizacion`, `Nueva activacion`, `Asignar acceso` y acciones de guardado siguen siendo tocables;
- no hay scroll horizontal;
- desktop mantiene el comportamiento previo.

## Fuera de alcance

No se redisenan las vistas del dashboard, no se cambian rutas, roles, guards, servicios, contratos API ni el flujo Alta EVAAS.
