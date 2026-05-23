// ==========================================
// 🧰 HELPER: MS-ALERTAS
// ==========================================

export class AlertaHelper {
    /**
     * Valida si unas coordenadas [longitud, latitud] caen aproximadamente
     * dentro del recuadro geográfico (Bounding Box) de Chile Continental.
     * Útil para descartar reportes basura o ataques de bots extranjeros.
     */
    static esUbicacionEnChile(lng: number, lat: number): boolean {
        // Bounding Box aproximado de Chile Continental
        const minLng = -75.6; // Océano Pacífico
        const maxLng = -66.9; // Cordillera de los Andes
        const minLat = -56.5; // Cabo de Hornos (Sur)
        const maxLat = -17.5; // Límite Norte (Arica)

        return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
    }

    /**
     * Formatea la distancia retornada por PostGIS (que suele venir en metros con muchos decimales)
     * a un texto legible para el Frontend (ej. "2.5 km" o "500 m").
     */
    static formatearDistanciaLegible(metros: number): string {
        if (metros < 1000) {
            return `${Math.round(metros)} m`;
        }
        return `${(metros / 1000).toFixed(1)} km`;
    }
}
