<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import GreenButton from '@/components/GreenButton.vue';

const route = useRoute();
const router = useRouter();
const trabajadores = useTrabajadoresStore();

onMounted(() => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  const trabajadorId = String(route.params.idTrabajador);

  // Setear el ID del trabajador actual en el store
  trabajadores.currentTrabajadorId = trabajadorId;
  trabajadores.fetchTrabajadorById(empresaId, centroTrabajoId, trabajadorId);
})
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
      <div class="w-full bg-white rounded-lg p-2 shadow-lg bg-gray-50 items-center grid grid-cols-1 gap-8">
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