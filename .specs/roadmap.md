// .specs/roadmap.md

# Hoja de Ruta y Hitos - FocoCero Frontend (Estado: Avanzado)

## Fase 1: Inicialización y Contexto Core

- [x] Creación del repositorio y estructura FSD.
- [x] Definición de la Trinidad del Contexto.
- [x] Configuración del ecosistema `.specs`.

## Fase 2: Implementación Core & Dominio (Completado)

- [x] **Capa Core:** Clientes Axios, estrategia Offline (MMKV/Zustand), Queue y Sync.
- [x] **Shared UI:** Sistema de diseño, validadores Zod, animaciones y layouts.
- [x] **Dominio Auth:** Store, hooks, widgets (Welcome, AuthForm, GuestAccess).
- [x] **Dominio FocoIncendio:** Esquemas, types, servicios API y offline.

## Fase 3: Integración y Requisitos Académicos (En Progreso)

- [ ] **Hito 1 (Rúbrica):** Identificar, refinar y documentar explícitamente los **3 Patrones de Diseño** en el código Frontend (ej. Observer en Zustand, Singleton en Axios, Container/Presenter en Widgets).
- [ ] **Hito 2 (Nuevos Features):** Especificar y construir módulos faltantes (ej. `Reportes` o conexión con Telemetría/Analítica).
- [ ] **Hito 3 (TDD):** Validar o incrementar la cobertura de pruebas unitarias al 80%.
- [ ] **Hito 4:** Integración end-to-end con el API Gateway (BFF) del backend.
