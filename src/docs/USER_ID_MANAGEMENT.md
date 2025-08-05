# Manejo del ID del Usuario Actual

## Problema
Anteriormente, el ID del usuario estaba hardcodeado en múltiples componentes (`'6650f38308ac3beedf5ac41b'`), lo que impedía identificar correctamente qué usuario creó o modificó los registros en la base de datos.

## Solución
Se ha creado un composable `useCurrentUser` que proporciona una forma consistente y dinámica de obtener el ID del usuario actual en toda la aplicación.

## Uso del Composable

### Importación
```javascript
import { useCurrentUser } from '@/composables/useCurrentUser';
```

### Funciones Disponibles

#### `getCurrentUserId()`
Retorna el ID del usuario actual de forma síncrona.
- Primero intenta obtener del store de usuario
- Si no está disponible, hace fallback a localStorage
- Retorna `null` si no hay usuario autenticado

#### `ensureUserLoaded()`
Función asíncrona que garantiza que el usuario esté cargado.
- Si el usuario no está en el store, lo carga automáticamente
- Retorna el ID del usuario actual
- Retorna `null` si no se puede cargar el usuario

#### `currentUserId` (computed)
Computed property que retorna el ID del usuario actual de forma reactiva.

#### `isAuthenticated` (computed)
Computed property que indica si hay un usuario autenticado.

## Ejemplos de Uso

### En un Componente Vue

```javascript
<script setup>
import { useCurrentUser } from '@/composables/useCurrentUser';

const { getCurrentUserId, ensureUserLoaded } = useCurrentUser();

// Opción 1: Uso síncrono (si el usuario ya está cargado)
const handleSubmitSync = (data) => {
  const userId = getCurrentUserId();
  if (!userId) {
    // Manejar caso de usuario no autenticado
    return;
  }
  
  // Usar userId en el formulario
  data.createdBy = userId;
  data.updatedBy = userId;
};

// Opción 2: Uso asíncrono (recomendado)
const handleSubmitAsync = async (data) => {
  const userId = await ensureUserLoaded();
  
  if (!userId) {
    toast.open({ 
      message: 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.', 
      type: 'error' 
    });
    return;
  }
  
  // Usar userId en el formulario
  data.createdBy = userId;
  data.updatedBy = userId;
};
</script>
```

### En Formularios con FormKit

```javascript
// En lugar de usar campos hidden con valores hardcodeados:
// <FormKit type="hidden" name="createdBy" :value="'6650f38308ac3beedf5ac41b'" />

// Usar el composable en la función de submit:
const handleSubmit = async (data) => {
  const userId = await ensureUserLoaded();
  
  if (!userId) {
    toast.open({ message: 'Error de autenticación', type: 'error' });
    return;
  }
  
  // Agregar el userId al objeto de datos
  const formData = {
    ...data,
    createdBy: userId,
    updatedBy: userId
  };
  
  // Enviar datos al servidor
};
```

### En FormData

```javascript
const handleSubmit = async (data) => {
  const userId = await ensureUserLoaded();
  
  if (!userId) {
    toast.open({ message: 'Error de autenticación', type: 'error' });
    return;
  }
  
  const formData = new FormData();
  formData.append('nombre', data.nombre);
  formData.append('createdBy', userId);
  formData.append('updatedBy', userId);
  
  // Enviar FormData al servidor
};
```

## Archivos Actualizados

Los siguientes archivos han sido actualizados para usar el nuevo composable:

1. `frontend/src/components/ModalEmpresas.vue`
2. `frontend/src/components/ModalCentros.vue`

## Archivos Pendientes de Actualización

Los siguientes archivos aún tienen IDs hardcodeados y necesitan ser actualizados:

1. `frontend/src/views/CrearDocumentoView.vue`
2. `frontend/src/components/ModalCargaDocumentoExterno.vue`
3. `frontend/src/components/steps/aptitudSteps/Step1.vue`
4. `frontend/src/components/steps/historiaClinicaSteps/Step1.vue`
5. `frontend/src/components/steps/notaMedicaSteps/Step1.vue`
6. `frontend/src/components/steps/exploracionFisicaSteps/Step1.vue`
7. `frontend/src/components/steps/examenVistaSteps/Step1.vue`
8. `frontend/src/components/steps/antidopingSteps/Step1.vue`
9. `frontend/src/components/steps/certificadoSteps/Step1.vue`
10. `frontend/src/components/ModalTrabajadores.vue`
11. `frontend/src/components/ModalCargaMasiva.vue`

## Beneficios

1. **Identificación correcta**: Los registros ahora se asocian correctamente con el usuario que los creó/modificó
2. **Consistencia**: Mismo patrón en toda la aplicación
3. **Mantenibilidad**: Cambios centralizados en el composable
4. **Seguridad**: Validación de autenticación antes de operaciones
5. **Experiencia de usuario**: Mensajes de error claros cuando no hay autenticación

## Notas Importantes

- Siempre usar `ensureUserLoaded()` en funciones asíncronas para garantizar que el usuario esté disponible
- Manejar el caso cuando `userId` es `null` mostrando un mensaje de error apropiado
- El composable maneja automáticamente el fallback a localStorage si el store no está disponible 