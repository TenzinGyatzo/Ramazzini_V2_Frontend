# Scripts de Utilidad

## update-user-ids.js

Este script automatiza la actualización de IDs de usuario hardcodeados en los archivos Vue del proyecto.

### Propósito

Reemplaza automáticamente todas las instancias del ID hardcodeado `'6650f38308ac3beedf5ac41b'` con el uso del composable `useCurrentUser` para obtener dinámicamente el ID del usuario actual.

### Uso

```bash
# Desde la raíz del proyecto
node frontend/scripts/update-user-ids.js

# O desde el directorio frontend
cd frontend
node scripts/update-user-ids.js
```

### Qué hace el script

1. **Busca y reemplaza patrones específicos**:
   - Líneas con `createdBy` o `updatedBy` hardcodeados
   - Campos FormKit hidden con valores hardcodeados
   - `formData.append()` con IDs hardcodeados

2. **Agrega imports automáticamente**:
   - Importa `useCurrentUser` si no existe
   - Agrega el destructuring `{ ensureUserLoaded }` si no existe

3. **Procesa los siguientes archivos**:
   - `ModalCargaDocumentoExterno.vue`
   - `steps/aptitudSteps/Step1.vue`
   - `steps/historiaClinicaSteps/Step1.vue`
   - `steps/notaMedicaSteps/Step1.vue`
   - `steps/exploracionFisicaSteps/Step1.vue`
   - `steps/examenVistaSteps/Step1.vue`
   - `steps/antidopingSteps/Step1.vue`
   - `steps/certificadoSteps/Step1.vue`
   - `ModalTrabajadores.vue`
   - `ModalCargaMasiva.vue`

### Después de ejecutar el script

**IMPORTANTE**: El script automatiza gran parte del trabajo, pero necesitas revisar manualmente cada archivo actualizado:

1. **Verificar que las funciones sean async**: Si usas `ensureUserLoaded()`, la función debe ser `async`
2. **Agregar manejo de errores**: Verificar que `currentUserId` no sea `null`
3. **Probar la funcionalidad**: Asegurarte de que todo funcione correctamente

### Ejemplo de salida

```
🔄 Iniciando actualización de IDs de usuario...

[1/10] Procesando: frontend/src/components/ModalCargaDocumentoExterno.vue
  ✅ Aplicado patrón 1 en frontend/src/components/ModalCargaDocumentoExterno.vue
  ✅ Agregado import de useCurrentUser en frontend/src/components/ModalCargaDocumentoExterno.vue
  ✅ Agregado destructuring de useCurrentUser en frontend/src/components/ModalCargaDocumentoExterno.vue
✅ Archivo actualizado: frontend/src/components/ModalCargaDocumentoExterno.vue

[2/10] Procesando: frontend/src/components/steps/aptitudSteps/Step1.vue
  ✅ Aplicado patrón 1 en frontend/src/components/steps/aptitudSteps/Step1.vue
✅ Archivo actualizado: frontend/src/components/steps/aptitudSteps/Step1.vue

...

📊 Resumen:
   Total de archivos procesados: 10
   Archivos actualizados: 8
   Archivos sin cambios: 2

⚠️  IMPORTANTE:
   Después de ejecutar este script, debes:
   1. Revisar manualmente cada archivo actualizado
   2. Asegurarte de que las funciones que usan currentUserId sean async
   3. Agregar manejo de errores cuando currentUserId sea null
   4. Probar que la funcionalidad siga funcionando correctamente

✅ Proceso completado.
```

### Patrones que reemplaza

1. **Líneas de asignación**:
   ```javascript
   // Antes
   createdBy: '6650f38308ac3beedf5ac41b', // TODO: Obtener el ID del usuario actual
   
   // Después
   createdBy: currentUserId, // TODO: Obtener el ID del usuario actual
   ```

2. **FormKit hidden fields**:
   ```vue
   <!-- Antes -->
   <FormKit type="hidden" name="createdBy" :value="'6650f38308ac3beedf5ac41b'" />
   
   <!-- Después -->
   <!-- Removed hardcoded user ID - use ensureUserLoaded() in script instead -->
   ```

3. **FormData.append**:
   ```javascript
   // Antes
   formData.append('createdBy', '6650f38308ac3beedf5ac41b'); // TODO: Obtener el ID del usuario actual
   
   // Después
   formData.append('createdBy', currentUserId); // TODO: Obtener el ID del usuario actual
   ```

### Notas de seguridad

- El script hace una copia de seguridad implícita al leer el archivo antes de modificarlo
- Si algo sale mal, puedes revertir los cambios con git
- Siempre revisa los cambios antes de hacer commit

### Personalización

Si necesitas agregar más archivos o patrones, puedes modificar las variables `filesToUpdate` y `patterns` en el script. 