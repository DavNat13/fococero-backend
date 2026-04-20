// src/services/geo.service.ts

import { GeoRepository } from '../repositories/geo.repository';
import { GeoHelper } from '../helpers/geo.helper';
import { ICrearFocoDTO, IUpdateFocoDTO, IUbicacionFoco, EstadoFoco } from '../models/geo.model';
import { AppError } from '../helpers/appError';

export class GeoService {
    // --- CREACIÓN Y LECTURA ---

    static async crearFoco(data: ICrearFocoDTO): Promise<IUbicacionFoco> {
        // Regla: Calcular severidad inicial basada en clima y riesgo
        const severidad = GeoHelper.evaluarSeveridad(
            data.viento_velocidad_kmh || 0,
            data.amenaza_viviendas || false,
        );

        const payload = {
            ...data,
            reporte_id: data.reporte_id || `REP-GEO-${Date.now().toString().slice(-6)}`,
            severidad,
        };

        return await GeoRepository.create(payload);
    }

    static async obtenerTodos(): Promise<IUbicacionFoco[]> {
        return await GeoRepository.findAllActive();
    }

    static async obtenerPorId(id: string): Promise<IUbicacionFoco> {
        const foco = await GeoRepository.findById(id);
        if (!foco) throw new AppError('Incendio geoespacial no encontrado.', 404);
        return foco;
    }

    static async obtenerCercanos(
        lat: number,
        lng: number,
        radioMetros: number,
    ): Promise<IUbicacionFoco[]> {
        return await GeoRepository.findNearby(lat, lng, radioMetros);
    }

    // --- GESTIÓN OPERATIVA ---

    static async cambiarEstado(id: string, nuevoEstado: EstadoFoco): Promise<IUbicacionFoco> {
        await this.obtenerPorId(id); // Validamos existencia

        const actualizado = await GeoRepository.updateState(id, nuevoEstado);
        if (!actualizado) throw new AppError('Error al actualizar el estado operativo.', 500);

        return actualizado;
    }

    static async actualizarPerimetro(id: string, wktPoligono: string): Promise<IUbicacionFoco> {
        await this.obtenerPorId(id);

        const actualizado = await GeoRepository.updatePerimetro(id, wktPoligono);
        if (!actualizado)
            throw new AppError('No se pudo procesar el trazado espacial del perímetro.', 400);

        return actualizado;
    }


    static async actualizarCompleto(
        id: string,
        updateData: IUpdateFocoDTO,
    ): Promise<IUbicacionFoco> {
        const focoActual = await this.obtenerPorId(id);

        // Lógica de Recalculación: Si no viene un valor nuevo, usamos el que ya tiene el foco
        const nuevoViento = updateData.viento_velocidad_kmh ?? focoActual.viento_velocidad_kmh;
        const nuevaAmenaza = updateData.amenaza_viviendas ?? focoActual.amenaza_viviendas;

        const severidad = GeoHelper.evaluarSeveridad(nuevoViento, nuevaAmenaza);

        // Llamada sincronizada al repositorio
        const actualizado = await GeoRepository.updateAll(id, { ...updateData, severidad });

        if (!actualizado) {
            throw new AppError(
                'Error al ejecutar la actualización integral en el motor espacial.',
                500,
            );
        }

        return actualizado;
    }

    // --- ELIMINACIÓN ---

    static async eliminar(id: string): Promise<void> {
        await this.obtenerPorId(id);
        const fueEliminado = await GeoRepository.softDelete(id);
        if (!fueEliminado) throw new AppError('No se pudo remover el reporte del sistema.', 500);
    }
}
