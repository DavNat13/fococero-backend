-- ==========================================
-- INICIALIZACIÓN DE TABLAS: MS-ALERTAS (ENTERPRISE)
-- ==========================================
\c alertas_db;
-- 1. Habilitar extensión espacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Crear Tipos de Datos Estrictos (ENUMs)
CREATE TYPE tipo_alerta AS ENUM (
    'INCENDIO', 
    'MICROBASURAL', 
    'VEGETACION_SECA', 
    'ALUMBRADO_DEFECTUOSO',
    'OTRO'
);

CREATE TYPE gravedad_alerta AS ENUM (
    'BAJA', 
    'MEDIA', 
    'ALTA', 
    'CRITICA'
);

CREATE TYPE estado_alerta AS ENUM (
    'REPORTADA',
    'EN_REVISION',
    'DERIVADA',
    'RESUELTA',
    'DESCARTADA'
);

    
CREATE OR REPLACE FUNCTION update_alertas_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Creación de la Tabla Principal de Alertas
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referencias "Soft"
    foco_id UUID, 
    usuario_id VARCHAR(100) NOT NULL, 
    
    -- Datos ENUM
    tipo tipo_alerta NOT NULL,
    gravedad gravedad_alerta NOT NULL DEFAULT 'MEDIA',
    estado estado_alerta NOT NULL DEFAULT 'REPORTADA',
    
    -- Contenido con CHECK Constraint (impide que se guarden strings vacíos o solo espacios)
    descripcion TEXT NOT NULL CHECK (char_length(trim(descripcion)) > 0),
    imagenes TEXT[] DEFAULT '{}', 
    
    -- Ubicación Espacial Exacta
    ubicacion GEOMETRY(Point, 4326) NOT NULL,
    
    -- Metadatos extensibles
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Trazabilidad y Borrado Lógico
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    eliminado_en TIMESTAMP WITH TIME ZONE -- Si es NULL, está activa. Si tiene fecha, está "borrada".
);

-- 5. Creación de la Tabla de Auditoría (Historial)
CREATE TABLE IF NOT EXISTS historial_alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alerta_id UUID NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
    estado_anterior estado_alerta,
    estado_nuevo estado_alerta NOT NULL,
    usuario_modificador_id VARCHAR(100), -- Quién hizo el cambio
    comentario TEXT, -- Por qué se cambió de estado
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Función automática para registrar cambios de estado en el historial
CREATE OR REPLACE FUNCTION auditar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo guardamos si el estado realmente cambió
    IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado) THEN
        INSERT INTO historial_alertas (alerta_id, estado_anterior, estado_nuevo)
        VALUES (NEW.id, OLD.estado, NEW.estado);
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO historial_alertas (alerta_id, estado_anterior, estado_nuevo)
        VALUES (NEW.id, NULL, NEW.estado);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Asociar los Triggers a las tablas
-- ✅ FIX: Llama a la nueva función de alertas
CREATE TRIGGER set_timestamp_alertas
BEFORE UPDATE ON alertas
FOR EACH ROW
EXECUTE FUNCTION update_alertas_modtime();

-- Guarda en el historial después de insertar o actualizar el estado
CREATE TRIGGER trigger_auditoria_estado
AFTER INSERT OR UPDATE ON alertas
FOR EACH ROW
EXECUTE FUNCTION auditar_cambio_estado();

-- 8. Índices de Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_alertas_ubicacion_gist ON alertas USING GIST (ubicacion);
-- Índice parcial: Solo indexamos las que NO están eliminadas (ahorra muchísimo espacio)
CREATE INDEX IF NOT EXISTS idx_alertas_estado_gravedad ON alertas(estado, gravedad) WHERE eliminado_en IS NULL;
CREATE INDEX IF NOT EXISTS idx_alertas_usuario_id ON alertas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_foco_id ON alertas(foco_id);
CREATE INDEX IF NOT EXISTS idx_alertas_metadata_gin ON alertas USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_historial_alerta_id ON historial_alertas(alerta_id);

-- 9. Documentación
COMMENT ON TABLE alertas IS 'Registro central de alertas con borrado lógico y trazabilidad espacial.';
COMMENT ON TABLE historial_alertas IS 'Auditoría automática de cambios de estado para cada alerta.';