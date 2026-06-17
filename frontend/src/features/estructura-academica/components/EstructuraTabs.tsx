import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Carreras", path: "/estructura/carreras" },
  { label: "Cohortes", path: "/estructura/cohortes" },
  { label: "Materias", path: "/estructura/materias" },
];

export function EstructuraTabs() {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
