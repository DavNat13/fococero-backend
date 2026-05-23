import { z } from "zod";

export const configurarZodGlobal = (): void => {
  z.setErrorMap((issue) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = issue as Record<string, any>;

    switch (err.code) {
      case "invalid_type":
        if (err.received === "undefined") {
          return { message: "Este campo es estrictamente obligatorio" };
        }
        return {
          message: `Tipo de dato inválido. Esperado: ${err.expected}, Recibido: ${err.received}`,
        };

      case "too_small":
        if (err.type === "string") {
          return {
            message: `Debe contener al menos ${err.minimum} caracter(es)`,
          };
        }
        return {
          message: `El valor debe ser mayor o igual a ${err.minimum}`,
        };

      case "too_big":
        if (err.type === "string") {
          return {
            message: `No debe exceder los ${err.maximum} caracteres`,
          };
        }
        return {
          message: `El valor debe ser menor o igual a ${err.maximum}`,
        };

      default:
        return {
          message: err.message || "El valor proporcionado es inválido",
        };
    }
  });
};
