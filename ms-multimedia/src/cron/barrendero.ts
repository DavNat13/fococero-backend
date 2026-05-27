// ms-multimedia/src/cron/barrendero.ts

import cron from 'node-cron';
import { envs } from '../config/envs';
import { logger } from '../config/logger';

export const iniciarBarrendero = () => {
    /**
     * Expresión Cron: '0 3 * * *'
     * Se ejecutará todos los días exactamente a las 03:00 AM (hora del servidor/contenedor)
     * Es la hora ideal porque el tráfico de la app suele ser el más bajo.
     */
    cron.schedule('0 3 * * *', async () => {
        logger.info('🧹 [CRON] Iniciando jornada del Barrendero: Limpieza de huérfanos...');

        try {
            const url = `http://localhost:${envs.PORT}/api/v1/multimedia/internal/cleanup`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            logger.info('✨ [CRON] Jornada finalizada con éxito.');
            logger.info(`📊 Resultados:`, result.data || result.message);
            logger.info('--------------------------------------------------');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error('⚠️ [CRON] Fallo crítico durante la limpieza automática:', errorMessage);
        }
    });

    logger.info('🕒 [CRON] Sistema Barrendero armado y programado (03:00 AM).');
};
