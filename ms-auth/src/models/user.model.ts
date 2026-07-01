import { UserRole, UserStatus } from './user.enum';

export interface Usuario {
    id?: number;
    rut: string; // Validado y formateado por nuestro RutHelper
    nombre: string;
    apellido: string;
    telefono: string;
    email?: string; // Provisto por Firebase
    firebase_uid?: string; // ID único de Firebase (Reemplazó al password)
    password?: string; // Contraseña hasheada con bcrypt
    
    rol?: UserRole;
    estado?: UserStatus;
    
    fcm_token?: string; // Token para enviar notificaciones Push a este celular
    reputacion?: number; // Sistema de karma de FocoCero
    verificado?: boolean;
    creado_en?: Date;
    actualizado_en?: Date;
}