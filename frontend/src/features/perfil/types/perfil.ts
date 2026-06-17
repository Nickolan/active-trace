import { z } from "zod";

// ─── PerfilResponse ───────────────────────────────────────────────────────────
// Refleja GET /api/perfil — campos PII llegan enmascarados como "***XXXX"
// .passthrough() para tolerar campos extra del backend sin romper

export const PerfilResponseSchema = z
  .object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    nombre: z.string(),
    apellidos: z.string(),
    email: z.string().nullable().optional(),
    dni: z.string().nullable().optional(),
    cuil: z.string().nullable().optional(),
    banco: z.string().nullable().optional(),
    cbu: z.string().nullable().optional(),
    alias_cbu: z.string().nullable().optional(),
    regional: z.string().nullable().optional(),
    legajo_profesional: z.string().nullable().optional(),
    facturador: z.string().nullable().optional(),
    estado: z.string(),
  })
  .passthrough();

export type PerfilResponse = z.infer<typeof PerfilResponseSchema>;

// ─── PerfilUpdate ─────────────────────────────────────────────────────────────
// Body de PATCH /api/perfil — cuil EXCLUIDO estructuralmente
// .strict() rechaza campos extra (cuil nunca puede ser enviado)

export const PerfilUpdateSchema = z
  .object({
    nombre: z.string().min(1).optional(),
    apellidos: z.string().min(1).optional(),
    email: z.string().optional(),
    dni: z.string().optional(),
    banco: z.string().optional(),
    cbu: z.string().optional(),
    alias_cbu: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v === "" || (v.length >= 6 && v.length <= 20),
        { message: "El alias debe tener entre 6 y 20 caracteres" },
      ),
    regional: z.string().optional(),
    legajo_profesional: z.string().optional(),
    facturador: z.string().optional(),
  })
  .strict();

export type PerfilUpdate = z.infer<typeof PerfilUpdateSchema>;
