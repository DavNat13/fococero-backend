// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { pool } from '../config/database';

export const validateFirebaseToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ ok: false, error: 'Token no proporcionado.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // 🟢 PUENTE PARA DESARROLLO (Master Token)
        if (process.env.NODE_ENV === 'development' && token === 'fococero_test_token') {
            // 🛡️ MOCK ADMIN: Inyectamos un perfil táctico perfecto sin consultar a la DB
            (req as any).user = {
                id: 999, // Un ID ficticio para auditoría
                firebase_uid: 'master_admin_uid',
                email: 'comandante@fococero.cl',
                rol: 'admin', // <-- LA LLAVE MÁGICA QUE ABRE LAS RUTAS
                estado: 'activo',
            };
            return next();
        }

        // 🛡️ Verificación Real con Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);

        const userQuery = await pool.query(
            'SELECT id, firebase_uid, email, rol, estado FROM usuarios WHERE firebase_uid = $1 AND estado = $2',
            [decodedToken.uid, 'activo'],
        );

        if (userQuery.rowCount === 0) {
            res.status(403).json({ ok: false, error: 'Usuario no registrado o inactivo.' });
            return;
        }

        (req as any).user = userQuery.rows[0];
        next();
    } catch (error: any) {
        console.error('🔴 Error en Autenticación:', error.message);
        res.status(401).json({
            ok: false,
            error: 'Sesión inválida o error de conexión con Firebase.',
            details: error.message,
        });
    }
};
