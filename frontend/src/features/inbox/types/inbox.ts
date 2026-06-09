import { z } from "zod";

// ─── Mensaje ──────────────────────────────────────────────────────────────────
// Refleja MensajeResponse del backend

export const MensajeSchema = z
  .object({
    id: z.string().uuid(),
    hilo_id: z.string().uuid(),
    autor_id: z.string().uuid(),
    cuerpo: z.string(),
    creado_at: z.string(),
    leido_at: z.string().nullable().optional(),
  })
  .passthrough();

export type Mensaje = z.infer<typeof MensajeSchema>;

// ─── HiloResumen ─────────────────────────────────────────────────────────────
// Refleja HiloResponse del backend (lista inbox)
// tiene_no_leidos: bool que indica si hay mensajes no leídos para el usuario

export const HiloResumenSchema = z
  .object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    asunto: z.string(),
    usuario_a_id: z.string().uuid(),
    usuario_b_id: z.string().uuid(),
    tiene_no_leidos: z.boolean().default(false),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

export type HiloResumen = z.infer<typeof HiloResumenSchema>;

// ─── HiloDetalle ─────────────────────────────────────────────────────────────
// Refleja HiloConMensajesResponse del backend

export const HiloDetalleSchema = z
  .object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    asunto: z.string(),
    usuario_a_id: z.string().uuid(),
    usuario_b_id: z.string().uuid(),
    mensajes: z.array(MensajeSchema).default([]),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

export type HiloDetalle = z.infer<typeof HiloDetalleSchema>;

// ─── HiloListResponse ────────────────────────────────────────────────────────
// Wrapper paginado de GET /api/inbox

export const HiloListResponseSchema = z
  .object({
    items: z.array(HiloResumenSchema),
    total: z.number().int(),
  })
  .passthrough();

export type HiloListResponse = z.infer<typeof HiloListResponseSchema>;

// ─── NuevoHiloSchema ─────────────────────────────────────────────────────────
// Body para POST /api/inbox — .strict() rechaza campos extra

export const NuevoHiloSchema = z
  .object({
    destinatario_id: z.string().uuid({ message: "Seleccioná un destinatario" }),
    asunto: z.string().min(1, "El asunto es obligatorio").max(200, "Máximo 200 caracteres"),
    cuerpo: z.string().min(1, "El cuerpo es obligatorio"),
  })
  .strict();

export type NuevoHilo = z.infer<typeof NuevoHiloSchema>;

// ─── NuevaMensajeSchema ──────────────────────────────────────────────────────
// Body para POST /api/inbox/:hiloId/mensajes — .strict()

export const NuevaMensajeSchema = z
  .object({
    cuerpo: z.string().min(1, "El mensaje no puede estar vacío"),
  })
  .strict();

export type NuevaMensaje = z.infer<typeof NuevaMensajeSchema>;
