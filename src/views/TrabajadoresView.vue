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

<template>  <div class="w-full p-5 space-y-5">
    <div class="flex flex-row gap-4 items-center">
      <button
        type="button"
        class="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
      >
        Nuevo Trabajador +
      </button>
      <button
        type="button"
        class="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
      >
        Carga Masiva
      </button>
      <button
        type="button"
        class="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
      >
        Exportar a Excel
      </button>
    </div>
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
    
  </div>


</template>