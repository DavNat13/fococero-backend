import { z } from "zod";

export const DateRangeSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "startDate must be before or equal to endDate",
    path: ["startDate"],
  });

export const CategoryFilterSchema = z.object({
  categorias: z.array(z.string()).optional(),
  severidad: z.enum(["ALTA", "MEDIA", "BAJA"]).optional(),
});

export const GeoBoundsSchema = z
  .object({
    minLat: z.coerce.number().min(-90).max(90),
    maxLat: z.coerce.number().min(-90).max(90),
    minLng: z.coerce.number().min(-180).max(180),
    maxLng: z.coerce.number().min(-180).max(180),
  })
  .refine((data) => data.minLat <= data.maxLat && data.minLng <= data.maxLng, {
    message: "Invalid geographical bounds",
  });

export const HeatmapQuerySchema = DateRangeSchema.merge(
  CategoryFilterSchema,
).merge(GeoBoundsSchema.partial());

export const StatsQuerySchema = DateRangeSchema.merge(CategoryFilterSchema);

export type DateRangeDTO = z.infer<typeof DateRangeSchema>;
export type HeatmapQueryDTO = z.infer<typeof HeatmapQuerySchema>;
export type StatsQueryDTO = z.infer<typeof StatsQuerySchema>;
