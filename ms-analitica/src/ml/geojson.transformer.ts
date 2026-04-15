import {
  IMVMapaCalorGeohash,
  IHeatmapGeoJSON,
  IHeatmapFeature,
} from "../models/heatmap.model";
import { decodificarGeohash } from "./geohash.utils";

export class GeoJsonTransformer {
  /**
   * Transforma los datos agregados por geohash en una colección de Features GeoJSON.
   */
  public static aMapaCalor(
    datosGeohash: IMVMapaCalorGeohash[],
  ): IHeatmapGeoJSON {
    const features: IHeatmapFeature[] = datosGeohash.map((dato) => {
      const geohashStr = String(dato.geohash);
      const coordenadas = decodificarGeohash(geohashStr);

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coordenadas.lng, coordenadas.lat], // Longitud primero en GeoJSON
        },
        properties: {
          weight: dato.intensidad,
          category: dato.categoria,
          geohash: geohashStr,
        },
      };
    });

    return {
      type: "FeatureCollection",
      features,
    };
  }
}
