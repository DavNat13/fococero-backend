export class RespuestaHttpTransformer {
  public static exito<T>(datos: T, mensaje = "Operación completada con éxito") {
    return {
      exito: true,
      mensaje,
      datos,
      timestamp: new Date().toISOString(),
    };
  }

  public static paginada<T>(
    datos: T[],
    total: number,
    pagina: number,
    limite: number,
  ) {
    const totalPaginas = Math.ceil(total / limite);
    return {
      exito: true,
      mensaje: "Datos recuperados exitosamente",
      datos,
      meta: {
        totalRegistros: total,
        paginaActual: pagina,
        totalPaginas,
        tieneMas: pagina < totalPaginas,
      },
      timestamp: new Date().toISOString(),
    };
  }

  public static error(mensaje: string, codigo: string, detalles?: unknown) {
    return {
      exito: false,
      error: {
        codigo,
        mensaje,
        detalles,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
