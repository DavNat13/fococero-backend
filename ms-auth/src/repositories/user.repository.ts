import { pool } from '../config/database';
import { Usuario } from '../models/user.model';
import { UserRole } from '../models/user.enum'; 
export class UserRepository {
    
    static async findByRut(rut: string): Promise<Usuario | null> {
        const result = await pool.query('SELECT * FROM usuarios WHERE rut = $1', [rut]);
        return result.rows.length ? result.rows[0] : null;
    }

    //  Este método es útil para el registro completo, donde queremos asegurarnos de que ni el RUT ni el Firebase UID estén repetidos
    static async findByFirebaseUidOrRut(uid: string, rut: string): Promise<Usuario | null> {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE firebase_uid = $1 OR rut = $2', 
            [uid, rut]
        );
        return result.rows.length ? result.rows[0] : null;
    }

    // Método específico para buscar por Firebase UID (útil para el middleware de autenticación)
    static async findByFirebaseUid(uid: string): Promise<Usuario | null> {
        const result = await pool.query('SELECT * FROM usuarios WHERE firebase_uid = $1', [uid]);
        return result.rows.length ? result.rows[0] : null;
    }

    static async createGuest(data: Partial<Usuario>): Promise<Usuario> {
        const query = `
            INSERT INTO usuarios (rut, nombre, apellido, telefono, rol) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, rut, nombre, apellido, rol
        `;
        const result = await pool.query(query, [
            data.rut, 
            data.nombre, 
            data.apellido, 
            data.telefono, 
            UserRole.INVITADO // Asignamos el rol de INVITADO por defecto a los registros de invitado
        ]);
        return result.rows[0];
    }

    static async createFullUser(data: Partial<Usuario>): Promise<Usuario> {
        const query = `
            INSERT INTO usuarios (rut, nombre, apellido, telefono, email, firebase_uid, rol, verificado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
            RETURNING id, rut, nombre, email, rol
        `;
        const result = await pool.query(query, [
            data.rut, 
            data.nombre, 
            data.apellido, 
            data.telefono, 
            data.email, 
            data.firebase_uid,
            UserRole.USUARIO // Asignamos el rol de USUARIO por defecto a los registros completos
        ]);
        return result.rows[0];
    }

    static async updateFcmToken(userId: number, fcmToken: string): Promise<void> {
        await pool.query(
            'UPDATE usuarios SET fcm_token = $1, actualizado_en = NOW() WHERE id = $2', 
            [fcmToken, userId]
        );
    }
}