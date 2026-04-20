/**
 * Suma dos números de forma tipada.
 */
export const sumar = (a: number, b: number): number => {
  return a + b;
};

/**
 * Valida si un objeto es una instancia de Date válida.
 * Usamos 'unknown' para cumplir con la regla de no usar 'any'.
 */
export const esFechaValida = (fecha: unknown): boolean => {
  return fecha instanceof Date && !isNaN(fecha.getTime());
};
