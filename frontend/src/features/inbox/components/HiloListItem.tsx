import type { HiloResumen } from "@/features/inbox/types/inbox";

interface HiloListItemProps {
  hilo: HiloResumen;
  currentUserId: string;
  onClick: () => void;
}

function formatRelative(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

export function HiloListItem({ hilo, currentUserId, onClick }: HiloListItemProps) {
  // Determine the "other" participant
  const otherUserId =
    hilo.usuario_a_id === currentUserId ? hilo.usuario_b_id : hilo.usuario_a_id;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg border bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      {/* Avatar placeholder */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
        {hilo.asunto.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-gray-900">
            {hilo.asunto}
          </span>
          {hilo.tiene_no_leidos && (
            <span
              data-testid="badge-no-leidos"
              className="flex-shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white"
            >
              Nuevo
            </span>
          )}
        </div>
        <p className="truncate text-xs text-gray-500">
          Participante: {otherUserId.slice(0, 8)}…
        </p>
      </div>

      <span className="flex-shrink-0 text-xs text-gray-400">
        {formatRelative(hilo.created_at)}
      </span>
    </button>
  );
}
