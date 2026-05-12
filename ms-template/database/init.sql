-- ==========================================
-- 📁 Database Init Script - ms-template
-- ==========================================
-- Ejecuta este script para inicializar la
-- base de datos del microservicio

-- Crear base de datos si no existe
-- CREATE DATABASE ms_template;

-- Conectar a la base de datos
-- \c ms_template;

-- ==========================================
-- 🗄️ Tabla de Recursos de Ejemplo
-- ==========================================
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para optimizacion
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- Trigger para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ✅ Datos de Prueba (Opcional)
-- ==========================================
INSERT INTO resources (name) VALUES
    ('Recurso de Ejemplo 1'),
    ('Recurso de Ejemplo 2'),
    ('Recurso de Ejemplo 3')
ON CONFLICT DO NOTHING;