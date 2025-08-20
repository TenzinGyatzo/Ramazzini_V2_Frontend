<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useFormDataStore } from '@/stores/formDataStore'

const formDataStore = useFormDataStore()

// Variables reactivas
const marzoFcf = ref('')
const categoriaFcf = ref('')

// Presets comunes de FCF
const presets = [120, 140, 160, 180]

// Función para determinar la categoría de FCF
const determinarCategoriaFcf = (fcf: number): string => {
  if (fcf < 110) return 'Bradicardia'
  if (fcf >= 110 && fcf <= 160) return 'Normal'
  return 'Taquicardia'
}

// Cargar datos guardados al montar el componente
onMounted(() => {
  if ((formDataStore.formDataControlPrenatal as any).marzoFcf) {
    marzoFcf.value = (formDataStore.formDataControlPrenatal as any).marzoFcf
    categoriaFcf.value = determinarCategoriaFcf(Number((formDataStore.formDataControlPrenatal as any).marzoFcf))
  }
})

// Guardar datos cuando cambien
watch([marzoFcf], (newValue) => {
  if (newValue && !mensajeErrorFcf.value) {
    (formDataStore.formDataControlPrenatal as any).marzoFcf = newValue
    categoriaFcf.value = determinarCategoriaFcf(Number(newValue))
  }
}, { deep: true })

// Computed para la categoría
const categoriaFcfComputed = computed(() => {
  const fcf = Number(marzoFcf.value)
  if (!marzoFcf.value) return { text: 'No especificado', class: 'text-gray-500' }
  
  const categoria = determinarCategoriaFcf(fcf)
  switch (categoria) {
    case 'Bradicardia':
      return { text: 'Bradicardia', class: 'text-red-600 font-semibold' }
    case 'Normal':
      return { text: 'Normal', class: 'text-green-600 font-semibold' }
    case 'Taquicardia':
      return { text: 'Taquicardia', class: 'text-orange-600 font-semibold' }
    default:
      return { text: 'No especificado', class: 'text-gray-500' }
  }
})

// Validación
const mensajeErrorFcf = computed(() => {
  if (!marzoFcf.value) return 'La FCF es requerida'
  const fcf = Number(marzoFcf.value)
  if (fcf < 60) return 'La FCF debe ser mayor o igual a 60 lpm'
  if (fcf > 250) return 'La FCF debe ser menor o igual a 250 lpm'
  return ''
})

// Función para seleccionar preset
const seleccionarPreset = (valor: number) => {
  marzoFcf.value = valor.toString()
}
</script>

<template>
  <div class="step-container">
    <h2 class="step-title">Control Prenatal - Marzo - Frecuencia Cardíaca Fetal</h2>
    
    <div class="form-section">
      <div class="input-group">
        <label for="marzoFcf" class="form-label">Frecuencia Cardíaca Fetal (FCF) - Marzo</label>
        <div class="input-with-unit">
          <input
            id="marzoFcf"
            v-model="marzoFcf"
            type="number"
            min="60"
            max="250"
            step="1"
            class="form-input"
            placeholder="Ingrese la FCF"
            :class="{ 'error': mensajeErrorFcf }"
          />
          <span class="unit">lpm</span>
        </div>
        <div v-if="mensajeErrorFcf" class="error-message">
          {{ mensajeErrorFcf }}
        </div>
      </div>

      <div class="fcf-info">
        <div class="fcf-category">
          <strong>Categoría:</strong> 
          <span :class="categoriaFcfComputed.class">{{ categoriaFcfComputed.text }}</span>
        </div>
        
        <div class="fcf-presets">
          <strong>Valores comunes:</strong>
          <div class="preset-buttons">
            <button 
              v-for="preset in presets" 
              :key="preset"
              @click="seleccionarPreset(preset)"
              class="preset-btn"
              type="button"
            >
              {{ preset }} lpm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
}

.form-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.unit {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 40px;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.fcf-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.fcf-category {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #3b82f6;
}

.fcf-presets {
  margin-top: 1rem;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preset-btn {
  padding: 0.5rem 1rem;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.preset-btn:hover {
  background: #d1d5db;
  border-color: #9ca3af;
}

.preset-btn:active {
  transform: translateY(1px);
}
</style>