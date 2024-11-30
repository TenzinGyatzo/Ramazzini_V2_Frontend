<script setup>
import { ref, onMounted } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { calcularEdad, calcularAntiguedad } from '@/helpers/dates';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();

onMounted(() => {
  formData.resetFormData();
});

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
          formData.formDataCertificado.fechaCertificado }}</span></p>
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
            Que, habiendo practicado reconocimiento médico en esta fecha, al C. <strong>{{ trabajadores.currentTrabajador.nombre }}</strong> de <strong>{{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}</strong> años de edad, <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'lo encontré íntegro' : 'la encontré íntegra' }}</span> físicamente, sin defectos ni anomalías del aparato locomotor, con agudeza visual (AGUUDEZA VISUAL), campo visual, profundidad de campo, estereopsis y percepción cromática sin alteraciones; agudeza auditiva, aparato respiratorio y aparato locomotor íntegros, el examen neurológico reveló buena coordinación y reflejos.
        </p>
     </div>

     <div class="w-full mb-4">
        <p class="text-justify">
            Por lo anterior, se establece que <span>{{ trabajadores.currentTrabajador.sexo === 'Masculino' ? 'el' : 'la' }}</span> C. <strong>{{ trabajadores.currentTrabajador.nombre }}</strong> no presenta impedimento físico para desarrollar el puesto que actualmente solicita. Este certificado de salud no implica ningún tipo de garantía de que el trabajador no se lesionará o enfermará en el futuro.
        </p>
     </div>

    <!-- Trabajador -->
    <div class="w-full">
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NOMBRE
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.nombre }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PUESTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.puesto }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SEXO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.sexo }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESCOLARIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ trabajadores.currentTrabajador.escolaridad }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ANTIGUEDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-semibold">
              {{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}
            </td>
          </tr>
        </tbody>
      </table>
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
