# Tasks — Admin Dashboard Unificado

> Scope: **solo frontend**. Sin cambios de backend ni base de datos. Governance: **BAJO** (UI pura).
> Reutilizar features existentes (`estructura-academica`, `usuarios-tenant`, `liquidaciones`, `auditoria`) sin modificar su lógica interna — solo reubicar sus paths de montaje.

## 1. Configuración declarativa de navegación

- [x] 1.1 Crear `frontend/src/features/admin-dashboard/config/adminNav.ts` con el tipo `AdminNavItem { section: "admin" | "finanzas"; label; path; permission }` y la tabla `ADMIN_NAV` (Estructura, Usuarios, Auditoría, Liquidaciones).
- [x] 1.2 Exportar helper `getFirstAccessiblePanelPath(permissions: string[]): string | null` que devuelve el path de la primera sección visible según el orden estructura → usuarios → auditoría → finanzas (test unitario primero).

## 2. AdminLayout

- [x] 2.1 Crear `frontend/src/features/admin-dashboard/components/AdminLayout.tsx` con estructura `flex`: slot para `<AdminSidebar/>` + `<main><Outlet/></main>`.
- [x] 2.2 En `AdminLayout`, agregar guard de entrada: si el usuario no tiene NINGÚN permiso de panel, renderizar la pantalla 403 (reutilizar el patrón visual de `RequirePermission`).

## 3. AdminSidebar

- [x] 3.1 Crear `frontend/src/features/admin-dashboard/components/AdminSidebar.tsx` que consuma `ADMIN_NAV` y `useAuth().permissions`.
- [x] 3.2 Filtrar ítems por permiso y agrupar por sección; ocultar una sección entera si no queda ningún ítem visible en ella.
- [x] 3.3 Renderizar cada ítem con `NavLink` y estado activo coherente con el sidebar principal (`bg-brand-50 text-brand-700` activo).

## 4. Reagrupación de rutas bajo `/panel/*` (App.tsx)

- [x] 4.1 Montar la ruta padre `/panel` con `AdminLayout` dentro de `AppLayout` (debajo de `ProtectedRoute`).
- [x] 4.2 Mover rutas de estructura a `/panel/estructura/*` (index→carreras, carreras, cohortes, materias), cada una envuelta en `RequirePermission permission="estructura:gestionar"`.
- [x] 4.3 Mover rutas de usuarios a `/panel/usuarios/*` (index→lista, nuevo, :id/editar) con `RequirePermission permission="admin:gestionar-usuarios"`.
- [x] 4.4 Mover rutas de auditoría a `/panel/auditoria/*` (index→panel, log) con `RequirePermission permission="auditoria:ver"`.
- [x] 4.5 Mover rutas de liquidaciones a `/panel/finanzas/liquidaciones/*` (index→periodo, historial, grilla, facturas) con `RequirePermission permission="liquidaciones:ver"`.
- [x] 4.6 Agregar el index `/panel` que redirige (`getFirstAccessiblePanelPath`) a la primera sección visible, o 403 si no hay ninguna.

## 5. Redirects de compatibilidad (rutas planas antiguas)

- [x] 5.1 Reemplazar las rutas planas antiguas por `<Navigate replace>` a su equivalente `/panel/*`: `/estructura` y `/estructura/*`, `/usuarios` y `/usuarios/*`, `/auditoria` y `/auditoria/*`, `/liquidaciones` y `/liquidaciones/*`.
- [x] 5.2 Verificar que los redirects preserven sub-paths y params (`/usuarios/:id/editar` → `/panel/usuarios/:id/editar`).

## 6. Limpieza del sidebar principal (AppLayout)

- [x] 6.1 Eliminar de `menu_entries` (sección `administracion`) las entradas "Estructura Académica", "Usuarios", "Auditoría" y "Liquidaciones".
- [x] 6.2 Agregar entrada "Panel de Administración" → `/panel` (visible con cualquiera de `estructura:gestionar | admin:gestionar-usuarios | auditoria:ver`).
- [x] 6.3 Agregar entrada "Finanzas" → `/panel/finanzas/liquidaciones` (visible con `liquidaciones:ver`).
- [x] 6.4 Verificar que el estado activo del sidebar principal resalte la entrada "Panel" en cualquier sub-ruta de `/panel`.

## 7. Tests

- [x] 7.1 Test unitario de `getFirstAccessiblePanelPath` para cada combinación de permisos (solo finanzas, solo auditoría, admin completo, sin permisos → null).
- [x] 7.2 Test de `AdminSidebar`: ADMIN ve los 3 ítems de Admin; FINANZAS ve solo la sección Finanzas; COORDINADOR (solo `auditoria:ver`) ve únicamente Auditoría en la sección Admin.
- [x] 7.3 Test de visibilidad en el sidebar principal: ALUMNO/PROFESOR/TUTOR no ven las entradas "Panel" ni "Finanzas".
- [x] 7.4 Test de guard de ruta: acceso directo a `/panel/usuarios` con un usuario que solo tiene `auditoria:ver` → 403; acceso directo a `/panel/estructura/carreras` sin `estructura:gestionar` → 403.
- [x] 7.5 Test de redirect de compatibilidad: navegar a `/liquidaciones` redirige a `/panel/finanzas/liquidaciones`; `/estructura/carreras` redirige a `/panel/estructura/carreras`.
- [x] 7.6 Smoke test del `AdminLayout`: usuario sin ningún permiso de panel que entra a `/panel` ve 403.

## 8. Verificación final

- [x] 8.1 Correr la suite de frontend completa y confirmar que los tests preexistentes de `liquidaciones` y `auditoria` siguen verdes tras el cambio de paths.
- [x] 8.2 Verificar build de Vite/TypeScript sin errores de tipos ni imports rotos.
