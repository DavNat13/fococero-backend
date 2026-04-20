-- =================================================================
-- FOCOCERO - SCRIPT DE INICIALIZACIÓN GEOESPACIAL (PRO VERSION)
-- =================================================================
\c geo_db;
-- 1. Habilitar la extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. 🛡️ SEGURIDAD DE DATOS: Crear ENUMs exactos a ms-geo
DO $$ BEGIN
    CREATE TYPE severidad_foco AS ENUM ('Baja', 'Moderada', 'Alta', 'Crítica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_foco AS ENUM ('Reportado', 'En Evaluación', 'En Combate', 'Controlado', 'Extinguido', 'Falsa Alarma');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Crear la tabla de Ubicaciones blindada
CREATE TABLE IF NOT EXISTS public.ubicaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id VARCHAR(50) NOT NULL,
    
    tipo_incidente VARCHAR(100) NOT NULL,
    severidad severidad_foco NOT NULL,
    estado estado_foco DEFAULT 'Reportado',
    detalles TEXT, 
    
    radio_afectacion_metros NUMERIC DEFAULT 50,
    es_verificado BOOLEAN DEFAULT false,
    viento_velocidad_kmh NUMERIC DEFAULT 0,
    viento_direccion VARCHAR(50),
    amenaza_viviendas BOOLEAN DEFAULT false,
    
    coordenadas GEOGRAPHY(Point, 4326) NOT NULL,
    area_quemada_wkt GEOGRAPHY(Polygon, 4326),
    
    -- Estandarizados a los nombres que usa tu geo.repository.ts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. ⚡ OPTIMIZACIÓN DE RENDIMIENTO

-- A. Índice Espacial (Radar)
CREATE INDEX IF NOT EXISTS idx_ubicaciones_coordenadas 
ON public.ubicaciones USING GIST (coordenadas);

-- B. Índice Parcial para Mapa Global (Solo carga rápidos los activos)
CREATE INDEX IF NOT EXISTS idx_ubicaciones_activas 
ON public.ubicaciones (estado) WHERE deleted_at IS NULL;

-- 5. 🤖 AUTOMATIZACIÓN: Trigger para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ubicaciones_modtime ON public.ubicaciones;
CREATE TRIGGER trigger_update_ubicaciones_modtime
    BEFORE UPDATE ON public.ubicaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();    