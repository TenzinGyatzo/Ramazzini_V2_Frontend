# Ramazzini V2 - Frontend

Este repositorio contiene la interfaz de usuario de la plataforma Ramazzini V2, desarrollada con un enfoque en cumplimiento normativo y eficiencia clínica.

## Stack Tecnológico

- **Framework:** Vue 3 (Composition API)
- **Estado:** Pinia
- **Estilos:** Tailwind CSS
- **HTTP Client:** Axios
- **Tooling:** Vite + TypeScript

## Preparación para NOM-024 (Fase 1)

Este frontend está siendo adaptado para cumplir con la norma **NOM-024-SSA3-2012** para el Intercambio de Información en Salud.

### Documentación de Cumplimiento

Para detalles técnicos sobre la implementación de la Fase 1, consulte los siguientes documentos:

- [Alcance de la Fase 1](./docs/nom-024/FRONTEND_PHASE1_SCOPE.md): Detalles sobre los módulos afectados y nuevos requisitos.
- [Resumen de Diferencias de API](./docs/nom-024/API_DIFF_SUMMARY.md): Cambios en los contratos de la API para cumplimiento MX.
- [Guía de Pruebas de Frontend](./docs/nom-024/FRONTEND_TESTING_GUIDE.md): Protocolos para validar la conformidad con la norma.

## Configuración del Proyecto

```bash
# Instalar dependencias
npm install

# Servir para desarrollo con hot-reload
npm run dev

# Compilar y minificar para producción
npm run build

# Ejecutar pruebas unitarias
npm run test:unit
```

## Directrices de Desarrollo (NOM-024)

1. **Cumplimiento Estricto MX:** Todas las validaciones de campos obligatorios según NOM-024 deben ser aplicadas estrictamente para expedientes en México.
2. **Compatibilidad hacia atrás:** Las funcionalidades no relacionadas con MX deben mantener su comportamiento actual sin interrupciones.
3. **Catálogos Estándar:** Utilizar exclusivamente los catálogos proporcionados por el backend (HL7, CIE-10, catálogos nacionales).
