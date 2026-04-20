// ============================================================================
// 🛠️ UTILITY TYPES DE NIVEL SENIOR
// ============================================================================

export {}; // Convierte este archivo en un módulo externo para evitar choques

declare global {
  /**
   * 1. PATRÓN BRANDED TYPES (Tipos Opacos)
   * Evita que crucemos strings que significan cosas distintas.
   * Ejemplo: Un 'IncidentId' no puede ser asignado a un 'UserId', aunque ambos sean strings.
   */
  declare const __brand: unique symbol;
  type Brand<B, T = string> = T & { [__brand]: B };

  // Definición estricta de nuestros identificadores de dominio
  type IncidentId = Brand<"IncidentId">;
  type UserId = Brand<"UserId">;
  type ReportId = Brand<"ReportId">;

  // Tipos geoespaciales analíticos
  type GeoHashStr = Brand<"GeoHash">;

  /**
   * TIPO SEGURO PARA FUNCIONES (Evita el error @typescript-eslint/no-unsafe-function-type)
   * Usa 'never[]' porque nunca llamaremos a esta función directamente aquí,
   * y 'unknown' porque no nos importa qué devuelve.
   */
  type SafeFunction = (...args: never[]) => unknown;

  /**
   * 2. INMUTABILIDAD PROFUNDA (DeepReadonly)
   * Vital para la analítica. Cuando traemos un bloque masivo de datos
   * de la base de datos para calcular el mapa de calor, NO debemos mutarlo por accidente.
   */
  type DeepReadonly<T> = T extends (infer R)[]
    ? ReadonlyArray<DeepReadonly<R>>
    : T extends SafeFunction
      ? T
      : T extends object
        ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
        : T;

  /**
   * 3. RESPUESTAS PAGINADAS ESTANDARIZADAS
   * Todo microservicio analítico devuelve mucha data, obligatoriamente paginada.
   */
  interface PaginatedResponse<T> {
    data: T[];
    meta: {
      totalRegistros: number;
      paginaActual: number;
      totalPaginas: number;
      tieneMas: boolean;
    };
  }
}
