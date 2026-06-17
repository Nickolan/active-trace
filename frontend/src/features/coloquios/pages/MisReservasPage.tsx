import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useMisReservas } from "@/features/coloquios/hooks/useColoquios";
import type { ReservaResponse } from "@/features/coloquios/types/coloquios";

const estado_colors: Record<string, string> = {
  confirmada: "bg-green-100 text-green-800",
  pendiente: "bg-yellow-100 text-yellow-800",
  cancelada: "bg-red-100 text-red-800",
};

export function MisReservasPage() {
  const { data, isLoading, isError, error } = useMisReservas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message ?? "Error al cargar tus reservas."}
      />
    );
  }

  const reservas: ReservaResponse[] = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Coloquios</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tus reservas de coloquio
        </p>
      </div>

      {reservas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No tenés reservas de coloquio.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Evaluación
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {reservas.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {r.evaluacion_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(r.fecha_hora).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        estado_colors[r.estado] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
