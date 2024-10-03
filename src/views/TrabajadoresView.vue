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
    <div v-else>
      <table>
          <thead>
              <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Sexo</th>
                  <th>Acciones</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="trabajador in trabajadores.trabajadores" :key="trabajador._id">
                  <td>{{ trabajador._id }}</td>
                  <td>{{ trabajador.nombre }}</td>
                  <td>{{ trabajador.sexo }}</td>
                  <td>
                      <div class="btn-group">
                          <button class="btn btn-primary">Editar</button>
                          <button class="btn btn-danger">Eliminar</button>
                      </div>
                  </td>
              </tr>
          </tbody>
      </table>
    </div>

</template>