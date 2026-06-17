## ADDED Requirements

### Requirement: Layout unificado de panel bajo `/panel`

El sistema SHALL exponer todas las features de administración y finanzas bajo un layout anidado único montado en la ruta `/panel`, que provee un sidebar secundario con dos secciones diferenciadas: **Admin** (Estructura, Usuarios, Auditoría) y **Finanzas** (Liquidaciones, Facturas, Grilla Salarial).

#### Scenario: Usuario con permiso de panel ve el AdminLayout

- **WHEN** un usuario autenticado con al menos un permiso de panel (`estructura:gestionar`, `admin:gestionar-usuarios`, `auditoria:ver` o `liquidaciones:ver`) navega a `/panel`
- **THEN** se renderiza el `AdminLayout` con su sidebar secundario
- **AND** es redirigido a la primera sub-sección a la que tiene acceso (orden: estructura → usuarios → auditoría → finanzas)

#### Scenario: Usuario sin ningún permiso de panel es rechazado

- **WHEN** un usuario autenticado sin ninguno de los permisos de panel navega a `/panel`
- **THEN** el sistema muestra una pantalla 403 (sin permisos) y no renderiza el sidebar del panel

### Requirement: ADMIN ve la sección Admin completa

El sistema SHALL mostrar al usuario con permisos de administración la sección **Admin** del sidebar con acceso a Estructura Académica, Usuarios y Auditoría, y SHALL permitir navegar a cada una.

#### Scenario: ADMIN ve los tres ítems de la sección Admin

- **WHEN** un usuario con `estructura:gestionar`, `admin:gestionar-usuarios` y `auditoria:ver` abre `/panel`
- **THEN** el sidebar muestra la sección "Admin" con los ítems Estructura, Usuarios y Auditoría
- **AND** cada ítem enlaza a `/panel/estructura`, `/panel/usuarios` y `/panel/auditoria` respectivamente

#### Scenario: ADMIN accede a la gestión de estructura

- **WHEN** un usuario con `estructura:gestionar` hace clic en "Estructura" dentro del panel
- **THEN** se renderiza la pantalla de carreras bajo `/panel/estructura/carreras`

### Requirement: FINANZAS ve la sección Finanzas

El sistema SHALL mostrar al usuario con `liquidaciones:ver` la sección **Finanzas** del sidebar con acceso a Liquidaciones, Historial, Grilla Salarial y Facturas.

#### Scenario: FINANZAS ve la sección Finanzas

- **WHEN** un usuario con `liquidaciones:ver` abre `/panel`
- **THEN** el sidebar muestra la sección "Finanzas" con el ítem Liquidaciones
- **AND** al entrar puede navegar entre periodo, historial, grilla salarial y facturas bajo `/panel/finanzas/liquidaciones/*`

#### Scenario: FINANZAS puro no ve la sección Admin

- **WHEN** un usuario que solo tiene `liquidaciones:ver` (sin permisos de admin) abre `/panel`
- **THEN** el sidebar NO muestra la sección "Admin"
- **AND** al entrar a `/panel` es redirigido a `/panel/finanzas/liquidaciones`

### Requirement: COORDINADOR accede a Auditoría con scope propio pero no a Estructura ni Usuarios

El sistema SHALL permitir al COORDINADOR (que posee `auditoria:ver` pero no `estructura:gestionar` ni `admin:gestionar-usuarios`) acceder únicamente a Auditoría dentro del panel, y SHALL denegar el acceso a Estructura y Usuarios.

#### Scenario: COORDINADOR ve solo Auditoría en la sección Admin

- **WHEN** un usuario con `auditoria:ver` pero sin permisos de estructura ni usuarios abre `/panel`
- **THEN** la sección "Admin" del sidebar muestra únicamente el ítem "Auditoría"
- **AND** los ítems Estructura y Usuarios no se renderizan

#### Scenario: COORDINADOR intenta entrar directo a Estructura

- **WHEN** un COORDINADOR sin `estructura:gestionar` navega directamente a `/panel/estructura/carreras`
- **THEN** el sistema muestra una pantalla 403 y no renderiza la gestión de estructura

### Requirement: Roles no administrativos no ven el panel

El sistema SHALL ocultar toda referencia al panel de administración/finanzas a los usuarios sin ningún permiso de panel (ALUMNO, PROFESOR, TUTOR), tanto en el sidebar principal como en el acceso directo por URL.

#### Scenario: ALUMNO no ve la entrada al panel en el sidebar principal

- **WHEN** un usuario ALUMNO (sin permisos de panel) ve el sidebar principal
- **THEN** no se muestra ningún ítem "Panel de Administración" ni "Finanzas"

#### Scenario: PROFESOR intenta entrar directo al panel

- **WHEN** un usuario PROFESOR sin permisos de panel navega directamente a `/panel` o a `/panel/usuarios`
- **THEN** el sistema muestra una pantalla 403

### Requirement: Acceso directo por URL está guardado por permiso en cada ruta

El sistema SHALL proteger cada sub-ruta del panel con su permiso específico, de modo que el acceso directo por URL (sin pasar por el menú) quede igualmente controlado, independientemente del acceso a otras secciones del panel.

#### Scenario: Acceso directo a una sub-ruta sin permiso específico

- **WHEN** un usuario con `auditoria:ver` (pero sin `admin:gestionar-usuarios`) navega directamente a `/panel/usuarios`
- **THEN** el sistema muestra una pantalla 403 aunque el usuario sí tenga acceso a otra parte del panel

#### Scenario: Rutas planas antiguas redirigen al panel

- **WHEN** un usuario con el permiso correspondiente navega a una ruta plana antigua como `/liquidaciones` o `/estructura/carreras`
- **THEN** el sistema lo redirige a la ruta equivalente bajo `/panel/*` (`/panel/finanzas/liquidaciones`, `/panel/estructura/carreras`)
- **AND** la pantalla destino se renderiza protegida por su permiso
