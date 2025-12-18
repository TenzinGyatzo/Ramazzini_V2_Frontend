# Guía de Pruebas de Frontend (NOM-024)

## Protocolos de Validación

### 1. Pruebas de Validación de Campos
- **Objetivo:** Verificar que los campos obligatorios impidan el envío de formularios incompletos en contexto MX.
- **Acciones:**
    - Intentar guardar un expediente sin CURP (debe fallar).
    - Intentar guardar una nota médica sin signos vitales (debe fallar).
    - Verificar que los mensajes de error sean claros y específicos.

### 2. Pruebas de Catálogos Normalizados
- **Objetivo:** Asegurar que los selectores consuman los nuevos catálogos.
- **Acciones:**
    - Realizar búsquedas en el selector de diagnósticos (CIE-10) con más de 3 caracteres.
    - Validar que al seleccionar un Código Postal, se auto-completen los campos de Estado, Municipio y Localidad.

### 3. Pruebas de Localización (MX vs non-MX)
- **Objetivo:** Garantizar la compatibilidad hacia atrás.
- **Acciones:**
    - Cambiar la región de la clínica a `US` o `LATAM` (si aplica).
    - Verificar que las validaciones de CURP o catálogos específicos de MX ya no sean obligatorias.

## Herramientas Recomendadas

- **Vue Devtools:** Para inspeccionar el estado de Pinia y asegurarse de que los datos de los catálogos se están cacheando correctamente.
- **Network Tab (Chrome):** Para verificar que las peticiones Axios incluyan los encabezados de región correctos.
- **Mock Service Worker (MSW):** Para simular respuestas de error de cumplimiento (422) durante el desarrollo de componentes.

## Casos de Prueba Críticos (Sanity Check)

1. **Registro de Paciente Nuevo:** Registro completo usando solo catálogos normalizados.
2. **Edición de Nota Médica:** Validación de que los diagnósticos existentes se mapeen correctamente al nuevo formato CIE-10.
3. **Búsqueda Avanzada:** Búsqueda de diagnósticos por código (ej. "E11") y por descripción (ej. "Diabetes").

