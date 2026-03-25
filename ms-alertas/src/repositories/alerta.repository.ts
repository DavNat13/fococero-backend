import { pool } from '../config/database';
import { Alerta } from '../models/alerta.model';

export class AlertaRepository {
    async create(alerta: Alerta): Promise<Alerta> {
        const query = `
            INSERT INTO alertas (titulo, mensaje, nivel, latitud, longitud, sector, autor_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const values = [
            alerta.titulo, alerta.mensaje, alerta.nivel, 
            alerta.latitud, alerta.longitud, alerta.sector, alerta.autor_id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async findAll(): Promise<Alerta[]> {
        const { rows } = await pool.query('SELECT * FROM alertas ORDER BY creado_en DESC');
        return rows;
    }
}