// ms-multimedia/src/cron/barrendero.ts

import cron from 'node-cron';
import { envs } from '../config/envs';

export const iniciarBarrendero = () => {
    /**
     * Expresión Cron: '0 3 * * *'
     * Se ejecutará todos los días exactamente a las 03:00 AM (hora del servidor/contenedor)
     * Es la hora ideal porque el tráfico de la app suele ser el más bajo.
     */
    cron.schedule('0 3 * * *', async () => {
        console.log('\n🧹 [CRON] Iniciando jornada del Barrendero: Limpieza de huérfanos...');

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

            console.log('✨ [CRON] Jornada finalizada con éxito.');
            console.log(`📊 Resultados:`, result.data || result.message);
            console.log('--------------------------------------------------\n');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error('⚠️ [CRON] Fallo crítico durante la limpieza automática:', errorMessage);
        }
    });

    console.log('🕒 [CRON] Sistema Barrendero armado y programado (03:00 AM).');
};
