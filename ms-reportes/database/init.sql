-- ==============================================================================
-- 1. EXTENSIONES Y FUNCIONES BASE (ms-reportes)
-- ==============================================================================

\c reportes_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE OR REPLACE FUNCTION trigger_set_timestamp_reportes()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLAS MAESTRAS (Catálogos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categorias_incidente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    nivel_prioridad INT NOT NULL CHECK (nivel_prioridad BETWEEN 1 AND 5),
    activo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datos maestros iniciales
INSERT INTO categorias_incidente (nombre, descripcion, nivel_prioridad) VALUES
    ('Incendio Forestal', 'Fuego descontrolado en zonas con vegetación', 5),
    ('Incendio Estructural', 'Fuego en casas, edificios o fábricas', 5),
    ('Foco de Basura', 'Quema de microbasurales o escombros', 2),
    ('Corte de Ruta por Fuego', 'Humo o fuego que impide el tránsito', 4)
ON CONFLICT (nombre) DO NOTHING;

-- ==============================================================================
-- 3. TABLAS TRANSACCIONALES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias_incidente(id) ON DELETE RESTRICT,
    
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    -- Columna PostGIS generada automáticamente
    ubicacion GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography) STORED,
    
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' 
        CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'FALSA_ALARMA')),
    
    id_ciudadano VARCHAR(128) NOT NULL, 
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de historial (Inmutable)
CREATE TABLE IF NOT EXISTS historial_estados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    id_usuario_modificador VARCHAR(128) NOT NULL, 
    comentarios TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TRIGGERS
-- ==============================================================================
CREATE TRIGGER set_timestamp_categorias
BEFORE UPDATE ON categorias_incidente
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp_reportes();

CREATE TRIGGER set_timestamp_reportes
BEFORE UPDATE ON reportes
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp_reportes();

-- ==============================================================================
-- 5. ÍNDICES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_reportes_categoria ON reportes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_ciudadano ON reportes(id_ciudadano);
CREATE INDEX IF NOT EXISTS idx_historial_reporte ON historial_estados(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reportes_ubicacion ON reportes USING GIST (ubicacion);
CREATE INDEX IF NOT EXISTS idx_reportes_metadata ON reportes USING GIN (metadata);