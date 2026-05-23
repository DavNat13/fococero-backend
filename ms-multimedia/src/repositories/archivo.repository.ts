// ms-multimedia/src/repositories/archivo.repository.ts

import { QueryConfig } from 'pg';
import { pool } from '../config/db';
// ✅ FIX: Se eliminó IUpdateArchivoDTO de la importación
import { IArchivoMultimedia, ICreateArchivoDTO } from '../models/archivo.model';

export class ArchivoRepository {
    /**
     * Registra un nuevo archivo en la base de datos (Nace como huérfano por defecto).
     */
    static async crear(data: ICreateArchivoDTO): Promise<IArchivoMultimedia> {
        const query: QueryConfig = {
            name: 'crear-archivo-multimedia',
            text: `
                INSERT INTO archivos_multimedia 
                (url_publica, formato, peso_bytes, id_usuario, contexto, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
            `,
            values: [
                data.url_publica,
                data.formato,
                data.peso_bytes,
                data.id_usuario,
                data.contexto,
                data.metadata || {},
            ],
        };

        const result = await pool.query(query);
        return result.rows[0];
    }

    /**
     * Busca un archivo por su ID único. Ignora los que han sido eliminados (Soft Delete).
     */
    static async obtenerPorId(id: string): Promise<IArchivoMultimedia | null> {
        const query: QueryConfig = {
            name: 'obtener-archivo-id',
            text: `SELECT * FROM archivos_multimedia WHERE id = $1 AND deleted_at IS NULL;`,
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows.length ? result.rows[0] : null;
    }

    /**
     * Quita el estado 'huérfano' de un archivo, confirmando que fue vinculado a un reporte/alerta.
     */
    static async vincularEntidad(id: string): Promise<IArchivoMultimedia | null> {
        const query: QueryConfig = {
            name: 'vincular-archivo',
            text: `
                UPDATE archivos_multimedia 
                SET es_huerfano = false 
                WHERE id = $1 AND deleted_at IS NULL 
                RETURNING *;
            `,
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows.length ? result.rows[0] : null;
    }

    /**
     * 🚀 OPTIMIZADO PARA CRONJOBS: Utiliza el índice parcial 'idx_archivos_huerfanos_limpieza'.
     * Busca archivos huérfanos que lleven más de X horas sin ser reclamados.
     */
    static async obtenerHuerfanosExpirados(horasExpiracion: number): Promise<IArchivoMultimedia[]> {
        const query: QueryConfig = {
            name: 'obtener-huerfanos-expirados',
            text: `
                SELECT * FROM archivos_multimedia 
                WHERE es_huerfano = true 
                AND deleted_at IS NULL
                AND created_at < NOW() - INTERVAL '$1 hours';
            `,
            values: [horasExpiracion],
        };

        const result = await pool.query(query);
        return result.rows;
    }

    /**
     * Realiza un Soft-Delete del registro (No borra la fila, solo marca la fecha de borrado).
     */
    static async eliminarLogico(id: string): Promise<boolean> {
        const query: QueryConfig = {
            name: 'soft-delete-archivo',
            text: `UPDATE archivos_multimedia SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL;`,
            values: [id],
        };

        const result = await pool.query(query);
        return (result.rowCount ?? 0) > 0;
    }
}
