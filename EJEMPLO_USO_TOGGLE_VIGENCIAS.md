# Ejemplo de uso del toggle "Mostrar vigencias"

## En el componente padre (ej: TrabajadoresView.vue)

```vue
<template>
  <div>
    <!-- Controles de visualización -->
    <div class="flex flex-wrap gap-2 mb-4">
      <!-- Botón para mostrar/ocultar vigencias -->
      <button 
        @click="toggleVigencias"
        :class="[
          'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2',
          mostrarVigencias 
            ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' 
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
        ]"
        :title="mostrarVigencias ? 'Ocultar columnas de vigencias' : 'Mostrar columnas de vigencias'"
      >
        <i class="fa-solid fa-calendar-check mr-2"></i>
        {{ mostrarVigencias ? 'Ocultar vigencias' : 'Mostrar vigencias' }}
      </button>

      <!-- Botón existente para mostrar todas las columnas -->
      <button 
        @click="toggleColumnasOcultas"
        :class="[
          'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2',
          mostrarColumnasOcultas 
            ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
        ]"
        :title="mostrarColumnasOcultas ? 'Ocultar columnas adicionales' : 'Mostrar todas las columnas'"
      >
        <i class="fa-solid fa-columns mr-2"></i>
        {{ mostrarColumnasOcultas ? 'Columnas básicas' : 'Todas las columnas' }}
      </button>
    </div>

    <!-- DataTable -->
    <DataTableDT 
      :rows="trabajadores"
      :mostrar-columnas-ocultas="mostrarColumnasOcultas"
      :mostrar-leyenda="mostrarLeyenda"
      :mostrar-vigencias="mostrarVigencias"
      @toggle-leyenda="mostrarLeyenda = $event"
      @toggle-vigencias="mostrarVigencias = $event"
      @toggle-columnas-ocultas="mostrarColumnasOcultas = $event"
      @actualizando-tabla="actualizandoTabla = $event"
      @riesgo-trabajo="abrirModalRiesgoTrabajo"
      @riesgos="abrirModalRiesgos"
      @editar="editarTrabajador"
      @toggle-estado-laboral="toggleEstadoLaboral"
      @eliminar="confirmarEliminacion"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTableDT from '@/components/DataTableDT.vue';

// Estado local
const mostrarColumnasOcultas = ref(false);
const mostrarLeyenda = ref(true);
const mostrarVigencias = ref(false); // Estado inicial: oculto
const actualizandoTabla = ref(false);

// Referencia al componente DataTable
const dataTableRef = ref<InstanceType<typeof DataTableDT> | null>(null);

// Función para alternar vigencias
const toggleVigencias = () => {
  if (dataTableRef.value) {
    dataTableRef.value.toggleVigencias();
  }
};

// Función para alternar columnas ocultas
const toggleColumnasOcultas = () => {
  mostrarColumnasOcultas.value = !mostrarColumnasOcultas.value;
};

// ... resto del código del componente
</script>
```

## Comportamiento esperado:

1. **Estado inicial**: Las columnas de vigencias (4 y 5) están ocultas
2. **Botón "Mostrar vigencias"**: Muestra/oculta solo las columnas 4 y 5
3. **Botón "Mostrar todas las columnas"**: Muestra todas las columnas incluyendo las de vigencias
4. **Botón "Columnas básicas"**: Oculta todas las columnas excepto las básicas, respetando el estado del toggle de vigencias

## Notas importantes:

- El toggle de vigencias solo funciona cuando NO se están mostrando todas las columnas
- Cuando se activan "todas las columnas", automáticamente se activan las vigencias
- El estado se sincroniza correctamente entre ambos toggles
