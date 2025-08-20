<template>
  <div class="step-container">
    <h2 class="step-title">Control Prenatal - Marzo - Tensión Arterial</h2>
    
    <div class="form-section">
      <h3 class="section-title">Tensión Arterial (T.A.)</h3>
      
      <div class="input-group">
        <label for="tensionArterialSistolica" class="input-label">
          Presión Sistólica (mmHg):
        </label>
        <input
          id="tensionArterialSistolica"
          v-model="tensionArterialSistolica"
          type="number"
          min="60"
          max="200"
          class="input-field"
          placeholder="Ej: 120"
          @input="validarTensionArterial"
        />
        <span v-if="mensajeErrorSistolica" class="error-message">
          {{ mensajeErrorSistolica }}
        </span>
      </div>

      <div class="input-group">
        <label for="tensionArterialDiastolica" class="input-label">
          Presión Diastólica (mmHg):
        </label>
        <input
          id="tensionArterialDiastolica"
          v-model="tensionArterialDiastolica"
          type="number"
          min="40"
          max="150"
          class="input-field"
          placeholder="Ej: 80"
          @input="validarTensionArterial"
        />
        <span v-if="mensajeErrorDiastolica" class="error-message">
          {{ mensajeErrorDiastolica }}
        </span>
      </div>

      <div class="result-display" v-if="tensionArterialCompleta">
        <h4 class="result-title">Tensión Arterial:</h4>
        <p class="result-value">{{ tensionArterialCompleta }}</p>
        <p class="result-category">
          Categoría: {{ categoriaTensionArterial }}
        </p>
      </div>

      <div v-if="mensajeErrorRelacion" class="error-message">
        {{ mensajeErrorRelacion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useFormDataStore } from '@/stores/formDataStore'

const formDataStore = useFormDataStore()

// Variables reactivas para la tensión arterial
const tensionArterialSistolica = ref('')
const tensionArterialDiastolica = ref('')
const tensionArterialCompleta = ref('')

// Mensajes de error
const mensajeErrorSistolica = ref('')
const mensajeErrorDiastolica = ref('')
const mensajeErrorRelacion = ref('')

// Función para validar la tensión arterial
const validarTensionArterial = () => {
  // Limpiar mensajes de error previos
  mensajeErrorSistolica.value = ''
  mensajeErrorDiastolica.value = ''
  mensajeErrorRelacion.value = ''

  // Validar presión sistólica
  if (tensionArterialSistolica.value) {
    const sistolica = parseInt(tensionArterialSistolica.value)
    if (sistolica < 60 || sistolica > 200) {
      mensajeErrorSistolica.value = 'La presión sistólica debe estar entre 60 y 200 mmHg'
    }
  }

  // Validar presión diastólica
  if (tensionArterialDiastolica.value) {
    const diastolica = parseInt(tensionArterialDiastolica.value)
    if (diastolica < 40 || diastolica > 150) {
      mensajeErrorDiastolica.value = 'La presión diastólica debe estar entre 40 y 150 mmHg'
    }
  }

  // Validar relación sistólica > diastólica
  if (tensionArterialSistolica.value && tensionArterialDiastolica.value) {
    const sistolica = parseInt(tensionArterialSistolica.value)
    const diastolica = parseInt(tensionArterialDiastolica.value)
    
    if (sistolica <= diastolica) {
      mensajeErrorRelacion.value = 'La presión sistólica debe ser mayor que la diastólica'
    }
  }

  // Formatear la tensión arterial completa
  if (tensionArterialSistolica.value && tensionArterialDiastolica.value && !mensajeErrorRelacion.value) {
    tensionArterialCompleta.value = `${tensionArterialSistolica.value}/${tensionArterialDiastolica.value}`
  } else {
    tensionArterialCompleta.value = ''
  }
}

// Computed para categorizar la tensión arterial
const categoriaTensionArterial = computed(() => {
  if (!tensionArterialSistolica.value || !tensionArterialDiastolica.value) {
    return ''
  }

  const sistolica = parseInt(tensionArterialSistolica.value)
  const diastolica = parseInt(tensionArterialDiastolica.value)

  if (sistolica < 120 && diastolica < 80) {
    return 'Óptima'
  } else if (sistolica < 130 && diastolica < 85) {
    return 'Normal'
  } else if (sistolica < 140 && diastolica < 90) {
    return 'Normal Alta'
  } else if (sistolica < 160 && diastolica < 100) {
    return 'Hipertensión Ligera'
  } else if (sistolica < 180 && diastolica < 110) {
    return 'Hipertensión Moderada'
  } else {
    return 'Hipertensión Severa'
  }
})

// Cargar datos guardados al montar el componente
onMounted(() => {
  if ((formDataStore.formDataControlPrenatal as any).marzoTia) {
    tensionArterialCompleta.value = (formDataStore.formDataControlPrenatal as any).marzoTia
    // Extraer valores individuales si es necesario
    const partes = (formDataStore.formDataControlPrenatal as any).marzoTia.split('/')
    if (partes.length === 2) {
      tensionArterialSistolica.value = partes[0]
      tensionArterialDiastolica.value = partes[1]
    }
  }
})

// Guardar datos cuando cambien
watch([tensionArterialCompleta], (newValue) => {
  if (newValue && !mensajeErrorRelacion.value) {
    (formDataStore.formDataControlPrenatal as any).marzoTia = newValue
  }
}, { deep: true })

// Limpiar al desmontar
onUnmounted(() => {
  // Los datos ya se guardan automáticamente en el store
})
</script>

<style scoped>
.step-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.step-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.form-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 5px;
  display: block;
}

.result-display {
  background: #e8f5e8;
  padding: 20px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 4px solid #27ae60;
}

.result-title {
  font-weight: 600;
  color: #27ae60;
  margin-bottom: 10px;
  font-size: 1rem;
}

.result-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.result-category {
  color: #7f8c8d;
  font-style: italic;
  margin: 0;
}
</style>
