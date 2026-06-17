import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { getFirstAccessiblePanelPath } from "../config/adminNav";

// ---------------------------------------------------------------------------
// AdminPanelIndex
// Index route for /panel — redirects to the first section the user can access.
// If the user has no panel permissions, AdminLayout already shows 403 before
// rendering children, but we add a 403 fallback here defensively.
// ---------------------------------------------------------------------------

export function AdminPanelIndex() {
  const { permissions } = useAuth();
  const firstPath = getFirstAccessiblePanelPath(permissions);

  if (!firstPath) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-6xl font-bold text-gray-300">403</h1>
          <p className="mt-4 text-lg text-gray-600">
            No tenés permisos para acceder al panel de administración.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Si creés que esto es un error, contactá al administrador.
          </p>
        </div>
      </div>
    );
  }

  return <Navigate to={firstPath} replace />;
}
