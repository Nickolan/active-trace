import { api } from "@/shared/services/api";
import type {
  HiloResumen,
  HiloDetalle,
  Mensaje,
  NuevoHilo,
  NuevaMensaje,
} from "@/features/inbox/types/inbox";

export async function fetchInbox(): Promise<HiloResumen[]> {
  const { data } = await api.get<{ items: HiloResumen[]; total: number }>("/inbox");
  return data.items;
}

export async function fetchHilo(hiloId: string): Promise<HiloDetalle> {
  const { data } = await api.get<HiloDetalle>(`/inbox/${hiloId}`);
  return data;
}

export async function responderHilo(hiloId: string, payload: NuevaMensaje): Promise<Mensaje> {
  const { data } = await api.post<Mensaje>(`/inbox/${hiloId}/mensajes`, payload);
  return data;
}

export async function crearHilo(payload: NuevoHilo): Promise<HiloDetalle> {
  const { data } = await api.post<HiloDetalle>("/inbox", payload);
  return data;
}
