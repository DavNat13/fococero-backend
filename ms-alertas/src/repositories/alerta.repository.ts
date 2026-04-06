// ==========================================
// 🗄️ REPOSITORIO: MS-ALERTAS (Versión Blindada)
// ==========================================

import { pool } from '../config/database';
import { IAlerta, EstadoAlerta } from '../models/alerta.model';

export class AlertaRepository {
    // 🟢 CREAR: Con casting total para evitar errores de tipo en PostgreSQL
    static async crear(alerta: IAlerta): Promise<IAlerta> {
        const { foco_id, usuario_id, tipo, gravedad, descripcion, imagenes, ubicacion, metadata } =
            alerta;
        const lng = ubicacion.coordinates[0];
        const lat = ubicacion.coordinates[1];

        const query = `
            INSERT INTO alertas (
                foco_id, 
                usuario_id, 
                tipo, 
                gravedad, 
                descripcion, 
                imagenes, 
                ubicacion, 
                metadata
            ) 
            VALUES (
                $1, 
                $2, 
                $3::tipo_alerta,           -- Cast para ENUM tipo_alerta
                $4::gravedad_alerta,       -- Cast para ENUM gravedad_alerta
                $5, 
                $6::text[],                -- Cast para Array text[]
                ST_SetSRID(ST_MakePoint($7, $8), 4326), 
                $9::jsonb                  -- Cast para JSONB
            )
            RETURNING id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
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
            // Convertimos a string para que el driver pg lo maneje correctamente con el cast ::jsonb
            JSON.stringify(metadata || {}),
        ];

        const { rows } = await pool.query(query, values);
        return this.mapearFilaAAlerta(rows[0]);
    }

    // 🔵 LECTURA ESPACIAL: Corregida para medir en metros usando geography
    static async encontrarCercanas(
        lng: number,
        lat: number,
        radioMetros: number,
    ): Promise<IAlerta[]> {
        const query = `
            SELECT id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en
            FROM alertas
            WHERE 
                -- Uso de ::geography para cálculos precisos en metros
                ST_DWithin(
                    ubicacion::geography, 
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
                    $3
                ) 
                AND eliminado_en IS NULL
            ORDER BY fecha_creacion DESC;
        `;
        const { rows } = await pool.query(query, [lng, lat, radioMetros]);
        return rows.map((fila) => this.mapearFilaAAlerta(fila));
    }

    // 🔵 LECTURA POR USUARIO (Mis Alertas)
    static async obtenerPorUsuario(usuario_id: string): Promise<IAlerta[]> {
        const query = `
            SELECT id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en
            FROM alertas
            WHERE usuario_id = $1 AND eliminado_en IS NULL
            ORDER BY fecha_creacion DESC;
        `;
        const { rows } = await pool.query(query, [usuario_id]);
        return rows.map((fila) => this.mapearFilaAAlerta(fila));
    }

    // 🔵 LECTURA GENERAL (Panel Admin)
    static async obtenerTodas(): Promise<IAlerta[]> {
        const query = `
            SELECT id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en
            FROM alertas
            WHERE eliminado_en IS NULL
            ORDER BY fecha_creacion DESC;
        `;
        const { rows } = await pool.query(query);
        return rows.map((fila) => this.mapearFilaAAlerta(fila));
    }

    // 🔵 LECTURA POR ID (Detalle)
    static async obtenerPorId(id: string): Promise<IAlerta | null> {
        const query = `
            SELECT id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en
            FROM alertas
            WHERE id = $1 AND eliminado_en IS NULL;
        `;
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) return null;
        return this.mapearFilaAAlerta(rows[0]);
    }

    // 🟠 ACTUALIZAR ESTADO: Con casting para ENUM estado_alerta
    static async actualizarEstado(id: string, nuevoEstado: EstadoAlerta): Promise<IAlerta | null> {
        const query = `
            UPDATE alertas 
            SET estado = $1::estado_alerta -- Cast para ENUM
            WHERE id = $2 AND eliminado_en IS NULL
            RETURNING id, foco_id, usuario_id, tipo, gravedad, estado, descripcion, imagenes,
                ST_X(ubicacion::geometry) as lng, ST_Y(ubicacion::geometry) as lat,
                metadata, fecha_creacion, fecha_actualizacion, eliminado_en;
        `;
        const { rows } = await pool.query(query, [nuevoEstado, id]);
        if (rows.length === 0) return null;
        return this.mapearFilaAAlerta(rows[0]);
    }

    // 🔴 BORRADO LÓGICO
    static async eliminar(id: string): Promise<boolean> {
        const query = `
            UPDATE alertas SET eliminado_en = NOW()
            WHERE id = $1 AND eliminado_en IS NULL
            RETURNING id;
        `;
        const { rowCount } = await pool.query(query, [id]);
        return (rowCount ?? 0) > 0;
    }

    // 🛠️ HELPER PRIVADO
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
            ubicacion: { type: 'Point', coordinates: [fila.lng, fila.lat] },
            metadata: fila.metadata,
            fecha_creacion: fila.fecha_creacion,
            fecha_actualizacion: fila.fecha_actualizacion,
            eliminado_en: fila.eliminado_en,
        };
    }
}
