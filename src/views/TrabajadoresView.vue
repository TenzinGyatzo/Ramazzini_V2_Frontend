<script setup lang="ts">
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const trabajadores = useTrabajadoresStore();
const centrosTrabajo = useCentrosTrabajoStore();
const route = useRoute();
const router = useRouter();

onMounted(() => {
  const empresaId = String(route.params.idEmpresa);
  const centroTrabajoId = String(route.params.idCentroTrabajo);
  trabajadores.fetchTrabajadores(empresaId, centroTrabajoId)

  // Setear el ID del centro de trabajo actual en el store
  centrosTrabajo.currentCentroTrabajoId = centroTrabajoId;
  centrosTrabajo.fetchCentroTrabajoById(empresaId, centroTrabajoId);
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
                  <th>Expediente</th>
                  <th>Acciones</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="trabajador in trabajadores.trabajadores" :key="trabajador._id">
                  <td>{{ trabajador._id }}</td>
                  <td>{{ trabajador.nombre }}</td>
                  <td>{{ trabajador.sexo }}</td>
                  <td>
                    <button 
                      type="button" 
                      class="bg-emerald-600 hover:bg-emerald-700 text-white uppercase rounded-lg px-2 py-1"
                      @click="router.push({ name: 'expediente-medico', params: { idEmpresa: trabajador._id, idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId, idTrabajador: trabajador._id } })"
                    >
                        Ver
                    </button>
                  </td>
                  <td>
                      <div>
                          <button>Editar</button>
                          <button>Eliminar</button>
                      </div>
                  </td>
              </tr>
          </tbody>
      </table>
    </div>

</template>