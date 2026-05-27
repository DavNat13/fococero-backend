// ==========================================
// ✅ Validadores Zod
// ==========================================
import { z } from 'zod';

// ==========================================
// Ejemplo: Esquema para recurso
// ==========================================
export const createResourceSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(255, 'Nombre muy largo'),
});

export const updateResourceSchema = z.object({
    name: z.string().min(1).max(255).optional(),
});

export const idParamSchema = z.object({
    id: z.string().uuid('ID invalido'),
});

// ==========================================
// Tipos inferidos de los esquemas
// ==========================================
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;