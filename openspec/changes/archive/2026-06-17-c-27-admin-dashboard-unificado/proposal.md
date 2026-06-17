## Why

Las features de administración (estructura académica, usuarios, auditoría) y de finanzas (liquidaciones, facturas, grilla salarial) ya están implementadas (C-21 a C-24), pero viven dispersas dentro del sidebar general, mezcladas con las pantallas del día a día de coordinación. Un usuario con rol ADMIN o FINANZAS no tiene un punto de entrada claro ni un contexto visual propio para operar estas herramientas. Falta un layout unificado que agrupe estas features bajo una experiencia "panel de administración / finanzas" coherente.

## What Changes

- **Nuevo `AdminLayout`** (layout anidado de React Router con su propio sidebar) que provee el chrome común para todas las pantallas de admin y finanzas.
- **Nuevo `AdminSidebar`** que muestra dos secciones diferenciadas — **Admin** (Estructura, Usuarios, Auditoría) y **Finanzas** (Liquidaciones, Facturas, Grilla Salarial) — renderizando cada ítem según los permisos del usuario.
- **Reagrupación de rutas** bajo un prefijo común `/panel/*`:
  - `/panel/estructura/*` (estructura académica)
  - `/panel/usuarios/*` (gestión de usuarios)
  - `/panel/auditoria/*` (auditoría y métricas)
  - `/panel/finanzas/liquidaciones/*` (liquidaciones, historial, grilla, facturas)
- **Redirects** desde las rutas planas antiguas (`/estructura`, `/usuarios`, `/auditoria`, `/liquidaciones`, …) hacia las nuevas rutas `/panel/*` para no romper enlaces existentes.
- **Guards por rol/permiso** en el propio layout y por ruta, de modo que el acceso directo por URL (sin pasar por el menú) quede igualmente protegido.
- **Limpieza del sidebar principal** (`AppLayout`): se retiran de la sección "Administración" los ítems que ahora viven en el panel; se deja un único punto de entrada "Panel de Administración" / "Finanzas" hacia `/panel`.
- **Sin cambios de backend ni de base de datos.** Los permisos (`estructura:gestionar`, `admin:gestionar-usuarios`, `auditoria:ver`, `liquidaciones:ver`) y los endpoints ya existen.

## Capabilities

### New Capabilities

- `admin-dashboard`: Layout unificado de administración y finanzas en el frontend. Define el agrupamiento visual de las features de admin/finanzas bajo `/panel/*`, las secciones del sidebar de admin, y las reglas de visibilidad y acceso por rol/permiso (ADMIN, FINANZAS, COORDINADOR vs. el resto).

### Modified Capabilities

<!-- Ninguna. Las capabilities de estructura-academica, finanzas-admin, liquidacion-honorarios, audit-log, etc. no cambian sus REQUISITOS de comportamiento: solo se reubica su presentación en el frontend. -->

## Impact

- **Solo frontend.** Sin cambios de API, backend ni esquema de datos.
- **Routing**: `frontend/src/App.tsx` — reagrupación de rutas bajo `/panel/*` + redirects de compatibilidad.
- **Layout nuevo**: `frontend/src/features/admin-dashboard/components/AdminLayout.tsx`, `AdminSidebar.tsx`, `AdminNav.tsx` (o equivalentes).
- **Layout existente**: `frontend/src/features/auth/components/AppLayout.tsx` — se depuran las entradas de la sección "Administración".
- **Features reutilizadas sin modificarse internamente**: `estructura-academica`, `usuarios-tenant`, `liquidaciones`, `auditoria` (solo cambian sus paths de montaje).
- **Tests**: nuevos tests de visibilidad de secciones por rol y de guards de ruta.
