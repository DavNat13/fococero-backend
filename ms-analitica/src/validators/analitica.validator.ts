import { z } from "zod";

const SeveridadEnum = z.enum(["ALTA", "MEDIA", "BAJA"]);

export const StatsQuerySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    categorias: z
      .preprocess((val) => {
        if (typeof val === "string")
          return val.split(",").map((s) => s.trim().toUpperCase());
        if (Array.isArray(val)) return val.map((s) => String(s).toUpperCase());
        return val;
      }, z.array(z.string()).min(1))
      .optional(),
    severidad: SeveridadEnum.optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message:
      "La fecha de inicio (startDate) no puede ser posterior a la fecha de fin (endDate)",
    path: ["startDate"],
  });

export const HeatmapQuerySchema = StatsQuerySchema.extend({
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),
}).refine(
  (data) => {
    const presentCount = [
      data.minLat,
      data.maxLat,
      data.minLng,
      data.maxLng,
    ].filter((c) => c !== undefined).length;
    return presentCount === 0 || presentCount === 4;
  },
  {
    message:
      "Debe proporcionar las 4 coordenadas del bounding box (minLat, maxLat, minLng, maxLng) o ninguna.",
    path: ["minLat"],
  },
);

export const GeoHashQuerySchema = z.object({
  geohash: z.string().min(4).max(12),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export const RadioQuerySchema = StatsQuerySchema.extend({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radioMetros: z.coerce.number().int().min(10).max(5000).default(1000),
});

export type TStatsQuery = z.infer<typeof StatsQuerySchema>;
export type THeatmapQuery = z.infer<typeof HeatmapQuerySchema>;
export type TGeoHashQuery = z.infer<typeof GeoHashQuerySchema>;
export type TRadioQuery = z.infer<typeof RadioQuerySchema>;
