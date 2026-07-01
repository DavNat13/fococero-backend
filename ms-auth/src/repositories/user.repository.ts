import { pool } from '../config/database';
import { Usuario } from '../models/user.model';
import { UserRole, UserStatus } from '../models/user.enum';

/**
 * Columnas permitidas para actualización dinámica.
 * Esta lista blanca (whitelist) previene SQL injection a través de nombres de columna
 * y evita que el llamante pueda modificar columnas sensibles o inexistentes.
 */
const ALLOWED_UPDATE_COLUMNS = new Set([
    'rut', 'nombre', 'apellido', 'email', 'telefono',
    'firebase_uid', 'fcm_token', 'rol', 'estado', 'password',
]);

export class UserRepository {
    
    // --- 🔍 MÉTODOS DE BÚSQUEDA (READ) ---

    /**
     * Obtiene todos los usuarios. 
     * Ideal para el panel de administración de FocoCero.
     */
    static async findAll(): Promise<Usuario[]> {
        const query = 'SELECT * FROM usuarios ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows;
    }

    static async findById(id: number): Promise<Usuario | null> {
        const query = 'SELECT * FROM usuarios WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows.length ? result.rows[0] : null;
    }

    static async findByRut(rut: string): Promise<Usuario | null> {
        const query = 'SELECT * FROM usuarios WHERE rut = $1';
        const result = await pool.query(query, [rut]);
        return result.rows.length ? result.rows[0] : null;
    }

    static async findByFirebaseUid(uid: string): Promise<Usuario | null> {
        const query = 'SELECT * FROM usuarios WHERE firebase_uid = $1';
        const result = await pool.query(query, [uid]);
        return result.rows.length ? result.rows[0] : null;
    }

    static async findByEmail(email: string): Promise<Usuario | null> {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows.length ? result.rows[0] : null;
    }

    /**
     * Búsqueda compuesta para evitar duplicidad de identidad en el sistema.
     */
    static async findByFirebaseUidOrRut(uid: string, rut: string): Promise<Usuario | null> {
        const query = 'SELECT * FROM usuarios WHERE firebase_uid = $1 OR rut = $2';
        const result = await pool.query(query, [uid, rut]);
        return result.rows.length ? result.rows[0] : null;
    }

    // --- ✍️ MÉTODOS DE CREACIÓN (CREATE) ---

    static async createGuest(data: Partial<Usuario>): Promise<Usuario> {
        const query = `
            INSERT INTO usuarios (rut, nombre, apellido, telefono, rol, estado) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;
        const result = await pool.query(query, [
            data.rut, 
            data.nombre, 
            data.apellido, 
            data.telefono, 
            UserRole.INVITADO,
            UserStatus.ACTIVO
        ]);
        return result.rows[0];
    }

    static async createFullUser(data: Partial<Usuario>): Promise<Usuario> {
        const query = `
            INSERT INTO usuarios (rut, nombre, apellido, email, telefono, firebase_uid, rol, estado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *
        `;
        const result = await pool.query(query, [
            data.rut, 
            data.nombre, 
            data.apellido, 
            data.email,
            data.telefono, 
            data.firebase_uid,
            UserRole.USUARIO,
            UserStatus.ACTIVO
        ]);
        return result.rows[0];
    }

    // --- 🛠️ MÉTODOS DE ACTUALIZACIÓN (UPDATE) ---

    /**
     * ACTUALIZACIÓN DINÁMICA: 
     * Este es el "corazón" del CRUD avanzado. Permite actualizar cualquier campo 
     * del usuario sin necesidad de crear un método por cada campo.
     */
    static async update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
        const entries = Object.entries(data)
            .filter(([key, v]) => v !== undefined && ALLOWED_UPDATE_COLUMNS.has(key));
        if (entries.length === 0) return null;

        const setClause = entries
            .map(([key], index) => `${key} = $${index + 2}`)
            .join(', ');
        
        const values = entries.map(([_, v]) => v);
        
        const query = `
            UPDATE usuarios 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *
        `;

        const result = await pool.query(query, [id, ...values]);
        return result.rows.length ? result.rows[0] : null;
    }

    static async updateFirebaseUid(userId: number, firebaseUid: string, fcmToken?: string): Promise<Usuario | null> {
        if (fcmToken) {
            const query = 'UPDATE usuarios SET firebase_uid = $1, fcm_token = $2, updated_at = NOW() WHERE id = $3 RETURNING *';
            const result = await pool.query(query, [firebaseUid, fcmToken, userId]);
            return result.rows.length ? result.rows[0] : null;
        }
        const query = 'UPDATE usuarios SET firebase_uid = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
        const result = await pool.query(query, [firebaseUid, userId]);
        return result.rows.length ? result.rows[0] : null;
    }

    /**
     * Método especializado para brigadistas y personal en terreno.
     * Actualizar el token FCM es vital para que las alertas de incendio lleguen.
     */
    static async updateFcmToken(userId: number, fcmToken: string): Promise<void> {
        const query = 'UPDATE usuarios SET fcm_token = $1, updated_at = NOW() WHERE id = $2';
        await pool.query(query, [fcmToken, userId]);
    }

    // --- 🗑️ MÉTODOS DE ELIMINACIÓN (DELETE) ---

    /**
     * Eliminación física del registro. 
     * En sistemas gubernamentales/emergencia se suele usar "Soft Delete" (cambiar estado a 'eliminado'),
     * pero aquí implementamos el Hard Delete según lo solicitado.
     */
    static async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM usuarios WHERE id = $1';
        const result = await pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}