<script setup>
import { ref, onMounted, watch } from 'vue';
import { formatDateDDMMYYYY } from '@/helpers/dates';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad } from '@/helpers/dates';
import DocumentosAPI from '@/api/DocumentosAPI';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

const examenesVista = ref([]);
const nearestExamenVista = ref(null);

onMounted(async () => {
  formData.resetFormData();
  
  try {
    const response = await DocumentosAPI.getExamenesVista(trabajadores.currentTrabajadorId);
    examenesVista.value = response.data;
  } catch (error) {
    console.error('Error al obtener los exámenes:', error);
  }
});

watch(
  () => formData.formDataCertificado.fechaCertificado,
  (newFechaCertificado) => {
    if (!newFechaCertificado || !examenesVista.value.length) {
      nearestExamenVista.value = null;
      return;
    }

    const referenceDate = new Date(newFechaCertificado);

    if (isNaN(referenceDate.getTime())) {
      console.error('Fecha del certificado no válida:', newFechaCertificado);
      nearestExamenVista.value = null;
      return;
    }

    // Procesar solo si las fechas son válidas
    nearestExamenVista.value = examenesVista.value.reduce((closest, current) => {
      const currentDate = current.fechaExamenVista ? new Date(current.fechaExamenVista) : null;

      if (!currentDate || isNaN(currentDate.getTime())) {
        console.error('Fecha de examen no válida:', current.fechaExamenVista);
        return closest; // Ignorar exámenes con fechas inválidas
      }

      const currentDiff = Math.abs(currentDate - referenceDate);
      const closestDiff = closest
        ? Math.abs(new Date(closest.fechaExamenVista) - referenceDate)
        : Infinity;

      return currentDiff < closestDiff ? current : closest;
    }, null);
    
  },
  { immediate: true }
);

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-6xl mx-auto max-h-[66vh] sm:max-h-[68vh] md:max-h-[67vh] lg:max-h-[67vh] xl:max-h-[81vh] overflow-y-auto">

    <!-- Empresa y Fecha -->
    <div class="flex flex-wrap w-full gap-1 md:gap-4">
      <!-- Empresa -->
      <div class="w-full md:w-[calc(75%-0.5rem)]">
        <p class="text-center text-base sm:text-lg">
          {{ empresas.currentEmpresa.nombreComercial }}
        </p>
      </div>

      <!-- Fecha -->
      <div class="w-full md:w-[calc(25%-0.5rem)] flex flex-wrap gap-2 justify-end text-sm sm:text-base cursor-pointer"
        @click="goToStep(1)">
        <p class="w-full md:w-auto">Fecha: <span class="font-semibold">{{
          formatDateDDMMYYYY(formData.formDataCertificado.fechaCertificado) }}</span></p>
      </div>
    </div>

    <!-- Certificado -->
     <div class="w-full mb-4">
        <p class="text-justify">
            El suscrito Médico Cirujano, con cédula profesional número <strong>1379978</strong>. Especialista en Medicina del trabajo, <strong>Dr. Jesús Manuel Coronel Valenzuela</strong>, legalmente autorizado por la Dirección General de Profesiones para ejercer la Especialidad en Medicina del Trabajo con cédula profesional número <strong>3181172</strong> y Certificado ante el Consejo Mexicano de Medicina del Trabajo con número <strong>891</strong>.
        </p>
     </div>

     <div class="w-full mb-4">
        <h1 class="text-center text-4xl tracking-[.25em]">CERTIFICA</h1>
     </div>

     <div class="w-full mb-4">
        <p class="text-justify">
            Que, habiendo practicado reconocimiento médico en esta fecha, al C. <strong>{{ trabajadores.currentTrabajador.nombre }}</strong> de <strong>{{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}</strong> años de edad, <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'lo encontré íntegro' : 'la encontré íntegra' }}</span> físicamente, sin defectos ni anomalías del aparato locomotor, con agudeza visual{{ nearestExamenVista ? ` OI: 20/${nearestExamenVista?.ojoIzquierdoCercanaSinCorreccion} y OD: 20/${nearestExamenVista?.ojoDerechoCercanaSinCorreccion},` : ',' }} campo visual, profundidad de campo, estereopsis y percepción cromática sin alteraciones; agudeza auditiva, aparato respiratorio y aparato locomotor íntegros, el examen neurológico reveló buena coordinación y reflejos.
        </p>
     </div>

     <div class="w-full mb-4">
        <p class="text-justify">
            Por lo anterior, se establece que <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'el' : 'la' }}</span> C. <strong>{{ trabajadores.currentTrabajador.nombre }}</strong> {{ formData.formDataCertificado.impedimentosFisicos ? formData.formDataCertificado.impedimentosFisicos : '[DESCRIPCIÓN DE IMPEDIMENTOS FÍSICOS]' }}. Este certificado de salud no implica ningún tipo de garantía de que <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'el trabajador' : 'la trabajadora' }}</span> no se lesionará o enfermará en el futuro.
        </p>
     </div>
     
     <div class="w-full mb-4">
        <p class="text-justify">
            Expido el presente certificado médico a petición <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'del' : 'de la' }}</span> C. <strong>{{ trabajadores.currentTrabajador.nombre }}</strong> para los usos legales a que haya lugar, en la ciudad de Los Mochis, Sinaloa, en la fecha mencionada al inicio de este certificado.
        </p>
     </div>

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
