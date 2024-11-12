<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import GreenButton from '@/components/GreenButton.vue';
import { calcularEdad } from '@/helpers/dates';
import GrupoDocumentos from '@/components/GrupoDocumentos.vue';
import { useDocumentosStore } from '@/stores/documentos';

const route = useRoute();
const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();

watch(
  () => route.params, // Observamos los parámetros idEmpresa e idCentroTrabajo
  (newParams) => {
    const { idEmpresa, idCentroTrabajo, idTrabajador } = newParams;
    if (idEmpresa && idCentroTrabajo && idTrabajador) {
      // Cuando todos los parámetros están definidos, realizamos las llamadas necesarias
      empresas.fetchEmpresaById(String(idEmpresa));
      centrosTrabajo.fetchCentroTrabajoById(String(idEmpresa), String(idCentroTrabajo));
      trabajadores.fetchTrabajadorById(String(idEmpresa), String(idCentroTrabajo), String(idTrabajador));

      empresas.currentEmpresaId = String(idEmpresa); // Seteamos el id de la empresa actual en el store
      centrosTrabajo.currentCentroTrabajoId = String(idCentroTrabajo); // Seteamos el id del centro de trabajo actual en el store
      trabajadores.currentTrabajadorId = String(idTrabajador); // Seteamos el id del trabajador actual en el store
    }
  },
  { immediate: true } // Esto asegura que el watch se ejecute inmediatamente con el valor actual
);

onMounted(() => {
  const trabajadorId = String(route.params.idTrabajador);
  documentos.fetchAllDocuments(trabajadorId);
});

</script>

<template>
  <div class="p-5 grid gap-5">
    <div class="flex flex-col md:flex-row justify-center gap-3 md:gap-6">
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Historia Clínica" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl"
        text="Exploración Fisica" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Examen Vista" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Antidoping" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Aptitud" />
      <GreenButton class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" text="Certificado" />
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="trabajadores.currentTrabajador" class="w-full text-center items-center grid grid-cols-1 gap-1 mt-1">
        <h1 class="text-3xl">{{ trabajadores.currentTrabajador?.nombre }}</h1>
        <h1 class="text-xl">{{ calcularEdad(trabajadores.currentTrabajador?.fechaNacimiento) }} años - {{
          trabajadores.currentTrabajador?.puesto }}</h1>
      </div>
    </Transition>

    <Transition appear mode="out-in" name="slide-up">
      <div v-if="documentos.loading">
        <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
      </div>
      <div v-else>
        <div v-if="documentos.documentsByYear && Object.keys(documentos.documentsByYear).length"
          class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div v-for="year in Object.keys(documentos.documentsByYear).sort((a, b) => Number(b) - Number(a))" :key="year">
            <GrupoDocumentos :documents="documentos.documentsByYear[year]" :year="String(year)" />
          </div>
        </div>
        <h1 v-else
          class="text-xl sm:text-2xl md:text-3xl px-3 py-5 sm:px-6 sm:py-10 text-center font-medium text-gray-700">Esta
          trabajador aun no tiene documentos registrados</h1>
      </div>
    </Transition>

  </div>
</template>