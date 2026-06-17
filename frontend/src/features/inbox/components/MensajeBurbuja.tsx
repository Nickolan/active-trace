import type { Mensaje } from "@/features/inbox/types/inbox";

interface MensajeBurbujaProps {
  mensaje: Mensaje;
  esPropio: boolean;
  nombreAutor: string;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MensajeBurbuja({ mensaje, esPropio, nombreAutor }: MensajeBurbujaProps) {
  return (
    <div
      className={`flex ${esPropio ? "justify-end" : "justify-start"}`}
      data-testid={esPropio ? "burbuja-propia" : "burbuja-ajena"}
    >
      <div
        className={`max-w-xs rounded-2xl px-4 py-2 shadow-sm lg:max-w-md ${
          esPropio
            ? "rounded-br-none bg-brand-100 text-brand-900"
            : "rounded-bl-none bg-gray-100 text-gray-900"
        }`}
      >
        {!esPropio && (
          <p className="mb-1 text-xs font-semibold text-brand-700">{nombreAutor}</p>
        )}
        <p className="text-sm">{mensaje.cuerpo}</p>
        <p className="mt-1 text-right text-xs text-gray-400">
          {formatTimestamp(mensaje.creado_at)}
        </p>
      </div>
    </div>
  );
}
