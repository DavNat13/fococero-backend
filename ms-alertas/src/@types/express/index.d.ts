// src/@types/express/index.d.ts

import { Usuario } from '../../models/user.model';

declare global {
    namespace Express {
        // "Extendemos" la interfaz Request original de Express
        export interface Request {
            // Añadimos la propiedad 'user', indicando que es opcional (?) 
            // porque no todas las rutas (como el registro) tendrán un usuario logueado.
            user?: Usuario; 
        }
    }
}