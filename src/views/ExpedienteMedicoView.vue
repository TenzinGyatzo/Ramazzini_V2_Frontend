<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTrabajadoresStore } from '@/stores/trabajadores';

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
  <div>
    <h1>Expediente Médico de {{ trabajadores.currentTrabajador?.nombre }}</h1>
    <h1>Historia Clinica</h1>
    <h1>Exploracion Fisica</h1>
    <h1>Antidoping</h1>
    <h1>Examen de la Vista</h1>
    <h1>Aptitud al Puesto</h1>
  </div>
</template>