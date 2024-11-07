<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import GreenButton from '@/components/GreenButton.vue';
import { calcularEdad } from '@/helpers/dates';

const route = useRoute();
const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();

watch(
  () => route.params, // Observamos los parámetros idEmpresa e idCentroTrabajo
  (newParams) => {
    const { idEmpresa, idCentroTrabajo, idTrabajador } = newParams;
    if (idEmpresa && idCentroTrabajo && idTrabajador) {
      // Cuando todos los parámetros están definidos, realizamos las llamadas necesarias
      empresas.fetchEmpresaById(String(idEmpresa));
      centrosTrabajo.fetchCentroTrabajoById(String(idEmpresa), String(idCentroTrabajo));
      trabajadores.fetchTrabajadorById(String(idEmpresa), String(idCentroTrabajo), String(idTrabajador));
      // Aquí se debe hacer el fetch de los informes médicos del trabajador

      empresas.currentEmpresaId = String(idEmpresa); // Seteamos el id de la empresa actual en el store
      centrosTrabajo.currentCentroTrabajoId = String(idCentroTrabajo); // Seteamos el id del centro de trabajo actual en el store
      trabajadores.currentTrabajadorId = String(idTrabajador); // Seteamos el id del trabajador actual en el store
    }
  },
  { immediate: true } // Esto asegura que el watch se ejecute inmediatamente con el valor actual
);

</script>

<template>
  <div class="p-5 grid gap-5">
    <div class="flex flex-col md:flex-row justify-center gap-3 md:gap-6">
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Historia Clínica" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Exploración Fisica" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Examen Vista" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Antidoping" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Aptitud" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Certificado" />
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="trabajadores.currentTrabajador" class="w-full text-center items-center grid grid-cols-1 gap-1 mt-4">
        <h1 class="text-3xl">{{ trabajadores.currentTrabajador?.nombre }}</h1>
        <h1 class="text-xl">{{ calcularEdad(trabajadores.currentTrabajador?.fechaNacimiento) }} años - {{ trabajadores.currentTrabajador?.puesto }}</h1>
      </div>
    </Transition>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="w-full">
        <h1 class="border-2 border-gray-800 bg-gray-300 rounded-t-lg text-center">Documentos 2025</h1>
        <h1 class="border-2 border-gray-800 border-t-0 bg-gray-50">item 2</h1>
        <h1 class="border-2 border-gray-800 border-t-0 bg-gray-50">item 3</h1>
      </div>
      <div class="w-full">
        <h1 class="border-2 border-gray-800 bg-gray-300 rounded-t-lg text-center">Documentos 2024</h1>
        <div class="border-2 border-gray-800 border-t-0 bg-gray-50">
          <p class="text-lg p-1">Aptitud al Puesto <span class="text-sm">14-11-2024</span></p>
          <p class="text-sm px-1">Apto Sin Restricciones</p>
        </div>
        <h1 class="border-2 border-gray-800 border-t-0 bg-gray-50">item 3</h1>
      </div>
    </div>

  </div>
</template>