// ==========================================
// 🗄️ Repositorio de Datos - Placeholders
// ==========================================
// Abstrae el acceso a la base de datos
// para el servicio correspondiente

import { pool } from '../config/database';
import { IResource } from '../models/resource.model';

export class ResourceRepository {
    /**
     * Consulta SQL base
     */
    async findAll(): Promise<IResource[]> {
        const query = 'SELECT id, name, created_at, updated_at FROM resources';
        const result = await pool.query(query);
        return result.rows;
    }

    /**
     * Consulta por ID
     */
    async findById(id: string): Promise<IResource | null> {
        const query = 'SELECT id, name, created_at, updated_at FROM resources WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Insertar nuevo registro
     */
    async create(data: Partial<IResource>): Promise<IResource> {
        const query = `
            INSERT INTO resources (name)
            VALUES ($1)
            RETURNING id, name, created_at, updated_at
        `;
        const result = await pool.query(query, [data.name]);
        return result.rows[0];
    }

    /**
     * Actualizar registro existente
     */
    async update(id: string, data: Partial<IResource>): Promise<IResource | null> {
        const fields: string[] = [];
        const values: (string | Date | undefined)[] = [];
        let idx = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${idx++}`);
            values.push(data.name);
        }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE resources SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    /**
     * Eliminar registro
     */
    async delete(id: string): Promise<boolean> {
        const query = 'DELETE FROM resources WHERE id = $1';
        const result = await pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}

export const resourceRepository = new ResourceRepository();