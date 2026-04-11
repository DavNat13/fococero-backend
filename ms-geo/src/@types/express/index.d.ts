// src/@types/express/index.d.ts

/**
 * Definimos estrictamente lo que ms-geo espera extraer del Token de Firebase.
 * Se alinea con el estándar de los otros microservicios (auth/reportes).
 */
export interface DecodedUser {
    uid: string;
    email?: string;
    rol?: string; // Aquí podrías importar 'UserRole' si ya tienes el enum en ms-geo
}

declare global {
    namespace Express {
        export interface Request {
            /**
             * El objeto 'user' es inyectado por el middleware 'validateFirebaseToken'.
             * Es opcional (?) porque las rutas ciudadanas/públicas no requieren token.
             */
            user?: DecodedUser;
        }
    }
}
