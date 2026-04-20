import { z } from "zod";

export const PaginacionQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export const UuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const RangoFechasSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de inicio no puede ser posterior a la fecha de fin",
    path: ["startDate"],
  });
