import { analiticaRepository } from "../repositories/analitica.repository";
import { reportesCache } from "../cache/reportes.cache";

class MantenimientoService {
  public async sincronizarDatosBase(): Promise<void> {
    await analiticaRepository.refrescarVistasMaterializadas();
    await reportesCache.invalidarCachesGlobales();
  }

  public async purgarCaches(): Promise<void> {
    await reportesCache.invalidarCachesGlobales();
  }
}

export const mantenimientoService = new MantenimientoService();
