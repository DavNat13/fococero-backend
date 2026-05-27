// ms-multimedia/src/controllers/multimedia.controller.ts

import { Request, Response, NextFunction } from 'express';
import { MultimediaService } from '../services/multimedia.service';
import { ArchivoRepository } from '../repositories/archivo.repository';
import { ContextoMultimedia } from '../models/archivo.model';
import { bucket } from '../config/firebase';

// Helpers importados
import { successResponse } from '../helpers/response.helper';
import { AppError } from '../helpers/error.helper';
import { logger } from '../config/logger';

export class MultimediaController {
    /**
     * 1. SUBIR ARCHIVO (Nace Huérfano)
     * POST /api/v1/multimedia/upload
     */
    static async subirArchivo(req: Request, res: Response, next: NextFunction) {
        try {
            const file = req.file;
            const userId = req.user?.id;
            const contextoStr = req.body.contexto as string;

            if (!file) throw new AppError('No se proporcionó ningún archivo.', 400);
            if (!userId) throw new AppError('Usuario no identificado.', 401);

            const contextoValido = Object.values(ContextoMultimedia).includes(
                contextoStr as ContextoMultimedia,
            )
                ? (contextoStr as ContextoMultimedia)
                : ContextoMultimedia.REPORTE;

            const url_publica = await MultimediaService.procesarYSubirImagen(
                file.buffer,
                contextoValido,
            );

            const archivoDB = await ArchivoRepository.crear({
                url_publica,
                formato: 'image/webp',
                peso_bytes: file.size,
                id_usuario: userId,
                contexto: contextoValido,
                metadata: {
                    nombreOriginal: file.originalname,
                    mimeOriginal: file.mimetype,
                },
            });

            return successResponse(res, 201, 'Archivo procesado y subido con éxito.', archivoDB);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 2. VINCULAR ARCHIVO (Adopción)
     * PATCH /api/v1/multimedia/:id/vincular
     */
    static async vincularArchivo(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const archivoVinculado = await ArchivoRepository.vincularEntidad(id);

            if (!archivoVinculado) throw new AppError('Archivo no encontrado o eliminado.', 404);

            return successResponse(res, 200, 'Archivo vinculado exitosamente.', archivoVinculado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * 3. ELIMINAR ARCHIVO (Soft Delete)
     * DELETE /api/v1/multimedia/:id
     */
    static async eliminarArchivo(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const eliminado = await ArchivoRepository.eliminarLogico(id);

            if (!eliminado) throw new AppError('Archivo no encontrado o ya estaba eliminado.', 404);

            return successResponse(res, 200, 'Archivo eliminado lógicamente.');
        } catch (error) {
            next(error);
        }
    }

    /**
     * 4. LIMPIEZA INTERNA (Barrendero de Huérfanos)
     * GET /api/v1/multimedia/internal/cleanup
     */
    static async limpiarHuerfanos(req: Request, res: Response, next: NextFunction) {
        try {
            const HORAS_EXPIRACION = 24;
            const huerfanos = await ArchivoRepository.obtenerHuerfanosExpirados(HORAS_EXPIRACION);

            if (huerfanos.length === 0) {
                return successResponse(res, 200, 'No hay archivos huérfanos para limpiar.');
            }

            let borradosFisicos = 0;

            for (const archivo of huerfanos) {
                try {
                    const urlParts = archivo.url_publica.split(`${bucket.name}/`);
                    if (urlParts.length === 2) {
                        const filePath = urlParts[1];
                        await bucket.file(filePath).delete({ ignoreNotFound: true });
                        borradosFisicos++;
                    }
                    await ArchivoRepository.eliminarLogico(archivo.id);
                } catch (err) {
                    logger.error(`Error limpiando archivo físico ${archivo.id}:`, err);
                }
            }

            return successResponse(res, 200, 'Proceso de limpieza finalizado.', {
                huerfanos_encontrados: huerfanos.length,
                eliminados_firebase: borradosFisicos,
            });
        } catch (error) {
            next(error);
        }
    }
}
