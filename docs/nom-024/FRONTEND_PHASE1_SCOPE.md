# Alcance de la Fase 1 - Frontend (NOM-024)

## Objetivo
Preparar la interfaz de usuario para el cumplimiento estricto de la norma NOM-024-SSA3-2012, enfocándose en la estandarización de datos y validaciones obligatorias para el mercado mexicano.

## Módulos Afectados

### 1. Perfil del Paciente / Expediente
- **Estandarización de Datos Demográficos:** Implementación de campos obligatorios según el estándar (CURP, Género, Lugar de Nacimiento, etc.).
- **Validaciones Localizadas:** Lógica de validación específica para México (formatos de CP, RFC, CURP).

### 2. Historia Clínica y Notas Médicas
- **Estructura SOAP:** Refuerzo de la estructura de Notas de Evolución y Consulta.
- **Campos Obligatorios:** Marcar y validar visualmente los campos requeridos por la norma (Signos vitales completos, diagnósticos con CIE-10).

### 3. Gestión de Catálogos
- **Consumo de Catálogos NOM:** Integración con los nuevos endpoints de catálogos normalizados (Nacionalidades, Religiones, Parentesco, etc.).
- **Selectores de Búsqueda:** Mejoras en los componentes de búsqueda para manejar grandes volúmenes de datos (ej. CIE-10).

## Requisitos de UI/UX

- **Indicadores de Cumplimiento:** Visualización clara de qué campos son necesarios para que un expediente sea considerado "Conforme a NOM-024".
- **Modo Estricto MX:** El frontend debe detectar si el establecimiento es de México para activar las reglas de validación más estrictas.
- **Manejo de Errores de API:** Mostrar mensajes claros cuando el backend rechaza una operación por falta de cumplimiento normativo.

## No en Alcance (Fase 1)
- Firma electrónica avanzada (FIEL).
- Interoperabilidad HL7 FHIR (solo consumo de datos normalizados).
- Generación de documentos PDF certificados.

