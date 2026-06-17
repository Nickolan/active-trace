// ---------------------------------------------------------------------------
// Admin Dashboard — Navigation configuration
// Single source of truth for panel nav items, consumed by AdminSidebar and
// the /panel index redirect logic.
// ---------------------------------------------------------------------------

export type AdminSection = "admin" | "finanzas";

export interface AdminNavItem {
  section: AdminSection;
  label: string;
  path: string;
  permission: string;
}

/** Ordered list defining the panel navigation structure.
 * Order matters: getFirstAccessiblePanelPath respects this order. */
export const ADMIN_NAV: AdminNavItem[] = [
  {
    section: "admin",
    label: "Estructura",
    path: "/panel/estructura",
    permission: "estructura:gestionar",
  },
  {
    section: "admin",
    label: "Usuarios",
    path: "/panel/usuarios",
    permission: "admin:gestionar-usuarios",
  },
  {
    section: "admin",
    label: "Auditoría",
    path: "/panel/auditoria",
    permission: "auditoria:ver",
  },
  {
    section: "finanzas",
    label: "Liquidaciones",
    path: "/panel/finanzas/liquidaciones",
    permission: "liquidaciones:ver",
  },
];

/** Returns the path of the first panel section the user can access,
 * following the order defined in ADMIN_NAV (estructura → usuarios → auditoría → finanzas).
 * Returns null if the user has no panel permissions at all. */
export function getFirstAccessiblePanelPath(permissions: string[]): string | null {
  for (const item of ADMIN_NAV) {
    if (permissions.includes(item.permission)) {
      return item.path;
    }
  }
  return null;
}

/** Set of all permissions that grant access to any part of the panel.
 * Used by AdminLayout's entry guard. */
export const PANEL_PERMISSIONS = ADMIN_NAV.map((item) => item.permission);
