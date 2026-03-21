import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

// Comprobar la conexión al iniciar
pool.connect()
    .then(() => console.log('📦 Conectado exitosamente a PostgreSQL (FocoCero DB)'))
    .catch((err: any) => console.error('❌ Error conectando a la base de datos:', err));