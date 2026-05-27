// ms-multimedia/src/services/multimedia.service.ts

import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../config/firebase';
import { ContextoMultimedia } from '../models/archivo.model';
import { logger } from '../config/logger';

export class MultimediaService {
    /**
     * Procesa una imagen en memoria (redimensión y conversión a WebP)
     * y la sube a Firebase Storage.
     * * @param fileBuffer El buffer de la imagen en RAM
     * @param contexto Carpeta de destino (ej. 'reporte' o 'alerta')
     * @returns La URL pública y definitiva de la imagen
     */
    static async procesarYSubirImagen(
        fileBuffer: Buffer,
        contexto: ContextoMultimedia,
    ): Promise<string> {
        try {
            // 1. Optimización extrema con Sharp
            const processedBuffer = await sharp(fileBuffer)
                .resize({
                    width: 1280, // Ancho máximo. Ideal para móviles y web.
                    withoutEnlargement: true, // Si la foto original es de 800px, no la estira a 1280px
                })
                .webp({ quality: 80 }) // Formato Next-Gen: 30% más ligero que JPG
                .toBuffer();

            // 2. Generar nombre único y definir ruta en el Bucket
            const fileName = `${contexto}/${uuidv4()}.webp`;
            const file = bucket.file(fileName);

            // 3. Subir el buffer optimizado a Firebase Storage
            await file.save(processedBuffer, {
                metadata: {
                    contentType: 'image/webp',
                    cacheControl: 'public, max-age=31536000', // Cache en navegador por 1 año
                },
            });

            // 4. Hacer público el archivo y construir la URL
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            return publicUrl;
        } catch (error) {
            logger.error('🔥 Error en el motor de procesamiento (Sharp/Firebase):', error);
            throw new Error('Fallo interno al procesar y subir la imagen a la nube.');
        }
    }
}
