// ==========================================
// 🗄️ REPOSITORIO: MS-ALERTAS
// ==========================================

import { pool } from '../config/database';
import { IAlerta, EstadoAlerta } from '../models/alerta.model';

export class AlertaRepository {
    /**
     * Crea una nueva alerta en la base de datos con coordenadas PostGIS
     */
    static async crear(alerta: IAlerta): Promise<IAlerta> {
        const { foco_id, usuario_id, tipo, gravedad, descripcion, imagenes, ubicacion, metadata } =
            alerta;

        const lng = ubicacion.coordinates[0];
        const lat = ubicacion.coordinates[1];

        // Usamos ST_SetSRID y ST_MakePoint para decirle a PostGIS que son coordenadas reales (SRID 4326 = WGS84)
        const query = `
            INSERT INTO alertas (
                foco_id, usuario_id, tipo, gravedad, descripcion, imagenes, ubicacion, metadata
            ) 
            VALUES (
                $1, $2, $3, COALESCE($4, 'MEDIA'), $5, COALESCE($6, '{}'), ST_SetSRID(ST_MakePoint($7, $8), 4326), COALESCE($9, '{}')
            )
            RETURNING 
                id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en;
        `;

        const values = [
            foco_id || null,
            usuario_id,
            tipo,
            gravedad || 'MEDIA',
            descripcion,
            imagenes || [],
            lng,
            lat,
            metadata || {},
        ];

        const { rows } = await pool.query(query, values);
        return this.mapearFilaAAlerta(rows[0]);
    }

    /**
     * Busca alertas dentro de un radio específico (ej. a 5km a la redonda)
     */
    static async encontrarCercanas(
        lng: number,
        lat: number,
        radioMetros: number,
    ): Promise<IAlerta[]> {
        // ST_DWithin es una función espacial ultra rápida optimizada por el índice GIST que creamos en init.sql
        // IMPORTANTE: Agregamos "eliminado_en IS NULL" para respetar el borrado lógico
        const query = `
            SELECT 
                id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en
            FROM alertas
            WHERE ST_DWithin(
                ubicacion, 
                ST_SetSRID(ST_MakePoint($1, $2), 4326), 
                $3, 
                true -- true indica que el cálculo es en metros (geography based)
            ) AND eliminado_en IS NULL
            ORDER BY fecha_creacion DESC;
        `;

        const values = [lng, lat, radioMetros];
        const { rows } = await pool.query(query, values);

        return rows.map((fila) => this.mapearFilaAAlerta(fila));
    }

    /**
     * Actualiza el estado de una alerta (Esto disparará automáticamente el Trigger del historial en la BD)
     */
    static async actualizarEstado(id: string, nuevoEstado: EstadoAlerta): Promise<IAlerta | null> {
        const query = `
            UPDATE alertas
            SET estado = $1
            WHERE id = $2 AND eliminado_en IS NULL
            RETURNING 
                id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en;
        `;

        const values = [nuevoEstado, id];
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) return null;
        return this.mapearFilaAAlerta(rows[0]);
    }

    /**
     * Borrado Lógico (Soft Delete)
     */
    static async eliminar(id: string): Promise<boolean> {
        const query = `
            UPDATE alertas
            SET eliminado_en = NOW()
            WHERE id = $1 AND eliminado_en IS NULL
            RETURNING id;
        `;
        const { rowCount } = await pool.query(query, [id]);
        return (rowCount ?? 0) > 0;
    }

    /**
     * 🛠️ Helper privado: Transforma la fila cruda de Postgres a nuestra interfaz IAlerta
     */
    private static mapearFilaAAlerta(fila: any): IAlerta {
        return {
            id: fila.id,
            foco_id: fila.foco_id,
            usuario_id: fila.usuario_id,
            tipo: fila.tipo,
            gravedad: fila.gravedad,
            estado: fila.estado,
            descripcion: fila.descripcion,
            imagenes: fila.imagenes,
            ubicacion: {
                type: 'Point',
                coordinates: [fila.lng, fila.lat], // Convertimos las columnas separadas al formato GeoJSON
            },
            metadata: fila.metadata,
            fecha_creacion: fila.fecha_creacion,
            fecha_actualizacion: fila.fecha_actualizacion,
            eliminado_en: fila.eliminado_en,
        };
    }
}
