// src/@types/express/index.d.ts

// Definimos estrictamente lo que ms-geo espera extraer del Token de Firebase
export interface DecodedUser {
    uid: string;
    email?: string;
    rol?: string;
}

declare global {
    namespace Express {
        export interface Request {
            // Hacemos que 'user' sea opcional porque las rutas ciudadanas
            // (como ver incendios o reportar) no llevarán token.
            user?: DecodedUser; 
        }
    }
}