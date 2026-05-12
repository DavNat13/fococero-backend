// ==========================================
// 🛠️ Funciones de Ayuda (Helpers)
// ==========================================

/**
 * Genera un UUID v4
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
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