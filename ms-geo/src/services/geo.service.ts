// src/services/geo.service.ts

import { GeoRepository } from '../repositories/geo.repository';
import { GeoHelper } from '../helpers/geo.helper';

/**
 * GeoService: El cerebro del microservicio.
 * Contiene toda la lógica de negocio, validaciones cruzadas y orquestación.
 */
export class GeoService {

    // ============================================================================
    // 🟢 CREACIÓN
    // ============================================================================

    static async crearFoco(data: any): Promise<any> {
        // 1. Regla de Negocio: Calcular severidad basada en clima y amenaza
        const severidadCalculada = GeoHelper.evaluarSeveridad(
            data.viento_velocidad_kmh, 
            data.amenaza_viviendas
        );

        // 2. Armar el paquete de datos
        const payload = {
            ...data,
            reporte_id: data.reporte_id || `REP-${Date.now().toString().slice(-6)}`,
            severidad: severidadCalculada
        };

        // 3. Delegar la persistencia al motor PostGIS
        return await GeoRepository.create(payload);
    }

    // ============================================================================
    // 🔵 LECTURA
    // ============================================================================

    static async obtenerTodos(): Promise<any[]> {
        return await GeoRepository.findAllActive();
    }

    static async obtenerPorId(id: string): Promise<any> {
        const foco = await GeoRepository.findById(id);
        if (!foco) {
            const error = new Error('Reporte geoespacial no encontrado o fue eliminado.');
            (error as any).statusCode = 404;
            throw error;
        }
        return foco;
    }

    static async obtenerCercanos(lat: number, lng: number, radioMetros: number): Promise<any[]> {
        return await GeoRepository.findNearby(lat, lng, radioMetros);
    }

    // ============================================================================
    // 🟠 ACTUALIZACIÓN OPERATIVA
    // ============================================================================

    static async cambiarEstado(id: string, nuevoEstado: string): Promise<any> {
        await this.obtenerPorId(id); // Verificamos que exista primero
        
        const actualizado = await GeoRepository.updateState(id, nuevoEstado);
        if (!actualizado) {
            throw new Error('No se pudo actualizar el estado operativo del reporte.');
        }
        return actualizado;
    }

    static async actualizarPerimetro(id: string, wktPoligono: string): Promise<any> {
        await this.obtenerPorId(id);
        
        const actualizado = await GeoRepository.updatePerimetro(id, wktPoligono);
        if (!actualizado) {
            throw new Error('No se pudo trazar el perímetro en el motor espacial.');
        }
        return actualizado;
    }

    static async actualizarCompleto(id: string, updateData: any): Promise<any> {
        const focoActual = await this.obtenerPorId(id);

        // Si cambia el viento o la amenaza a viviendas, recalculamos la severidad automáticamente
        const nuevoViento = updateData.viento_velocidad_kmh ?? focoActual.viento_velocidad_kmh;
        const nuevaAmenaza = updateData.amenaza_viviendas ?? focoActual.amenaza_viviendas;
        
        updateData.severidad = GeoHelper.evaluarSeveridad(nuevoViento, nuevaAmenaza);

        const actualizado = await GeoRepository.updateAll(id, updateData);
        if (!actualizado) {
            throw new Error('Error al ejecutar la actualización integral.');
        }
        return actualizado;
    }

    // ============================================================================
    // 🔴 ELIMINACIÓN
    // ============================================================================

    static async eliminar(id: string): Promise<void> {
        await this.obtenerPorId(id);
        
        const fueEliminado = await GeoRepository.softDelete(id);
        if (!fueEliminado) {
            const error = new Error('No se pudo remover el reporte del mapa táctico.');
            (error as any).statusCode = 500;
            throw error;
        }
    }
}