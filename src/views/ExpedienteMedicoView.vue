<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import GreenButton from '@/components/GreenButton.vue';
import SliderButton from '@/components/SliderButton.vue';
import { calcularEdad } from '@/helpers/dates';
import GrupoDocumentos from '@/components/GrupoDocumentos.vue';
import { useDocumentosStore } from '@/stores/documentos';
import { useFormDataStore } from '@/stores/formDataStore';

const route = useRoute();
const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const formData = useFormDataStore();

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
  formData.resetFormData();
});

const navigateTo = (routeName, params) => {
  router.push({ name: routeName, params });
  documentos.setCurrentTypeOfDocument(params.tipoDocumento);
};

</script>

<template>
  <div class="p-5 grid gap-5">
    <div class="flex flex-wrap flex-col md:flex-row justify-center gap-3 md:gap-6">
      <GreenButton 
        class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" 
        text="Historia Clínica" 
        @click="navigateTo('crear-documento', { 
        idEmpresa: empresas.currentEmpresaId, 
        idTrabajador: trabajadores.currentTrabajadorId, 
        tipoDocumento: 'Historia Clínica' 
      })"
      />
      <GreenButton 
        class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" 
        text="Exploración Física"
        @click="navigateTo('crear-documento', { 
        idEmpresa: empresas.currentEmpresaId, 
        idTrabajador: trabajadores.currentTrabajadorId, 
        tipoDocumento: 'Exploración Física' 
      })"
      />
      <GreenButton 
        class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" 
        text="Examen Vista" 
        @click="navigateTo('crear-documento', { 
        idEmpresa: empresas.currentEmpresaId, 
        idTrabajador: trabajadores.currentTrabajadorId, 
        tipoDocumento: 'Examen Vista' 
      })"
      />
      <GreenButton 
        class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" 
        text="Antidoping" 
        @click="navigateTo('crear-documento', { 
        idEmpresa: empresas.currentEmpresaId, 
        idTrabajador: trabajadores.currentTrabajadorId, 
        tipoDocumento: 'Antidoping' 
      })"
      />
      <GreenButton 
        class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" 
        text="Aptitud" 
        @click="navigateTo('crear-documento', { 
        idEmpresa: empresas.currentEmpresaId, 
        idTrabajador: trabajadores.currentTrabajadorId, 
        tipoDocumento: 'Aptitud' 
      })"
      />
      <GreenButton 
        class="text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl" 
        text="Certificado" 
        @click="navigateTo('crear-documento', { 
        idEmpresa: empresas.currentEmpresaId, 
        idTrabajador: trabajadores.currentTrabajadorId, 
        tipoDocumento: 'Certificado' 
      })"
      />
      <div class="w-full flex justify-center">
        <SliderButton class="align-self-center" text="Documento Externo" />
      </div>

    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="trabajadores.currentTrabajador" class="w-full text-center flex flex-col items-center gap-2 mt-4 p-4 border border-gray-200 rounded-lg shadow-md bg-gray-50">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
          {{ trabajadores.currentTrabajador?.nombre }}
        </h1>
        <h2 class="text-sm sm:text-base md:text-lg text-gray-500 italic">
          {{ calcularEdad(trabajadores.currentTrabajador?.fechaNacimiento) }} años - {{ trabajadores.currentTrabajador?.puesto }}
        </h2>
      </div>
    </Transition>

    <Transition appear mode="out-in" name="slide-up">
      <div v-if="documentos.loading">
        <h1 class="text-3xl sm:text-4xl md:text-6xl py-20 text-center font-semibold text-gray-700">Cargando...</h1>
      </div>
      <div v-else>
        <div v-if="documentos.documentsByYear && Object.keys(documentos.documentsByYear).length"
          class="grid grid-cols-1 gap-6"> <!-- xl:grid-cols-2 -->
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

