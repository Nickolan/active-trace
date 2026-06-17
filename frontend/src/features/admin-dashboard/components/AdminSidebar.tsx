import { NavLink } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { ADMIN_NAV, type AdminSection } from "../config/adminNav";

// ---------------------------------------------------------------------------
// AdminSidebar
// Secondary sidebar for the /panel/* area. Reads ADMIN_NAV and filters items
// by user permissions. Sections are hidden entirely if no item is visible.
// ---------------------------------------------------------------------------

const SECTION_LABELS: Record<AdminSection, string> = {
  admin: "Administración",
  finanzas: "Finanzas",
};

const SECTION_ORDER: AdminSection[] = ["admin", "finanzas"];

export function AdminSidebar() {
  const { permissions } = useAuth();

  // Filter items by permission
  const visibleItems = ADMIN_NAV.filter((item) =>
    permissions.includes(item.permission)
  );

  // Group by section
  const grouped = visibleItems.reduce<Record<AdminSection, typeof ADMIN_NAV>>(
    (acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section]!.push(item);
      return acc;
    },
    {} as Record<AdminSection, typeof ADMIN_NAV>
  );

  return (
    <aside className="w-56 shrink-0 border-r bg-white">
      <nav className="px-3 py-4">
        <ul className="space-y-4">
          {SECTION_ORDER.map((sectionKey) => {
            const items = grouped[sectionKey];
            // Hide section entirely if no items are visible
            if (!items || items.length === 0) return null;

            return (
              <li key={sectionKey}>
                <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {SECTION_LABELS[sectionKey]}
                </p>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-brand-50 text-brand-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
