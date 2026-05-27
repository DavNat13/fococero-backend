// ==========================================
// 🗄️ Modelos de Datos - Placeholders
// ==========================================
// Define aqui las interfaces/tipos para tus
// entidades de negocio

/**
 * Ejemplo de modelo de recurso
 */
export interface IResource {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Ejemplo de DTO para creacion
 */
export interface IResourceCreateDTO {
    name: string;
}

/**
 * Ejemplo de DTO para actualizacion
 */
export interface IResourceUpdateDTO {
    name?: string;
}