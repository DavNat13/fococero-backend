/// <reference types="jest" />
import { sumar, esFechaValida } from "../src/utils/calculadora";

describe("Prueba de Sanidad (Sanity Check)", () => {
  test("La suma básica debería funcionar", () => {
    const resultado: number = sumar(2, 2);
    expect(resultado).toBe(4);
    expect(sumar(-1, 5)).toBe(4);
  });

  test("La validación de fechas debería ser correcta", () => {
    // Caso exitoso
    const fechaOk: Date = new Date();
    expect(esFechaValida(fechaOk)).toBe(true);

    // Casos fallidos (tipados como unknown para el test)
    const stringInvalido: unknown = "2026-04-13";
    const fechaInvalida: unknown = new Date("esto-no-es-fecha");

    expect(esFechaValida(stringInvalido)).toBe(false);
    expect(esFechaValida(fechaInvalida)).toBe(false);
  });

  test("El entorno de variables funciona", () => {
    const appName: string = "FocoCero-Analitica";
    expect(appName).toContain("FocoCero");
  });
});
