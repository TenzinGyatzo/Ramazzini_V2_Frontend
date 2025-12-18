# Resumen de Diferencias de API (NOM-024)

Este documento detalla los cambios en los contratos de la API que el frontend debe manejar para la Fase 1.

## Nuevos Endpoints de Catálogos
Para cumplir con la norma, se han introducido catálogos normalizados que reemplazan o complementan a los anteriores:

| Recurso | Endpoint | Descripción |
|---------|----------|-------------|
| Diagnósticos | `/api/catalogs/diagnosticos` | Búsqueda por código o nombre (CIE-10). |
| Geografía | `/api/catalogs/geografia/cp/:id` | Búsqueda de CP que retorna Estado/Municipio/Localidad. |
| Nacionalidades | `/api/catalogs/nacionalidades` | Catálogo estándar de nacionalidades. |
| Religiones | `/api/catalogs/religiones` | Catálogo estándar de religiones. |

## Cambios en Estructuras de Datos

### Expedientes (POST/PATCH `/api/expedientes`)
Se requieren nuevos campos para el cumplimiento:
- `curp`: String (Validado contra regex MX).
- `lugarNacimiento`: UUID (Referencia al catálogo de entidades federativas).
- `escolaridad`: UUID (Referencia al catálogo de formación académica).

### Notas Médicas (POST `/api/notes`)
- Los diagnósticos ahora deben enviarse como un array de objetos con `id` (del catálogo CIE-10) y `tipo` (Principal/Secundario).
- Es obligatorio incluir el set completo de signos vitales (TA, FC, FR, Temp, Peso, Talla).

## Manejo de Errores (422 Unprocessable Entity)
El backend ahora puede retornar errores de validación específicos de NOM-024:

```json
{
  "statusCode": 422,
  "message": "Error de cumplimiento NOM-024",
  "errors": [
    {
      "field": "signosVitales.frecuenciaRespiratoria",
      "reason": "Requerido por NOM-024 para notas de consulta"
    }
  ]
}
```

## Compatibilidad
Si el encabezado `X-Region` no es `MX`, el API puede relajar ciertas validaciones. El frontend debe enviar este encabezado basándose en la configuración de la clínica actual.

