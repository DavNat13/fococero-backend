// ==========================================
// 🎮 Controladores - Placeholders
// ==========================================
// Manejan las solicitudes HTTP y delegan
// al servicio correspondiente

import { Request, Response, NextFunction } from 'express';
import { resourceService } from '../services/resource.service';
import { AppError } from '../middlewares/error.middleware';
import { z } from 'zod';

// ==========================================
// 📝 Esquemas Zod para Validacion
// ==========================================
const createResourceSchema = z.object({
    name: z.string().min(1).max(255),
});

const updateResourceSchema = z.object({
    name: z.string().min(1).max(255).optional(),
});

export class ResourceController {
    /**
     * GET /api/v1/resources
     */
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const resources = await resourceService.findAll();
            res.json({ success: true, data: resources });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/resources/:id
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const resource = await resourceService.findById(id);
            if (!resource) {
                throw new AppError('Recurso no encontrado', 404);
            }
            res.json({ success: true, data: resource });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/resources
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = createResourceSchema.parse(req.body);
            const resource = await resourceService.create(validated);
            res.status(201).json({ success: true, data: resource });
        } catch (error) {
            if (error instanceof z.ZodError) {
                next(new AppError('Datos invalidos: ' + error.errors.map(e => e.message).join(', '), 400));
            } else {
                next(error);
            }
        }
    }

    /**
     * PUT /api/v1/resources/:id
     */
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = updateResourceSchema.parse(req.body);
            const id = String(req.params.id);
            const resource = await resourceService.update(id, validated);
            if (!resource) {
                throw new AppError('Recurso no encontrado', 404);
            }
            res.json({ success: true, data: resource });
        } catch (error) {
            if (error instanceof z.ZodError) {
                next(new AppError('Datos invalidos: ' + error.errors.map(e => e.message).join(', '), 400));
            } else {
                next(error);
            }
        }
    }

    /**
     * DELETE /api/v1/resources/:id
     */
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const deleted = await resourceService.delete(id);
            if (!deleted) {
                throw new AppError('Recurso no encontrado', 404);
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const resourceController = new ResourceController();