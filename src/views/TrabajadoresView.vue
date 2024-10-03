<script setup lang="ts">
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const trabajadores = useTrabajadoresStore();
const route = useRoute();

onMounted(() => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  trabajadores.fetchTrabajadores(empresaId, centroTrabajoId)
  });
</script>

<template>
    <div v-if="trabajadores.loading"><h1 class="text-3xl mt-15">Cargando...</h1></div>
    <div v-else class="row">

    </div>
</template>