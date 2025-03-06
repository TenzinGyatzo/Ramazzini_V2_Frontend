<script setup>
import { ref, onMounted, watch } from 'vue';
import { formatDateDDMMYYYY } from '@/helpers/dates';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad } from '@/helpers/dates';
import DocumentosAPI from '@/api/DocumentosAPI';
import { useMedicoFirmanteStore } from '@/stores/medicoFirmante';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();
const medicoFirmanteStore = useMedicoFirmanteStore();


const examenesVista = ref([]);
const nearestExamenVista = ref(null);

const user = ref(
    JSON.parse(localStorage.getItem('user')) || null // Recuperar usuario guardado o establecer null si no existe
);

onMounted(() => {
    // Escucha los cambios en el usuario para cargar proveedor de salud
    watch(
        () => user.user,
        (user) => {
            if (user?._id){
              medicoFirmanteStore.loadMedicoFirmante(user._id);
            }
        },
        { immediate: true } // Ejecutar inmediatamente si ya hay datos cargados
    );
});

onMounted(async () => {
  try {
    const response = await DocumentosAPI.getExamenesVista(trabajadores.currentTrabajadorId);
    examenesVista.value = response.data;
  } catch (error) {
    console.error('Error al obtener los exámenes:', error);
  }

  if (formData.formDataCertificado.fechaCertificado) {
    const referenceDate = new Date(formData.formDataCertificado.fechaCertificado);

    if (isNaN(referenceDate.getTime())) {
      console.error('Fecha del certificado no válida:', formData.formDataCertificado.fechaCertificado);
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
        :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 1 }"
        @click="goToStep(1)">
        <p class="w-full md:w-auto">Fecha: <span class="font-semibold">{{
          formatDateDDMMYYYY(formData.formDataCertificado.fechaCertificado) }}</span></p>
      </div>
    </div>

    <!-- Certificado -->
     <div class="w-full mb-4">
      <p class="text-justify">
        {{ medicoFirmanteStore.medicoFirmante.tituloProfesional === 'Dra.' 
          ? 'La suscrita Médica Cirujano, con cédula profesional número ' 
          : 'El suscrito Médico Cirujano, con cédula profesional número ' }}
        <strong>{{ medicoFirmanteStore.medicoFirmante.numeroCedulaProfesional }}</strong>. 

        <template v-if="medicoFirmanteStore.medicoFirmante.especialistaSaludTrabajo === 'Si'">
          Especialista en Medicina del Trabajo,
        </template>
        <template v-else>
          Con formación en Medicina y dedicado a la práctica en el ámbito de la salud laboral,
        </template>

        <strong>
          {{ medicoFirmanteStore.medicoFirmante.tituloProfesional }} {{ medicoFirmanteStore.medicoFirmante.nombre }}
        </strong><span v-if="medicoFirmanteStore.medicoFirmante.especialistaSaludTrabajo === 'Si'">,</span><span v-else>.</span>

        <template v-if="medicoFirmanteStore.medicoFirmante.especialistaSaludTrabajo === 'Si'">
          legalmente <span v-if="medicoFirmanteStore.medicoFirmante.tituloProfesional === 'Dr.'">autorizado</span> <span v-else>autorizada</span> por la Dirección General de Profesiones para ejercer la Especialidad en Medicina del Trabajo con cédula profesional número 
          <strong>{{ medicoFirmanteStore.medicoFirmante.numeroCedulaEspecialista }}</strong>.
        </template>

        <template v-if="medicoFirmanteStore.medicoFirmante.nombreCredencialAdicional && medicoFirmanteStore.medicoFirmante.numeroCredencialAdicional">
          {{ medicoFirmanteStore.medicoFirmante.nombreCredencialAdicional }} con número 
          <strong>{{ medicoFirmanteStore.medicoFirmante.numeroCredencialAdicional }}</strong>
        </template>

      </p>
     </div>

     <div class="w-full mb-4">
        <h1 class="text-center text-4xl tracking-[.25em]">CERTIFICA</h1>
     </div>

     <div class="w-full mb-4">
        <p class="text-justify">
            Que, habiendo practicado reconocimiento médico en esta fecha, al C. <strong>{{ trabajadores.currentTrabajador.nombre }}</strong> de <strong>{{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}</strong> años de edad, <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'lo encontré íntegro' : 'la encontré íntegra' }}</span> físicamente, sin defectos ni anomalías del aparato locomotor, con agudeza visual{{ nearestExamenVista ? ` OI: 20/${nearestExamenVista?.ojoIzquierdoLejanaSinCorreccion} y OD: 20/${nearestExamenVista?.ojoDerechoLejanaSinCorreccion},` : ',' }} campo visual, profundidad de campo, estereopsis y percepción cromática sin alteraciones; agudeza auditiva, aparato respiratorio y aparato locomotor íntegros, el examen neurológico reveló buena coordinación y reflejos.
        </p>
     </div>

     <div class="w-full mb-4">
        <p class="text-justify">
            Por lo anterior, se establece que <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'el' : 'la' }}</span> C. <strong>{{ trabajadores.currentTrabajador.nombre }}</strong> <span class="cursor-pointer" :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 2 }" @click="goToStep(2)">{{ formData.formDataCertificado.impedimentosFisicos ? formData.formDataCertificado.impedimentosFisicos : '[DESCRIPCIÓN DE IMPEDIMENTOS FÍSICOS]' }}.</span> Este certificado de salud no implica ningún tipo de garantía de que <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'el trabajador' : 'la trabajadora' }}</span> no se lesionará o enfermará en el futuro.
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
