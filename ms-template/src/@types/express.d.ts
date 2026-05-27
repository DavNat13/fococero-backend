// ==========================================
// 🔧 Tipos personalizados para el proyecto
// ==========================================

// Extender el objeto Request de Express para incluir usuario
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                roles: string[];
            };
        }
    }
}

export interface IPaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface IApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}