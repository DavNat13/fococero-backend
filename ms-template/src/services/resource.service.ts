// ==========================================
// 🛠️ Servicios de Negocio - Placeholders
// ==========================================
// Implementa aqui la logica de negocio
// relacionada con tus entidades

import { pool } from '../config/database';
import { IResource, IResourceCreateDTO, IResourceUpdateDTO } from '../models/resource.model';

export class ResourceService {
    /**
     * Obtiene todos los recursos
     */
    async findAll(): Promise<IResource[]> {
        const result = await pool.query(
            'SELECT id, name, created_at, updated_at FROM resources ORDER BY created_at DESC'
        );
        return result.rows;
    }

    /**
     * Obtiene un recurso por ID
     */
    async findById(id: string): Promise<IResource | null> {
        const result = await pool.query(
            'SELECT id, name, created_at, updated_at FROM resources WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Crea un nuevo recurso
     */
    async create(data: IResourceCreateDTO): Promise<IResource> {
        const result = await pool.query(
            `INSERT INTO resources (name) VALUES ($1)
             RETURNING id, name, created_at, updated_at`,
            [data.name]
        );
        return result.rows[0];
    }

    /**
     * Actualiza un recurso existente
     */
    async update(id: string, data: IResourceUpdateDTO): Promise<IResource | null> {
        const fields: string[] = [];
        const values: (string | undefined)[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE resources SET ${fields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING id, name, created_at, updated_at`,
            values
        );
        return result.rows[0] || null;
    }

    /**
     * Elimina un recurso
     */
    async delete(id: string): Promise<boolean> {
        const result = await pool.query('DELETE FROM resources WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}

export const resourceService = new ResourceService();