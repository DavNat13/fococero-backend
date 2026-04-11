// src/repositories/geo.repository.ts

import { QueryConfig } from 'pg';
import { pool } from '../config/database';
import {
    IUbicacionFoco,
    ICrearFocoDTO,
    EstadoFoco,
    SeveridadFoco,
    IUpdateFocoDTO,
} from '../models/geo.model';

export class GeoRepository {
    // ============================================================================
    // 🟢 ESCRITURA (INSERT)
    // ============================================================================

    static async create(
        data: ICrearFocoDTO & { severidad: SeveridadFoco },
    ): Promise<IUbicacionFoco> {
        const query: QueryConfig = {
            text: `
                INSERT INTO public.ubicaciones (
                    reporte_id, tipo_incidente, severidad, estado, detalles,
                    radio_afectacion_metros, viento_velocidad_kmh, 
                    viento_direccion, amenaza_viviendas, 
                    coordenadas
                )
                VALUES (
                    $1, $2, $3, $4, $5, 
                    $6, $7, 
                    $8, $9, 
                    ST_SetSRID(ST_MakePoint($10, $11), 4326)::geography
                )
                RETURNING 
                    id, reporte_id, tipo_incidente, severidad, estado, detalles,
                    radio_afectacion_metros, viento_velocidad_kmh, viento_direccion, amenaza_viviendas,
                    ST_Y(coordenadas::geometry) AS latitud,
                    ST_X(coordenadas::geometry) AS longitud,
                    created_at, updated_at;
            `,
            values: [
                data.reporte_id,
                data.tipo_incidente,
                data.severidad,
                EstadoFoco.REPORTADO,
                data.detalles,
                data.radio_afectacion_metros || 50,
                data.viento_velocidad_kmh || 0,
                data.viento_direccion,
                data.amenaza_viviendas || false,
                data.longitud,
                data.latitud,
            ],
        };

        const { rows } = await pool.query(query);
        return rows[0];
    }

    // ============================================================================
    // 🔵 LECTURA (SELECT & GIS)
    // ============================================================================

    static async findAllActive(): Promise<IUbicacionFoco[]> {
        const query = `
            SELECT 
                id, reporte_id, tipo_incidente, severidad, estado, detalles,
                ST_Y(coordenadas::geometry) AS latitud,
                ST_X(coordenadas::geometry) AS longitud,
                ST_AsText(area_quemada_wkt) AS perimetro_wkt,
                created_at, updated_at
            FROM public.ubicaciones
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC;
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id: string): Promise<IUbicacionFoco | null> {
        const query: QueryConfig = {
            text: `
                SELECT 
                    id, reporte_id, tipo_incidente, severidad, estado, detalles,
                    radio_afectacion_metros, viento_velocidad_kmh, viento_direccion, amenaza_viviendas,
                    ST_Y(coordenadas::geometry) AS latitud,
                    ST_X(coordenadas::geometry) AS longitud,
                    ST_AsText(area_quemada_wkt) AS perimetro_wkt,
                    created_at, updated_at
                FROM public.ubicaciones
                WHERE id = $1 AND deleted_at IS NULL;
            `,
            values: [id],
        };
        const { rows } = await pool.query(query);
        return rows[0] || null;
    }

    static async findNearby(
        lat: number,
        lng: number,
        radioMetros: number,
    ): Promise<IUbicacionFoco[]> {
        const query: QueryConfig = {
            text: `
                SELECT 
                    id, reporte_id, tipo_incidente, severidad, estado, detalles,
                    ST_Y(coordenadas::geometry) AS latitud,
                    ST_X(coordenadas::geometry) AS longitud,
                    ST_Distance(coordenadas, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distancia_metros
                FROM public.ubicaciones
                WHERE deleted_at IS NULL
                AND ST_DWithin(
                    coordenadas,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                    $3
                )
                ORDER BY distancia_metros ASC;
            `,
            values: [lng, lat, radioMetros],
        };
        const { rows } = await pool.query(query);
        return rows;
    }

    // ============================================================================
    // 🟠 ACTUALIZACIÓN (UPDATE)
    // ============================================================================

    static async updateState(id: string, estado: EstadoFoco): Promise<IUbicacionFoco | null> {
        const query: QueryConfig = {
            text: `UPDATE public.ubicaciones SET estado = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id, estado, updated_at;`,
            values: [estado, id],
        };
        const { rows } = await pool.query(query);
        return rows[0] || null;
    }

    static async updatePerimetro(id: string, wktPoligono: string): Promise<IUbicacionFoco | null> {
        const query: QueryConfig = {
            text: `
                UPDATE public.ubicaciones 
                SET area_quemada_wkt = ST_GeomFromText($1, 4326)::geography 
                WHERE id = $2 AND deleted_at IS NULL
                RETURNING id, ST_AsText(area_quemada_wkt) AS perimetro_wkt, updated_at;
            `,
            values: [wktPoligono, id],
        };
        const { rows } = await pool.query(query);
        return rows[0] || null;
    }

    /**
     * ✅ Actualización Integral (UPDATE ALL)
     */
    static async updateAll(
        id: string,
        data: IUpdateFocoDTO & { severidad: SeveridadFoco },
    ): Promise<IUbicacionFoco | null> {
        const query: QueryConfig = {
            text: `
                UPDATE public.ubicaciones 
                SET 
                    tipo_incidente = COALESCE($1, tipo_incidente),
                    detalles = COALESCE($2, detalles),
                    viento_velocidad_kmh = COALESCE($3, viento_velocidad_kmh),
                    amenaza_viviendas = COALESCE($4, amenaza_viviendas),
                    severidad = COALESCE($5, severidad),
                    estado = COALESCE($6, estado),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7 AND deleted_at IS NULL
                RETURNING id, tipo_incidente, severidad, estado, updated_at;
            `,
            values: [
                data.tipo_incidente,
                data.detalles,
                data.viento_velocidad_kmh,
                data.amenaza_viviendas,
                data.severidad,
                data.estado,
                id,
            ],
        };
        const { rows } = await pool.query(query);
        return rows[0] || null;
    }

    // ============================================================================
    // 🔴 ELIMINACIÓN (SOFT DELETE)
    // ============================================================================

    static async softDelete(id: string): Promise<boolean> {
        const query: QueryConfig = {
            text: `UPDATE public.ubicaciones SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id;`,
            values: [id],
        };
        const { rows } = await pool.query(query);
        return rows.length > 0;
    }
}
