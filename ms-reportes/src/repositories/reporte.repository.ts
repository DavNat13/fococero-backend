// src/repositories/reporte.repository.ts

import { PoolClient, QueryConfig } from 'pg';
import { pool } from '../config/db';
import {
    IReporte,
    ICreateReporteDTO,
    IUpdateReporteDTO,
    EstadoReporte,
    ICategoriaIncidente,
    IHistorialEstado,
} from '../models/reporte.model';

export class ReporteRepository {
    // --- CATEGORÍAS ---
    /**
     * Obtiene el catálogo de categorías activas para el frontend.
     */
    static async obtenerCategorias(): Promise<ICategoriaIncidente[]> {
        const query =
            'SELECT * FROM categorias_incidente WHERE activo = true ORDER BY nivel_prioridad DESC;';
        const result = await pool.query(query);
        return result.rows;
    }

    // --- REPORTES ---
    /**
     * Crea un nuevo reporte insertando latitud y longitud, lo cual dispara la generación
     * automática del campo 'ubicacion' de PostGIS.
     */
    static async crear(data: ICreateReporteDTO): Promise<IReporte> {
        const query: QueryConfig = {
            name: 'crear-reporte',
            text: `
                INSERT INTO reportes (categoria_id, titulo, descripcion, latitud, longitud, id_ciudadano, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *, ST_AsGeoJSON(ubicacion)::json as ubicacion;
            `,
            values: [
                data.categoria_id,
                data.titulo,
                data.descripcion,
                data.latitud,
                data.longitud,
                data.id_ciudadano,
                data.metadata || {},
            ],
        };

        const result = await pool.query(query);
        return result.rows[0];
    }

    /**
     * Obtiene todos los reportes con soporte para paginación y filtros dinámicos.
     */
    static async obtenerTodos(
        limit: number,
        offset: number,
        filtros: { estado?: string; categoria_id?: string },
    ): Promise<{ total: number; data: IReporte[] }> {
        const values: (string | number)[] = [limit, offset];
        let whereClause = '';

        if (filtros.estado) {
            values.push(filtros.estado);
            whereClause += ` AND estado = $${values.length}`;
        }
        if (filtros.categoria_id) {
            values.push(filtros.categoria_id);
            whereClause += ` AND categoria_id = $${values.length}`;
        }

        const selectQuery = `
            SELECT *, ST_AsGeoJSON(ubicacion)::json as ubicacion 
            FROM reportes 
            WHERE 1=1 ${whereClause} 
            ORDER BY created_at DESC LIMIT $1 OFFSET $2;
        `;

        const countQuery = `SELECT COUNT(*) FROM reportes WHERE 1=1 ${whereClause};`;

        const [selectResult, countResult] = await Promise.all([
            pool.query(selectQuery, values),
            pool.query(countQuery, values.slice(2)),
        ]);

        return {
            total: parseInt(countResult.rows[0].count, 10),
            data: selectResult.rows as IReporte[],
        };
    }

    static async obtenerPorId(id: string): Promise<IReporte | null> {
        const query: QueryConfig = {
            name: 'obtener-reporte-id',
            text: `SELECT *, ST_AsGeoJSON(ubicacion)::json as ubicacion FROM reportes WHERE id = $1;`,
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows.length ? result.rows[0] : null;
    }

    static async obtenerPorCiudadano(
        uid: string,
        limit: number,
        offset: number,
    ): Promise<{ total: number; data: IReporte[] }> {
        const selectQuery: QueryConfig = {
            name: 'obtener-mis-reportes',
            text: `SELECT *, ST_AsGeoJSON(ubicacion)::json as ubicacion FROM reportes WHERE id_ciudadano = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;`,
            values: [uid, limit, offset],
        };
        const countQuery: QueryConfig = {
            name: 'contar-mis-reportes',
            text: `SELECT COUNT(*) FROM reportes WHERE id_ciudadano = $1;`,
            values: [uid],
        };

        const [selectResult, countResult] = await Promise.all([
            pool.query(selectQuery),
            pool.query(countQuery),
        ]);

        return {
            total: parseInt(countResult.rows[0].count, 10),
            data: selectResult.rows as IReporte[],
        };
    }

    static async actualizarParcial(id: string, data: IUpdateReporteDTO): Promise<IReporte | null> {
        const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
        if (entries.length === 0) return null;

        const setClause = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
        const values = entries.map(([_, v]) => v);

        const query = {
            text: `UPDATE reportes SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *, ST_AsGeoJSON(ubicacion)::json as ubicacion;`,
            values: [id, ...values],
        };

        const result = await pool.query(query);
        return result.rows.length ? result.rows[0] : null;
    }

    static async eliminar(id: string): Promise<boolean> {
        const query: QueryConfig = {
            name: 'eliminar-reporte',
            text: `DELETE FROM reportes WHERE id = $1;`,
            values: [id],
        };
        const result = await pool.query(query);
        return (result.rowCount ?? 0) > 0;
    }

    // --- HISTORIAL Y ESTADOS ---
    /**
     * Actualiza el estado del reporte y crea una entrada en el historial dentro de una transacción.
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
                text: `UPDATE reportes SET estado = $1 WHERE id = $2 RETURNING *, ST_AsGeoJSON(ubicacion)::json as ubicacion;`,
                values: [estadoNuevo, reporteId],
            };

            const historyQuery: QueryConfig = {
                name: 'insertar-historial-reporte',
                text: `INSERT INTO historial_estados (reporte_id, estado_anterior, estado_nuevo, id_usuario_modificador, comentarios) VALUES ($1, $2, $3, $4, $5);`,
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

    static async obtenerHistorialPorReporte(reporteId: string): Promise<IHistorialEstado[]> {
        const query: QueryConfig = {
            name: 'obtener-historial',
            text: 'SELECT * FROM historial_estados WHERE reporte_id = $1 ORDER BY created_at DESC;',
            values: [reporteId],
        };
        const result = await pool.query(query);
        return result.rows;
    }
}
