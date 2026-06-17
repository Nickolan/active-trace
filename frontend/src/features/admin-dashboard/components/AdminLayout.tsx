import { Outlet } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { AdminSidebar } from "./AdminSidebar";
import { PANEL_PERMISSIONS } from "../config/adminNav";

// ---------------------------------------------------------------------------
// AdminLayout
// Nested layout for /panel/* routes. Mounts INSIDE AppLayout (ProtectedRoute
// already guarantees authentication). Adds:
//   • Entry guard: if user has NO panel permission → 403 immediately
//   • Secondary sidebar (AdminSidebar) + main content area
// ---------------------------------------------------------------------------

export function AdminLayout() {
  const { permissions } = useAuth();

  const hasAnyPanelPermission = PANEL_PERMISSIONS.some((p) =>
    permissions.includes(p)
  );

  if (!hasAnyPanelPermission) {
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

  return (
    <div className="flex min-h-full">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
