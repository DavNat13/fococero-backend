-- =================================================================
-- FOCOCERO - SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS (ms-auth)
-- =================================================================
\c auth_db;
-- 1. Crear los Tipos de Datos (Enums) si no existen
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('invitado', 'usuario', 'brigadista', 'admin');
    CREATE TYPE user_status AS ENUM ('activo', 'bloqueado', 'suspendido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20),
    firebase_uid VARCHAR(128) UNIQUE,
    fcm_token VARCHAR(255),
    rol user_role DEFAULT 'invitado',
    estado user_status DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nota: En producción, este archivo se corre automáticamente usandoherramientas como Flyway o pasándolo al contenedor de PostgreSQL.