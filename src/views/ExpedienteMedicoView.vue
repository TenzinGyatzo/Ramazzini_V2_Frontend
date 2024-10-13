<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import GreenButton from '@/components/GreenButton.vue';

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
      <GreenButton text="Historia Clínica" />
      <GreenButton text="Exploración Fisica" />
      <GreenButton text="Examen Vista" />
      <GreenButton text="Antidoping" />
      <GreenButton text="Aptitud" />
      <GreenButton text="Certificado" />
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div class="w-full rounded-lg p-2 shadow-lg bg-gray-50 items-center grid grid-cols-1 gap-8">
        <h1>Expediente Médico de {{ trabajadores.currentTrabajador?.nombre }}</h1>
        <h1>Historia Clinica</h1>
        <h1>Exploracion Fisica</h1>
        <h1>Antidoping</h1>
        <h1>Examen de la Vista</h1>
        <h1>Aptitud al Puesto</h1>
      </div>
    </Transition>
  </div>
</template>