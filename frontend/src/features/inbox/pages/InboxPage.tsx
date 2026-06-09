import { useNavigate } from "react-router-dom";
import { useInbox } from "@/features/inbox/hooks/useInbox";
import { HiloListItem } from "@/features/inbox/components/HiloListItem";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Button } from "@/shared/components/Button";
import { useAuth } from "@/shared/hooks/useAuth";

export function InboxPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useInbox();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : "Error al cargar la bandeja"
        }
      />
    );
  }

  const hilos = data ?? [];
  const currentUserId = user?.id ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mensajes</h1>
        <Button onClick={() => navigate("/inbox/nuevo")}>Nuevo mensaje</Button>
      </div>

      {hilos.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white py-16 text-center">
          <p className="text-sm text-gray-500">No tenés mensajes todavía.</p>
          <div className="mt-4">
            <Button onClick={() => navigate("/inbox/nuevo")}>
              Redactar mensaje
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {hilos.map((hilo) => (
            <HiloListItem
              key={hilo.id}
              hilo={hilo}
              currentUserId={currentUserId}
              onClick={() => navigate(`/inbox/${hilo.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
