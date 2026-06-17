import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";

export function ColoquiosLayout() {
  const { permissions } = useAuth();
  const puede_gestionar_o_ver =
    permissions.includes("coloquios:gestionar") ||
    permissions.includes("coloquios:ver");

  const sub_nav = [
    ...(puede_gestionar_o_ver
      ? [
          { label: "Panel", path: "panel" },
          { label: "Convocatorias", path: "convocatorias" },
          { label: "Admin", path: "admin" },
        ]
      : []),
    { label: "Mis Reservas", path: "mis-reservas" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {sub_nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
