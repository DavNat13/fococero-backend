import { GeoHashStr } from "./fact-incidente.model";

export interface IMVMapaCalorGeohash {
  geohash: GeoHashStr;
  categoria: string;
  intensidad: number;
}

export interface IHeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface IHeatmapFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; 
  };
  properties: {
    weight: number;
    category: string;
    geohash: string;
  };
}

export interface IHeatmapGeoJSON {
  type: "FeatureCollection";
  features: IHeatmapFeature[];
}
