# DocumentoItem - Sistema de Indicadores de Estado del PDF

## Descripción

El componente `DocumentoItem.vue` ahora incluye un sistema completo de indicadores visuales que muestran el estado real de disponibilidad de los PDFs de cada documento.

## Funcionalidad Implementada

### 1. Verificación Automática de Disponibilidad
- **Cuándo se ejecuta**: Al montar el componente y cuando cambian las props del documento
- **Método**: Usa `axios.head()` para verificar si el PDF existe en el servidor
- **Eficiencia**: Solo hace una petición HEAD (más ligera que GET)

### 2. Indicadores Visuales

#### A. Indicador Lateral (Línea Izquierda)
- **🟢 Verde**: PDF disponible y listo para mostrar
- **🟠 Naranja/Rojo**: Documento externo no disponible (solo para documentos externos)
- **🟡 Amarillo/Naranja**: Verificando disponibilidad del PDF (con animación pulse)
- **Sin indicador**: PDF no disponible (comportamiento normal del sistema)

#### B. Borde del Item
- **Gris**: Estado normal (PDF disponible o no disponible)
- **Amarillo**: Verificando disponibilidad

#### C. Icono en el Título
- **✓ Verde**: PDF disponible
- **⚠️ Naranja**: Documento externo no disponible (solo para documentos externos)
- **🔄 Amarillo**: Verificando disponibilidad (con animación spin)
- **Sin icono**: PDF no disponible (comportamiento normal del sistema)

#### D. Tooltips Informativos
- Al hacer hover sobre el indicador lateral se muestra el estado
- Al hacer hover sobre el icono se muestra información adicional

### 3. Estados del Sistema

#### Estado: Verificando
- **Indicador**: Amarillo/Naranja con animación pulse
- **Borde**: Amarillo
- **Icono**: Spinner girando
- **Tooltip**: "Verificando disponibilidad del PDF..."

#### Estado: Disponible
- **Indicador**: Verde
- **Borde**: Gris (normal)
- **Icono**: Check verde
- **Tooltip**: "PDF disponible"

#### Estado: No Disponible (Informes)
- **Indicador**: Sin indicador (comportamiento normal del sistema)
- **Borde**: Gris (normal)
- **Icono**: Sin icono
- **Tooltip**: No aplica

#### Estado: No Disponible (Documentos Externos)
- **Indicador**: Naranja/Rojo
- **Borde**: Gris (normal)
- **Icono**: Triángulo de advertencia naranja
- **Tooltip**: "Documento externo no disponible"

### 4. Integración con Sistema Existente

#### Regeneración de PDFs
- Cuando un PDF no está disponible, al hacer clic se muestra el modal `ModalPdfEliminado`
- Después de regenerar exitosamente, se actualiza automáticamente el estado
- Se verifica la disponibilidad 1 segundo después de la regeneración

#### Documentos Externos
- Los documentos externos no generan PDFs, pero pueden no estar disponibles
- Cuando no están disponibles, muestran indicadores naranjas/rojos para alertar al usuario
- Requieren acción del usuario (eliminar y subir de nuevo) para resolver

## Beneficios

1. **Experiencia de Usuario Mejorada**: 
   - Para informes: Solo indica cuando están disponibles (no confunde con errores)
   - Para documentos externos: Alerta claramente cuando hay problemas reales
2. **Eficiencia**: Evita clics innecesarios en documentos no disponibles
3. **Feedback Visual Intuitivo**: Estados diferenciados según el tipo de documento
4. **Accesibilidad**: Tooltips informativos para todos los estados
5. **Consistencia**: Sistema unificado pero diferenciado por tipo de documento

## Consideraciones Técnicas

- **Performance**: Las verificaciones se hacen de forma asíncrona sin bloquear la UI
- **Caching**: No se cachea el estado para asegurar información actualizada
- **Error Handling**: Manejo robusto de errores de red
- **Responsive**: Los indicadores funcionan en todas las resoluciones

## Mantenimiento

- El sistema se actualiza automáticamente cuando cambian las props
- Los watchers aseguran que el estado esté siempre sincronizado
- La documentación en el código facilita futuras modificaciones 