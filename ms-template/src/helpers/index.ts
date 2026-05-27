// ==========================================
// 🛠️ Funciones de Ayuda (Helpers)
// ==========================================

import { randomUUID } from 'node:crypto';

/**
 * Genera un UUID v4 utilizando crypto.randomUUID() (seguro criptográficamente)
 */
export const generateUUID = (): string => {
    return randomUUID();
};

/**
 * Formatea una fecha a ISO string
 */
export const formatDate = (date: Date): string => {
    return date.toISOString();
};

/**
 * Retry con exponential backoff
 */
export const retry = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(res => setTimeout(res, delay));
        return retry(fn, retries - 1, delay * 2);
    }
};

/**
 * Limpia un objeto eliminando propiedades undefined
 */
export const cleanObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            (cleaned as Record<string, unknown>)[key] = obj[key];
        }
    }
    return cleaned;
};