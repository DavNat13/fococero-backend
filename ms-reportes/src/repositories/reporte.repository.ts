import { PoolClient, QueryConfig } from 'pg';
import pool from '../config/db';
import { IReporte, ICreateReporteDTO, EstadoReporte } from '../models/reporte.model';

export class ReporteRepository {
    /**
     * 🚀 OPTIMIZACIÓN 1: Prepared Statements (name: 'crear-reporte').
     * PostgreSQL guardará el plan de ejecución en caché.
     */
    static async crear(data: ICreateReporteDTO): Promise<IReporte> {
        const query: QueryConfig = {
            name: 'crear-reporte',
            text: `
                INSERT INTO reportes (categoria_id, titulo, descripcion, latitud, longitud, id_ciudadano, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) -- ✅ Cast explícito para JSONB
                RETURNING *, ST_AsGeoJSON(ubicacion)::json as ubicacion;
            `,
            // ✅ Blindaje: Serialización explícita para evitar errores de tipo en PostgreSQL
            values: [
                data.categoria_id,
                data.titulo,
                data.descripcion,
                data.latitud,
                data.longitud,
                data.id_ciudadano,
                JSON.stringify(data.metadata || {}),
            ],
        };

        const result = await pool.query(query);
        return result.rows[0];
    }

    /**
     * 🚀 OPTIMIZACIÓN 2: Paralelismo y Evitar Full-Table Scans.
     * Ejecución concurrente del COUNT y el SELECT para reducir tiempos en tablas masivas.
     */
    static async obtenerTodos(
        limit: number,
        offset: number,
    ): Promise<{ total: number; data: IReporte[] }> {
        const selectQuery: QueryConfig = {
            name: 'obtener-reportes-paginados',
            text: `
                SELECT *, ST_AsGeoJSON(ubicacion)::json as ubicacion 
                FROM reportes 
                ORDER BY created_at DESC 
                LIMIT $1 OFFSET $2;
            `,
            values: [limit, offset],
        };

        const countQuery: QueryConfig = {
            name: 'contar-reportes',
            text: `SELECT COUNT(*) FROM reportes;`,
        };

        // Ejecución concurrente en hilos de base de datos distintos
        const [selectResult, countResult] = await Promise.all([
            pool.query(selectQuery),
            pool.query(countQuery),
        ]);

        return {
            total: parseInt(countResult.rows[0].count, 10),
            data: selectResult.rows as IReporte[],
        };
    }

    /**
     * 🚀 OPTIMIZACIÓN 3: Búsqueda por índice primario.
     */
    static async obtenerPorId(id: string): Promise<IReporte | null> {
        const query: QueryConfig = {
            name: 'obtener-reporte-id',
            text: `SELECT *, ST_AsGeoJSON(ubicacion)::json as ubicacion FROM reportes WHERE id = $1;`,
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows.length ? result.rows[0] : null;
    }

    /**
     * 🚀 OPTIMIZACIÓN 4: Transacción atómica para actualización e historial.
     */
    static async actualizarEstadoConHistorial(
        reporteId: string,
        estadoAnterior: EstadoReporte,
        estadoNuevo: EstadoReporte,
        idUsuarioModificador: string,
        comentarios?: string,
    ): Promise<IReporte> {
        const client: PoolClient = await pool.connect();

        try {
            await client.query('BEGIN');

            const updateQuery: QueryConfig = {
                name: 'actualizar-estado-reporte',
                text: `
                    UPDATE reportes 
                    SET estado = $1 
                    WHERE id = $2 
                    RETURNING *, ST_AsGeoJSON(ubicacion)::json as ubicacion;
                `,
                values: [estadoNuevo, reporteId],
            };

            const historyQuery: QueryConfig = {
                name: 'insertar-historial-reporte',
                text: `
                    INSERT INTO historial_estados (reporte_id, estado_anterior, estado_nuevo, id_usuario_modificador, comentarios)
                    VALUES ($1, $2, $3, $4, $5);
                `,
                values: [
                    reporteId,
                    estadoAnterior,
                    estadoNuevo,
                    idUsuarioModificador,
                    comentarios || null,
                ],
            };

            const updateResult = await client.query(updateQuery);
            await client.query(historyQuery);

            await client.query('COMMIT');
            return updateResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
