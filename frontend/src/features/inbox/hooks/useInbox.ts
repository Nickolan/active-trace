import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInbox,
  fetchHilo,
  responderHilo,
  crearHilo,
} from "@/features/inbox/services/inbox";
import type { NuevaMensaje, NuevoHilo } from "@/features/inbox/types/inbox";

export function useInbox() {
  return useQuery({
    queryKey: ["inbox"],
    queryFn: fetchInbox,
  });
}

export function useHilo(hiloId: string | undefined) {
  return useQuery({
    queryKey: ["hilo", hiloId],
    queryFn: () => fetchHilo(hiloId!),
    enabled: !!hiloId,
  });
}

export function useResponderHilo(hiloId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NuevaMensaje) => responderHilo(hiloId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hilo", hiloId] });
    },
  });
}

export function useCrearHilo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NuevoHilo) => crearHilo(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}
