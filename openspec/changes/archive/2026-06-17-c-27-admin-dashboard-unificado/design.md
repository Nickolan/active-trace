# Design — Admin Dashboard Unificado

## Contexto y restricciones

- Change **100% frontend**. No se toca backend, API, ni base de datos.
- Permisos ya existentes y emitidos en `user.permisos` (expuestos por `useAuth()` como `permissions: string[]`):
  - `estructura:gestionar` → estructura académica
  - `admin:gestionar-usuarios` → usuarios del tenant
  - `auditoria:ver` → auditoría y métricas
  - `liquidaciones:ver` → liquidaciones, historial, grilla salarial, facturas
- Roles relevantes (en `user.roles`): `ADMIN`, `FINANZAS`, `COORDINADOR`, además de `ALUMNO`/`PROFESOR`/`TUTOR`.
- Patrones existentes a respetar:
  - Layout anidado con `<Outlet/>` + tabs `NavLink` (ver `ColoquiosLayout.tsx`).
  - Guard de ruta `RequirePermission` que ya soporta `permission: string | string[]` con semántica **OR**.
  - Sidebar agrupado por secciones (ver `AppLayout.tsx`, que ya distingue `principal` / `coordinacion` / `administracion`).
  - Convención de carpetas: `frontend/src/features/<feature>/{pages,components,hooks,services,types}`.

## Decisión 1 — Prefijo de ruta: `/panel/*` (una sola sección con sub-secciones)

**Opciones evaluadas:**
- (A) Dos prefijos separados `/admin/*` y `/finanzas/*`.
- (B) Un único prefijo `/panel/*` con sub-secciones internas **Admin** y **Finanzas**.

**Elegida: (B) `/panel/*`.**

Razones:
- Un solo `AdminLayout` monta todo el panel; las dos secciones del sidebar (Admin / Finanzas) se renderizan condicionalmente por permiso. Evita duplicar el chrome del layout.
- Un usuario que sea ADMIN **y** FINANZAS ve ambas secciones en un único sidebar coherente, sin saltar entre dos layouts distintos.
- Menos superficie de routing y un único punto de redirect de compatibilidad.

**Estructura de rutas resultante:**

```
/panel
├── (index) → redirige a la primera sección visible según permisos
├── estructura
│   ├── (index) → redirect a carreras
│   ├── carreras
│   ├── cohortes
│   └── materias
├── usuarios
│   ├── (index)  → lista
│   ├── nuevo
│   └── :id/editar
├── auditoria
│   ├── (index)  → panel
│   └── log
└── finanzas
    └── liquidaciones
        ├── (index)   → periodo actual
        ├── historial
        ├── grilla
        └── facturas
```

`/panel` (index) calcula la primera sección a la que el usuario tiene acceso (orden: estructura → usuarios → auditoria → finanzas) y redirige; si no tiene ninguna, muestra 403.

## Decisión 2 — Redirects de compatibilidad

Las rutas planas actuales (`/estructura`, `/estructura/carreras`, `/usuarios`, `/usuarios/nuevo`, `/usuarios/:id/editar`, `/auditoria`, `/auditoria/log`, `/liquidaciones`, `/liquidaciones/historial`, `/liquidaciones/grilla`, `/liquidaciones/facturas`) se conservan como `<Navigate replace>` hacia su equivalente bajo `/panel/*`. Así no se rompe ningún enlace, marcador o test que apunte a la URL antigua. Estas rutas de redirect NO necesitan guard propio: el destino `/panel/*` ya está protegido.

## Decisión 3 — Componentes a crear

Nueva feature `frontend/src/features/admin-dashboard/`:

- **`components/AdminLayout.tsx`**
  - Estructura `flex`: `<AdminSidebar/>` a la izquierda + `<main><Outlet/></main>`.
  - Reutiliza el chrome general (sigue montado DENTRO de `AppLayout` → `ProtectedRoute`), por lo que la sesión y el header global ya están garantizados aguas arriba. `AdminLayout` aporta SOLO el sidebar secundario del panel.
  - Guard de entrada: si el usuario no tiene NINGÚN permiso de panel (`estructura:gestionar` | `admin:gestionar-usuarios` | `auditoria:ver` | `liquidaciones:ver`), renderiza 403 (reutilizando el patrón visual de `RequirePermission`).
- **`components/AdminSidebar.tsx`**
  - Define las dos secciones y sus ítems con el permiso requerido por ítem.
  - Filtra ítems por `permissions.includes(...)`. Una sección entera se oculta si no queda ningún ítem visible en ella.
  - Usa `NavLink` con estado activo (mismo estilo que el sidebar principal: `bg-brand-50 text-brand-700` activo).
- **`config/adminNav.ts`** (o `AdminNav` data module)
  - Tabla declarativa `{ section: "admin" | "finanzas", label, path, permission }[]`. Fuente única de verdad consumida tanto por `AdminSidebar` como por el cómputo del index redirect, para no duplicar la lógica de "primera sección visible".

