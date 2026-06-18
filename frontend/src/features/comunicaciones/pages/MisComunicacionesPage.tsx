import { useEffect, useState } from "react";
import {
  getMisRecibidas,
  type ComunicacionRecibidaItem,
} from "@/features/comision/services/comunicaciones";

export function MisComunicacionesPage() {
  const [items, setItems] = useState<ComunicacionRecibidaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ComunicacionRecibidaItem | null>(null);

  const tamano = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMisRecibidas(pagina, tamano)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError("No se pudieron cargar las comunicaciones."))
      .finally(() => setLoading(false));
  }, [pagina]);

  const totalPaginas = Math.ceil(total / tamano);

  function formatFecha(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Mis comunicaciones
      </h1>

      {loading && (
        <p className="text-sm text-gray-500">Cargando...</p>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-gray-500">
          No recibiste ninguna comunicación todavía.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Asunto
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    De
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelected(item)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.asunto}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.remitente_nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatFecha(item.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={item.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Página {pagina} de {totalPaginas}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => p - 1)}
                  className="rounded-md border px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                  className="rounded-md border px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <ComunicacionModal
          item={selected}
          onClose={() => setSelected(null)}
          formatFecha={formatFecha}
        />
      )}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    Enviado: "bg-green-100 text-green-700",
    Pendiente: "bg-yellow-100 text-yellow-700",
    Error: "bg-red-100 text-red-700",
    Cancelado: "bg-gray-100 text-gray-500",
    Enviando: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${map[estado] ?? "bg-gray-100 text-gray-600"}`}
    >
      {estado}
    </span>
  );
}

function ComunicacionModal({
  item,
  onClose,
  formatFecha,
}: {
  item: ComunicacionRecibidaItem;
  onClose: () => void;
  formatFecha: (iso: string | null) => string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">{item.asunto}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>
        <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
          <dt className="font-medium">De</dt>
          <dd>{item.remitente_nombre ?? "—"}</dd>
          <dt className="font-medium">Fecha</dt>
          <dd>{formatFecha(item.created_at)}</dd>
          <dt className="font-medium">Estado</dt>
          <dd>
            <EstadoBadge estado={item.estado} />
          </dd>
        </dl>
        <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
          {item.cuerpo}
        </div>
      </div>
    </div>
  );
}
