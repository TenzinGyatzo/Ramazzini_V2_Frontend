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
      // Aquí se debe hacer el fetch de los informes médicos del trabajador

      empresas.currentEmpresaId = String(idEmpresa); // Seteamos el id de la empresa actual en el store
      centrosTrabajo.currentCentroTrabajoId = String(idCentroTrabajo); // Seteamos el id del centro de trabajo actual en el store
      trabajadores.currentTrabajadorId = String(idTrabajador); // Seteamos el id del trabajador actual en el store
    }
  },
  { immediate: true } // Esto asegura que el watch se ejecute inmediatamente con el valor actual
);

onMounted(() => {
  const trabajadorId = String(route.params.idTrabajador);
  documentos.fetchAntidopings(trabajadorId);
  documentos.fetchAptitudes(trabajadorId);
  documentos.fetchCertificados(trabajadorId);
  documentos.fetchDocumentosExternos(trabajadorId);
  documentos.fetchExamenesVista(trabajadorId);
  documentos.fetchExploracionesFisicas(trabajadorId);
  documentos.fetchHistoriasClinicas(trabajadorId);
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

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <GrupoDocumentos 
          :antidopings="documentos.antidopings"
          :aptitudes="documentos.aptitudes"
          :certificados="documentos.certificados"
          :documentosExternos="documentos.documentosExternos"
          :examenesVista="documentos.examenesVista"
          :exploracionesFisicas="documentos.exploracionesFisicas"
          :historiasClinicas="documentos.historiasClinicas"
      />
    </div>

  </div>
</template>