**Definición declarativa propuesta:**

```ts
type AdminSection = "admin" | "finanzas";
interface AdminNavItem { section: AdminSection; label: string; path: string; permission: string; }

const ADMIN_NAV: AdminNavItem[] = [
  { section: "admin",    label: "Estructura", path: "/panel/estructura", permission: "estructura:gestionar" },
  { section: "admin",    label: "Usuarios",   path: "/panel/usuarios",   permission: "admin:gestionar-usuarios" },
  { section: "admin",    label: "Auditoría",  path: "/panel/auditoria",  permission: "auditoria:ver" },
  { section: "finanzas", label: "Liquidaciones", path: "/panel/finanzas/liquidaciones", permission: "liquidaciones:ver" },
];
```

## Decisión 4 — COORDINADOR accede a Auditoría pero NO a Admin completo

El control es **por permiso, no por rol**. El COORDINADOR tiene `auditoria:ver` (con scope propio resuelto en backend), pero NO tiene `estructura:gestionar` ni `admin:gestionar-usuarios`.

Consecuencia con el diseño elegido:
- En `/panel`, el COORDINADOR ve la sección **Admin** con un único ítem visible: **Auditoría**. Estructura y Usuarios no se renderizan (sin permiso → ítem filtrado).
- Si entra directo a `/panel/estructura/carreras`, el `RequirePermission permission="estructura:gestionar"` de esa ruta muestra 403.
- El scope propio de la auditoría del coordinador NO se gestiona en este change: es comportamiento de backend ya existente. Aquí solo se garantiza que la pantalla sea alcanzable.

No se introduce ningún guard "por rol ADMIN" duro: hacerlo rompería el caso COORDINADOR + Auditoría. Todo el gating es por permiso.

## Decisión 5 — Qué pasa con el sidebar principal (`AppLayout`)

- Se **eliminan** de la sección `administracion` del `AppLayout` los ítems "Estructura Académica", "Usuarios", "Auditoría" y "Liquidaciones" (ya no se navegan desde ahí).
- Se **añade** un único ítem de entrada al panel:
  - "Panel de Administración" → `/panel`, visible si el usuario tiene cualquiera de `estructura:gestionar | admin:gestionar-usuarios | auditoria:ver`.
  - "Finanzas" → `/panel/finanzas/liquidaciones`, visible si tiene `liquidaciones:ver`.
  - (Alternativa minimalista aceptable: un único ítem "Panel" hacia `/panel` cuando tenga cualquiera de los cuatro permisos.) La decisión final entre uno o dos ítems se confirma en la task de limpieza; por defecto se implementan **dos** ítems para que FINANZAS puro tenga su entrada directa.
- El resto de las secciones del `AppLayout` (`principal`, `coordinacion`) queda intacto.

## Decisión 6 — Guards: capa de ruta + capa de layout

- **Capa de layout**: `AdminLayout` bloquea a quien no tenga NINGÚN permiso de panel → 403 inmediato, sin renderizar sidebar vacío.
- **Capa de ruta**: cada ruta hija sigue envuelta en `RequirePermission` con su permiso específico (igual que hoy). Esto garantiza que el acceso directo por URL a una sub-ruta a la que el usuario no tiene permiso devuelva 403 aunque sí tenga acceso a otra parte del panel.

Doble capa = defensa en profundidad y preserva el comportamiento por-ruta existente sin regresiones.

## Diagrama de montaje

```
ProtectedRoute
└── AppLayout (sidebar principal + header global)
    ├── /  (Dashboard) …
    ├── /panel  → AdminLayout (sidebar secundario Admin/Finanzas)
    │   ├── estructura/*  [RequirePermission estructura:gestionar]
    │   ├── usuarios/*     [RequirePermission admin:gestionar-usuarios]
    │   ├── auditoria/*    [RequirePermission auditoria:ver]
    │   └── finanzas/liquidaciones/* [RequirePermission liquidaciones:ver]
    └── (redirects legacy /estructura, /usuarios, /auditoria, /liquidaciones → /panel/*)
```

## Riesgos / consideraciones

- **Tests existentes** que naveguen a rutas planas: cubiertos por los redirects, pero conviene verificar los `__tests__` de liquidaciones/auditoría tras el cambio.
- **Estado activo del sidebar principal**: el `is_active` del AppLayout usa `startsWith(entry.path)`. El ítem "Panel" debe usar `/panel` para resaltar correctamente en cualquier sub-ruta.
- **Doble sidebar en mobile**: el panel queda anidado dentro del AppLayout; en viewport chico hay que asegurar que el sidebar secundario colapse/scrollee y no compita con el principal. Se trata como detalle de implementación (Tailwind responsive), no cambia la arquitectura.
