\c multimedia_db;

DO $$ BEGIN
    CREATE TYPE contexto_multimedia AS ENUM ('reporte', 'alerta', 'perfil_ciudadano', 'evidencia_brigada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS archivos_multimedia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url_publica TEXT NOT NULL CHECK (url_publica ~* '^https?://'),
    formato VARCHAR(50) NOT NULL,
    peso_bytes BIGINT NOT NULL CHECK (peso_bytes > 0),
    id_usuario VARCHAR(128) NOT NULL CHECK (char_length(TRIM(id_usuario)) > 0),
    contexto contexto_multimedia DEFAULT 'reporte',
    metadata JSONB DEFAULT '{}'::jsonb,
    es_huerfano BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_archivos_usuario ON archivos_multimedia(id_usuario);
CREATE INDEX IF NOT EXISTS idx_archivos_huerfanos_limpieza ON archivos_multimedia(created_at) WHERE es_huerfano = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_archivos_metadata ON archivos_multimedia USING GIN (metadata);

DROP TRIGGER IF EXISTS trg_archivos_multimedia_updated_at ON archivos_multimedia;
CREATE TRIGGER trg_archivos_multimedia_updated_at
    BEFORE UPDATE ON archivos_multimedia
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE archivos_multimedia IS 'Registro central de archivos en la nube (Stateless)';
COMMENT ON COLUMN archivos_multimedia.metadata IS 'Almacena ancho, alto, EXIF (GPS original de la foto) o nombre original';