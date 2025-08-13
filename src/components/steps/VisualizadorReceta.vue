<script setup>
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad, calcularAntiguedad, formatDateDDMMYYYY } from '@/helpers/dates';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

// console.log('Datos del store en VisualizadorNotaMedica:', formData.formDataNotaMedica);

</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-6xl mx-auto max-h-[66vh] sm:max-h-[68vh] md:max-h-[67vh] lg:max-h-[67vh] xl:max-h-[81vh] overflow-y-auto">

    <!-- Nombre del trabajador -->
    <div class="w-full flex justify-between items-center">
      <p class="text-justify text-2xl font-medium">
      {{ trabajadores.currentTrabajador.nombre }}
      </p>
    </div>

    <!-- Datos del Trabajador  -->
    <div class="w-full mb-1">
      <p class="text-justify font-light">
        Se trata de <span class="font-medium">{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'un trabajador' : 'una trabajadora' }}</span> de 
        <span class="font-medium">{{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }} años</span> de edad, que labora en la empresa 
        <span class="font-medium">{{ empresas.currentEmpresa.nombreComercial }}</span>, ocupando el puesto de 
        <span class="font-medium">{{ trabajadores.currentTrabajador.puesto }}</span>, con escolaridad 
        <span class="font-medium">{{ trabajadores.currentTrabajador.escolaridad }}</span> y una antigüedad de 
        <span class="font-medium">{{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}</span>. Estado civil: 
        <span class="font-medium">{{ trabajadores.currentTrabajador.estadoCivil }}</span>.
        <span v-if="trabajadores.currentTrabajador.numeroEmpleado"> Número de empleado: <span class="font-medium">{{ trabajadores.currentTrabajador.numeroEmpleado }}</span></span>.
      </p>

    </div>

    <!-- Medicamentos -->
    <div 
      v-if="formData.formDataReceta.medicamentos && formData.formDataReceta.medicamentos.length > 0"
      class="w-full mb-1 cursor-pointer"
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 2 }"
      @click="goToStep(2)"
    >
      <p class="text-justify font-medium">
        TX:
        <span class="font-light block mt-1">
          <div 
            v-for="(item, index) in formData.formDataReceta.medicamentos" 
            :key="index" 
            class="ml-4 relative"
          >
            <span class="absolute left-0">{{ index + 1 }}.</span>
            <span class="block pl-4 font-medium">{{ item }}</span>
          </div>
        </span>
      </p>
    </div>
    <div v-else class="w-full cursor-pointer text-gray-500 italic" :class="{ 'outline outline-1 outline-offset-1 outline-yellow-500 rounded-md': steps.currentStep === 2 }" @click="goToStep(2)">+ Agregar Tratamiento</div>

  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f0f0f0;
  /* Cambia el color según tu diseño */
}
</style>
