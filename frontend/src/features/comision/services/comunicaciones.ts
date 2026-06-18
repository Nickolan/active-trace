import { api } from "@/shared/services/api";

export type ComunicacionEstado =
  | "Pendiente"
  | "En envío"
  | "Enviado"
  | "Fallido"
  | "Cancelado";

export interface ComunicacionItem {
  id: string;
  asunto: string;
  estado: ComunicacionEstado;
  total_destinatarios: number;
  enviados: number;
  fallidos: number;
  created_at: string;
  materia_id: string;
}

export interface ComunicacionesResponse {
  items: ComunicacionItem[];
  total: number;
}

export interface AlumnoAtrasadoOption {
  alumno_id: string;
  alumno: string;
  legajo: string;
  seleccionado: boolean;
}

export interface CrearComunicacionRequest {
  materia_id: string;
  asunto: string;
  cuerpo: string;
  destinatarios: string[];
}

export interface CrearComunicacionResponse {
  id: string;
  estado: ComunicacionEstado;
}

// ── Backend response shapes ───────────────────────────────────────────────────

interface BackendAtrasadoEntry {
  alumno_id: string;
  nombre: string;
  apellidos: string;
  legajo: string | null;
}

interface BackendAtrasadosResponse {
  alumnos_atrasados: BackendAtrasadoEntry[];
  total_alumnos: number;
}

interface BackendPreviewResponse {
  preview_token: string;
  preview_html: string;
  cantidad_destinatarios: number;
}

interface BackendEnvioResponse {
  lote_id: string;
  estado: string;
  total_mensajes: number;
  requiere_aprobacion: boolean;
}

interface BackendLoteResponse {
  lote_id: string;
  estado: string;
  total: number;
  enviados: number;
  fallidos: number;
}

interface BackendMisEnviosItem {
  lote_id: string;
  materia_nombre: string | null;
  created_at: string;
  total: number;
  estado: string;
}

interface BackendMisEnviosResponse {
  items: BackendMisEnviosItem[];
  total: number;
  pagina: number;
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function getComunicaciones(): Promise<ComunicacionesResponse> {
  const { data } = await api.get<BackendMisEnviosResponse>(
    `/comunicaciones/mis-envios`,
  );
  return {
    items: data.items.map((item) => ({
      id: item.lote_id,
      asunto: item.materia_nombre ?? "Comunicación",
      estado: item.estado as ComunicacionEstado,
      total_destinatarios: item.total,
      enviados: 0,
      fallidos: 0,
      created_at: item.created_at,
      materia_id: "",
    })),
    total: data.total,
  };
}

export async function getAlumnosAtrasadosParaComunicacion(
  materiaId: string,
): Promise<AlumnoAtrasadoOption[]> {
  const { data } = await api.get<BackendAtrasadosResponse>(
    `/analisis/atrasados`,
    { params: { materia_id: materiaId } },
  );
  return data.alumnos_atrasados.map((entry) => ({
    alumno_id: entry.alumno_id,
    alumno: `${entry.nombre} ${entry.apellidos}`,
    legajo: entry.legajo ?? "—",
    seleccionado: true,
  }));
}

export async function crearComunicacion(
  req: CrearComunicacionRequest,
): Promise<CrearComunicacionResponse> {
  const destinatarios = req.destinatarios.map((id) => ({
    tipo: "usuario_id",
    valor: id,
  }));

  // Step 1: obtain preview_token required by /enviar
  const { data: preview } = await api.post<BackendPreviewResponse>(
    `/comunicaciones/preview`,
    { asunto: req.asunto, cuerpo: req.cuerpo, destinatarios },
  );

  // Step 2: queue the send
  const { data } = await api.post<BackendEnvioResponse>(
    `/comunicaciones/enviar`,
    {
      preview_token: preview.preview_token,
      asunto: req.asunto,
      cuerpo: req.cuerpo,
      materia_id: req.materia_id,
      destinatarios,
      acepta_terminos: true,
      requiere_aprobacion: false,
    },
  );

  return { id: data.lote_id, estado: data.estado as ComunicacionEstado };
}

// ── Mis comunicaciones recibidas ─────────────────────────────────────────────

export interface ComunicacionRecibidaItem {
  id: string;
  asunto: string;
  cuerpo: string;
  estado: string;
  remitente_nombre: string | null;
  created_at: string;
  enviado_at: string | null;
}

export interface MisRecibidasResponse {
  items: ComunicacionRecibidaItem[];
  total: number;
  pagina: number;
}

export async function getMisRecibidas(
  pagina: number = 1,
  tamano: number = 10,
): Promise<MisRecibidasResponse> {
  const { data } = await api.get<MisRecibidasResponse>(
    `/comunicaciones/mis-recibidas`,
    { params: { pagina, tamano } },
  );
  return data;
}

export async function getComunicacion(
  loteId: string,
): Promise<ComunicacionItem> {
  const { data } = await api.get<BackendLoteResponse>(
    `/comunicaciones/${loteId}`,
  );
  return {
    id: data.lote_id,
    asunto: "",
    estado: data.estado as ComunicacionEstado,
    total_destinatarios: data.total,
    enviados: data.enviados,
    fallidos: data.fallidos,
    created_at: "",
    materia_id: "",
  };
}
