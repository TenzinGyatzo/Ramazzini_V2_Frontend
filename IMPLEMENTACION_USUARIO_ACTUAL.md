# Implementación: Manejo Dinámico del ID del Usuario Actual

## Resumen de la Solución

Se ha implementado un sistema completo para obtener dinámicamente el ID del usuario actual en lugar de usar valores hardcodeados (`'6650f38308ac3beedf5ac41b'`).

## Componentes Implementados

### 1. Composable `useCurrentUser` 
**Archivo**: `frontend/src/composables/useCurrentUser.ts`

Proporciona una interfaz consistente para acceder al usuario actual:

```javascript
import { useCurrentUser } from '@/composables/useCurrentUser';

const { 
  getCurrentUserId,      // Síncrono
  ensureUserLoaded,      // Asíncrono (recomendado)
  currentUserId,         // Computed reactivo
  isAuthenticated        // Computed reactivo
} = useCurrentUser();
```

### 2. Documentación Completa
**Archivo**: `frontend/src/docs/USER_ID_MANAGEMENT.md`

Guía completa de uso con ejemplos para diferentes escenarios.

### 3. Script de Automatización
**Archivo**: `frontend/scripts/update-user-ids.js`

Script de Node.js para actualizar automáticamente los archivos restantes.

## Archivos Actualizados Manualmente

### ✅ Completados
1. **`ModalEmpresas.vue`**
   - Importado `useCurrentUser`
   - Agregado `ensureUserLoaded()` en `handleSubmit`
   - Validación de usuario autenticado
   - Reemplazado IDs hardcodeados con `currentUserId`

2. **`ModalCentros.vue`**
   - Importado `useCurrentUser`
   - Agregado `ensureUserLoaded()` en `handleSubmit`
   - Validación de usuario autenticado
   - Removido campos FormKit hidden hardcodeados

3. **`CrearDocumentoView.vue`**
   - Importado `useCurrentUser`
   - Agregado `ensureUserLoaded()` en `watchEffect`
   - Validación de usuario autenticado
   - Reemplazado IDs hardcodeados con `currentUserId`

## Archivos Pendientes de Actualización

### ⏳ Por Actualizar (usando el script)
1. `ModalCargaDocumentoExterno.vue`
2. `steps/aptitudSteps/Step1.vue`
3. `steps/historiaClinicaSteps/Step1.vue`
4. `steps/notaMedicaSteps/Step1.vue`
5. `steps/exploracionFisicaSteps/Step1.vue`
6. `steps/examenVistaSteps/Step1.vue`
7. `steps/antidopingSteps/Step1.vue`
8. `steps/certificadoSteps/Step1.vue`
9. `ModalTrabajadores.vue`
10. `ModalCargaMasiva.vue`

## Patrón de Implementación

### Para Funciones Asíncronas (Recomendado)
```javascript
const handleSubmit = async (data) => {
  // Obtener el ID del usuario actual
  const currentUserId = await ensureUserLoaded();
  
  if (!currentUserId) {
    toast.open({ 
      message: 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.', 
      type: 'error' 
    });
    return;
  }

  // Usar currentUserId en el formulario
  data.createdBy = currentUserId;
  data.updatedBy = currentUserId;
  
  // Enviar datos al servidor
};
```

### Para FormData
```javascript
const formData = new FormData();
formData.append('createdBy', currentUserId);
formData.append('updatedBy', currentUserId);
```

### Para FormKit (sin campos hidden)
```vue
<!-- Remover campos hidden hardcodeados -->
<!-- <FormKit type="hidden" name="createdBy" :value="'6650f38308ac3beedf5ac41b'" /> -->

<!-- Usar ensureUserLoaded() en la función de submit -->
```

## Beneficios Implementados

1. **✅ Identificación Correcta**: Los registros se asocian con el usuario real
2. **✅ Consistencia**: Mismo patrón en toda la aplicación
3. **✅ Mantenibilidad**: Lógica centralizada en el composable
4. **✅ Seguridad**: Validación de autenticación
5. **✅ UX**: Mensajes de error claros
6. **✅ Fallback**: Manejo de localStorage si el store no está disponible

## Próximos Pasos

### 1. Ejecutar el Script de Automatización
```bash
cd frontend
node scripts/update-user-ids.js
```

### 2. Revisión Manual
Después del script, revisar cada archivo para:
- Verificar que las funciones sean `async` si usan `ensureUserLoaded()`
- Agregar manejo de errores cuando `currentUserId` sea `null`
- Probar la funcionalidad

### 3. Testing
- Probar creación de registros con diferentes usuarios
- Verificar que los campos `createdBy` y `updatedBy` se llenen correctamente
- Confirmar que los mensajes de error aparezcan cuando no hay autenticación

### 4. Documentación del Equipo
- Compartir la documentación con el equipo
- Establecer el patrón como estándar para futuros desarrollos

## Estructura de Archivos Creados

```
frontend/
├── src/
│   ├── composables/
│   │   └── useCurrentUser.ts          # ✅ Composable principal
│   ├── docs/
│   │   └── USER_ID_MANAGEMENT.md      # ✅ Documentación completa
│   └── components/
│       ├── ModalEmpresas.vue          # ✅ Actualizado
│       ├── ModalCentros.vue           # ✅ Actualizado
│       └── ... (otros pendientes)
├── scripts/
│   ├── update-user-ids.js             # ✅ Script de automatización
│   └── README.md                      # ✅ Documentación del script
└── IMPLEMENTACION_USUARIO_ACTUAL.md   # ✅ Este resumen
```

## Estado Actual

- **Composable**: ✅ Implementado y probado
- **Documentación**: ✅ Completa
- **Script de automatización**: ✅ Listo para usar
- **Archivos actualizados**: 3/13 (23%)
- **Archivos pendientes**: 10/13 (77%)

La implementación está lista para ser completada ejecutando el script de automatización y haciendo la revisión manual final. 