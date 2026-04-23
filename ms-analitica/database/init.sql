\c analitica_db;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS dim_tiempo (
    fecha DATE PRIMARY KEY,
    anio SMALLINT NOT NULL,
    mes SMALLINT NOT NULL,
    dia SMALLINT NOT NULL,
    dia_semana SMALLINT NOT NULL,
    es_fin_semana BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_incidentes (
    id UUID NOT NULL,
    fecha_sk DATE NOT NULL,
    origen VARCHAR(50) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    severidad VARCHAR(20) NOT NULL,
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    geohash VARCHAR(12) GENERATED ALWAYS AS (ST_GeoHash(geom, 6)) STORED,
    tiempo_respuesta_segundos INT CHECK (tiempo_respuesta_segundos >= 0),
    fecha_ocurrencia TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, fecha_ocurrencia)
) PARTITION BY RANGE (fecha_ocurrencia);

ALTER TABLE fact_incidentes ALTER COLUMN metadata SET COMPRESSION lz4;

CREATE TABLE IF NOT EXISTS fact_incidentes_default PARTITION OF fact_incidentes DEFAULT;

CREATE INDEX IF NOT EXISTS idx_fact_geom ON fact_incidentes USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_fact_geohash ON fact_incidentes (geohash);
CREATE INDEX IF NOT EXISTS idx_fact_fecha ON fact_incidentes USING BRIN (fecha_ocurrencia) WITH (pages_per_range = 128, autosummarize = on);
CREATE INDEX IF NOT EXISTS idx_fact_metadata ON fact_incidentes USING GIN (metadata jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_fact_fk_tiempo ON fact_incidentes (fecha_sk);

CREATE MATERIALIZED VIEW mv_estadisticas_diarias AS
SELECT 
    t.fecha,
    t.es_fin_semana,
    f.categoria,
    f.severidad,
    COUNT(f.id) AS total_incidentes,
    COALESCE(AVG(f.tiempo_respuesta_segundos), 0) AS prom_respuesta_seg,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY f.tiempo_respuesta_segundos) AS mediana_respuesta_seg
FROM fact_incidentes f
JOIN dim_tiempo t ON f.fecha_sk = t.fecha
GROUP BY 1, 2, 3, 4
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_est_diarias ON mv_estadisticas_diarias (fecha, categoria, severidad);

CREATE MATERIALIZED VIEW mv_mapa_calor_geohash AS
SELECT 
    geohash,
    categoria,
    COUNT(id) AS intensidad
FROM fact_incidentes
GROUP BY 1, 2
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_mapa_calor_geohash ON mv_mapa_calor_geohash (geohash, categoria);

CREATE OR REPLACE FUNCTION refresh_analitica_mvs()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estadisticas_diarias;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_mapa_calor_geohash;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;