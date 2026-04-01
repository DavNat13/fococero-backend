-- ==============================================================================
-- 1. EXTENSIONES Y FUNCIONES BASE
-- ==============================================================================
-- Habilitamos UUIDs nativos para llaves primarias distribuidas (Evita cuellos de botella y ataques de enumeración)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitamos PostGIS para cálculos geoespaciales de alto rendimiento (Búsquedas por radio, cercanía, etc.)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Función global para el Trigger de Auditoría (Actualiza el updated_at automáticamente)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLAS MAESTRAS (Catálogos - Cumpliendo 3NF)
-- ==============================================================================
-- 3NF: Separamos la categoría del reporte para evitar anomalías de actualización y redundancia.
CREATE TABLE IF NOT EXISTS categorias_incidente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    nivel_prioridad INT NOT NULL CHECK (nivel_prioridad BETWEEN 1 AND 5), -- 1: Baja, 5: Crítica
    activo BOOLEAN DEFAULT TRUE,
    
    -- Auditoría Básica
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertamos datos maestros por defecto
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
    
    -- Geoespacial: Guardamos lat/lng estándar para la API, pero creamos un punto GEOGRAPHY para PostGIS
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    ubicacion GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography) STORED,
    
    -- Restricción estricta de estados
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' 
        CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'FALSA_ALARMA')),
    
    -- Llave Foránea Hacia ms-auth: Usamos VARCHAR para soportar UIDs de Firebase o UUIDs de tu otro microservicio
    id_ciudadano VARCHAR(128) NOT NULL, 
    
    -- Desnormalización estratégica: JSONB para datos flexibles (ej. clima al momento del reporte, fotos extra)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de historial: Inmutable (solo INSERTs). Registra la trazabilidad completa.
CREATE TABLE IF NOT EXISTS historial_estados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    id_usuario_modificador VARCHAR(128) NOT NULL, -- Quién cambió el estado (Admin/Brigadista)
    comentarios TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
    -- No lleva updated_at porque el historial de auditoría jamás debe ser modificado
);

-- ==============================================================================
-- 4. TRIGGERS (Automatización de Auditoría)
-- ==============================================================================
CREATE TRIGGER set_timestamp_categorias
BEFORE UPDATE ON categorias_incidente
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_reportes
BEFORE UPDATE ON reportes
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ==============================================================================
-- 5. ÍNDICES DE ALTO RENDIMIENTO (Para Filtros y JOINs rápidos)
-- ==============================================================================
-- Índices B-Tree convencionales para llaves foráneas y filtros exactos
CREATE INDEX IF NOT EXISTS idx_reportes_categoria ON reportes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_ciudadano ON reportes(id_ciudadano);
CREATE INDEX IF NOT EXISTS idx_historial_reporte ON historial_estados(reporte_id);

-- Índice GIST para búsquedas geoespaciales (Ej: "Obtener reportes a 5km a la redonda")
CREATE INDEX IF NOT EXISTS idx_reportes_ubicacion ON reportes USING GIST (ubicacion);

-- Índice GIN para búsquedas de alta velocidad dentro de las propiedades del JSONB
CREATE INDEX IF NOT EXISTS idx_reportes_metadata ON reportes USING GIN (metadata);