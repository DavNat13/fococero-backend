// src/config/database.ts

import { Pool } from 'pg';
import { envs } from './envs';

export const pool = new Pool({
    user: envs.DB_USER,
    password: envs.DB_PASSWORD, 
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    
    // Optimizaciones de Resiliencia
    max: 20, // Límite de conexiones simultáneas
    idleTimeoutMillis: 30000, // Cierra conexiones ociosas
    connectionTimeoutMillis: 5000, // Escudo: Si PostGIS no responde en 5s, lanza error en lugar de colgarse
});

pool.on('connect', () => {
    console.log('📦 Conectado exitosamente a PostgreSQL (FocoCero Geo-DB)');
});

// Escudo 3: Si la base de datos se cae a mitad de ejecución, matamos el contenedor 
// para que Docker lo reinicie fresco y reconecte automáticamente.
pool.on('error', (err: Error) => {
    console.error('❌ Error fatal o pérdida de conexión con PostgreSQL:', err.message);
    process.exit(-1); 
});

export const testDbConnection = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT PostGIS_version();');
        console.log('🗺️  Motor Espacial PostGIS detectado:', res.rows[0].postgis_version);
        
        // ¡CRÍTICO! Liberar el cliente de vuelta al pool para evitar fugas de memoria
        client.release(); 
    } catch (error: any) {
        console.error('🚨 Error crítico: No se pudo conectar a la base de datos o PostGIS no está instalado.');
        console.error(error.message);
        process.exit(1); 
    }
};