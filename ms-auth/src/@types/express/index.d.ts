// ms-auth/src/@types/express/index.d.ts

// Asegúrate de importar la interfaz/modelo que retorna tu UserRepository
// Si se llama IUser, cambialo por IUser. Asumo que se llama 'Usuario' por el error de TypeScript.
import { Usuario } from '../../models/user.model';

declare global {
    namespace Express {
        export interface Request {
            // Le decimos a Express que TODO usuario autenticado en ms-auth
            // tendrá la estructura completa de la Base de Datos
            user?: Usuario;
        }
    }
}
