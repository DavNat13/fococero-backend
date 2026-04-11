// ms-reportes/src/@types/express/index.d.ts
import { UserRole } from '../../models/user.enum'; // Asegúrate de que esta ruta coincida con tu enum

declare global {
    namespace Express {
        export interface Request {
            user?: {
                uid: string;
                email?: string;
                rol: UserRole | string;
            };
        }
    }
}
