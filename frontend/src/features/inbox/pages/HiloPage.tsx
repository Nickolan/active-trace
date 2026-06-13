import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHilo, useResponderHilo } from "@/features/inbox/hooks/useInbox";
import { MensajeBurbuja } from "@/features/inbox/components/MensajeBurbuja";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Button } from "@/shared/components/Button";
import { useAuth } from "@/shared/hooks/useAuth";

export function HiloPage() {
  const { hiloId } = useParams<{ hiloId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useHilo(hiloId);
  const responder = useResponderHilo(hiloId ?? "");

  const [cuerpo, setCuerpo] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.mensajes?.length]);

  const handleEnviar = async () => {
    if (!cuerpo.trim()) return;
    await responder.mutateAsync({ cuerpo: cuerpo.trim() });
    setCuerpo("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    const is404 =
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 404;

    if (is404) {
      return (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">No se encontró el hilo.</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate("/inbox")}>
              Volver al inbox
            </Button>
          </div>
        </div>
      );
    }

    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : "Error al cargar el hilo"
        }
      />
    );
  }

  if (!data) return null;

  const currentUserId = user?.usuario_id ?? user?.id ?? "";
  const mensajes = data.mensajes ?? [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate("/inbox")}>
          ← Volver
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">{data.asunto}</h1>
      </div>

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto rounded-lg border bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {mensajes.length === 0 ? (
            <p className="text-center text-sm text-gray-400">No hay mensajes aún.</p>
          ) : (
            mensajes.map((msg) => (
              <MensajeBurbuja
                key={msg.id}
                mensaje={msg}
                esPropio={msg.autor_id === currentUserId}
                nombreAutor={
                  msg.autor_id === data.usuario_a_id ? "Usuario A" : "Usuario B"
                }
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Reply form */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Escribí tu respuesta…"
          rows={2}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button
          onClick={handleEnviar}
          disabled={!cuerpo.trim() || responder.isPending}
          is_loading={responder.isPending}
        >
          Enviar
        </Button>
      </div>

      {responder.isError && (
        <div className="mt-2">
          <ErrorMessage
            message={
              responder.error instanceof Error
                ? responder.error.message
                : "Error al enviar"
            }
          />
        </div>
      )}
    </div>
  );
}
