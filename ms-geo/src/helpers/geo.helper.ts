// src/helpers/geo.helper.ts

import { SeveridadFoco } from '../models/geo.model';

/**
 * GeoHelper: Utilidades de cálculo matemático y lógico sin dependencias externas.
 * Módulo 100% puro, testeable y aislado.
 */
export class GeoHelper {
    
    /**
     * Calcula automáticamente la severidad sugerida basada en factores climáticos y humanos.
     * * @param vientoKmh Velocidad del viento en km/h.
     * @param amenazaViviendas Indicador de riesgo inminente a la población.
     * @returns {SeveridadFoco} Nivel de severidad calculado.
     */
    static evaluarSeveridad(vientoKmh: number = 0, amenazaViviendas: boolean = false): SeveridadFoco {
        
        // 🛡️ Escudo (Auto-Healing): Sanitización de datos
        // Si por error de capa superior llega un viento negativo, o un NaN, lo normalizamos a 0.
        // Así evitamos comportamientos impredecibles en el cálculo sin botar el proceso.
        const vientoSanitizado = (isNaN(vientoKmh) || vientoKmh < 0) ? 0 : vientoKmh;

        // 🚨 Regla 1 (Prioridad Máxima): Riesgo de vidas humanas siempre es CRÍTICO
        if (amenazaViviendas) {
            return SeveridadFoco.CRITICA;
        }

        // 🌬️ Regla 2: Vientos fuertes aceleran la propagación geométrica del fuego
        if (vientoSanitizado >= 40) {
            return SeveridadFoco.ALTA;
        }

        // 🍃 Regla 3: Vientos moderados dificultan el control aéreo/terrestre
        if (vientoSanitizado >= 20) {
            return SeveridadFoco.MODERADA;
        }

        // 🏕️ Regla 4: Condiciones "ideales" para el combate directo
        return SeveridadFoco.BAJA;
    }

    /**
     * Ejemplo de expansión futura:
     * Aquí podríamos agregar métodos como "calcularAreaPoligonoWKT", 
     * "formatearCoordenadasGMS", etc.
     */
}