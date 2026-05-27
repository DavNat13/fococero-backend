import { QueryConfig } from 'pg';
import { pool } from '../config/db';
import {
    IDespacho,
    DespachoStatus,
    ICreateDespachoDTO,
    IFinishDespachoDTO,
} from '../models/despacho.model';

export class DespachoRepository {
    static async create(data: ICreateDespachoDTO): Promise<IDespacho> {
        const query: QueryConfig = {
            name: 'create-despacho-log',
            text: `
                INSERT INTO logs_despacho (
                    alerta_id, correlation_id, organismo, prioridad, 
                    request_payload, endpoint_url, estado
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (correlation_id, organismo) DO UPDATE 
                    SET intentos_actuales = logs_despacho.intentos_actuales + 1,
                        updated_at = CURRENT_TIMESTAMP
                RETURNING *;
            `,
            values: [
                data.alerta_id,
                data.correlation_id,
                data.organismo,
                data.prioridad,
                data.request_payload,
                data.endpoint_url,
                DespachoStatus.PENDIENTE,
            ],
        };

        const result = await pool.query<IDespacho>(query);
        return result.rows[0];
    }

    static async updateStatus(id: string, estado: DespachoStatus): Promise<void> {
        const query: QueryConfig = {
            text: 'UPDATE logs_despacho SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;',
            values: [estado, id],
        };
        await pool.query(query);
    }

    static async finish(id: string, result: IFinishDespachoDTO): Promise<void> {
        const query: QueryConfig = {
            text: `
                UPDATE logs_despacho 
                SET estado = $1,
                    response_payload = $2,
                    duracion_ms = $3,
                    codigo_error_http = $4,
                    error_detalle = $5,
                    finalizado_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $6;
            `,
            values: [
                result.estado,
                result.response_payload || null,
                result.duracion_ms,
                result.codigo_error_http || null,
                result.error_detalle || null,
                id,
            ],
        };
        await pool.query(query);
    }

    static async findById(id: string): Promise<IDespacho | null> {
        const query: QueryConfig = {
            text: 'SELECT * FROM logs_despacho WHERE id = $1;',
            values: [id],
        };
        const result = await pool.query<IDespacho>(query);
        return result.rows[0] || null;
    }

    static async findByCorrelationId(correlation_id: string): Promise<IDespacho[]> {
        const query: QueryConfig = {
            text: 'SELECT * FROM logs_despacho WHERE correlation_id = $1 ORDER BY created_at ASC;',
            values: [correlation_id],
        };
        const result = await pool.query<IDespacho>(query);
        return result.rows;
    }

    static async getPendingRetries(): Promise<IDespacho[]> {
        const query: QueryConfig = {
            text: `
                SELECT * FROM logs_despacho 
                WHERE estado IN ('FALLIDO', 'REINTENTANDO') 
                  AND intentos_actuales <= max_reintentos_permitidos
                ORDER BY updated_at ASC;
            `,
        };
        const result = await pool.query<IDespacho>(query);
        return result.rows;
    }
}
