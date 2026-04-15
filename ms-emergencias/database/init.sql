\c emergencias_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DO $$ BEGIN
    CREATE TYPE organismo_type AS ENUM (
        'BOMBEROS', 'CONAF', 'SAMU', 'CARABINEROS', 'PDI', 
        'SENAPRED', 'MUNICIPALIDAD', 'DELEGACION', 'EJERCITO', 
        'ARMADA', 'SERVICIOS_PUBLICOS'
    );
    CREATE TYPE despacho_status AS ENUM ('PENDIENTE', 'PROCESANDO', 'EXITOSO', 'FALLIDO', 'REINTENTANDO', 'CANCELADO');
    CREATE TYPE prioridad_type AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS logs_despacho (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    organismo organismo_type NOT NULL,
    estado despacho_status DEFAULT 'PENDIENTE',
    prioridad prioridad_type DEFAULT 'MEDIA',
    request_payload JSONB NOT NULL,
    response_payload JSONB,
    endpoint_url TEXT NOT NULL,
    intentos_actuales INTEGER DEFAULT 0 CHECK (intentos_actuales >= 0),
    max_reintentos_permitidos INTEGER DEFAULT 3,
    duracion_ms INTEGER,
    codigo_error_http INTEGER CHECK (codigo_error_http BETWEEN 100 AND 599),
    error_detalle TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finalizado_at TIMESTAMP WITH TIME ZONE,
    
    -- Idempotencia: No se puede despachar el mismo evento al mismo organismo dos veces
    CONSTRAINT uq_despacho_idempotencia UNIQUE (correlation_id, organismo),
    CONSTRAINT check_intentos CHECK (intentos_actuales <= max_reintentos_permitidos + 1)
);

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_logs_alerta_id ON logs_despacho(alerta_id);
CREATE INDEX IF NOT EXISTS idx_logs_correlation_id ON logs_despacho(correlation_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs_despacho(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_request_json ON logs_despacho USING GIN (request_payload);
CREATE INDEX IF NOT EXISTS idx_logs_reintentos_activos ON logs_despacho(estado) 
WHERE estado IN ('PENDIENTE', 'REINTENTANDO');

-- Trigger de actualización
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_updated_at_emergencias
    BEFORE UPDATE ON logs_despacho
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Metadatos
COMMENT ON TABLE logs_despacho IS 'Historial de auditoría inmutable para integraciones con organismos de emergencia.';
COMMENT ON COLUMN logs_despacho.correlation_id IS 'ID de rastreo (Tracing) para vincular logs entre microservicios.';
COMMENT ON COLUMN logs_despacho.duracion_ms IS 'Latencia de respuesta en milisegundos de la API externa.';