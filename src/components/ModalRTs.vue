<script setup>
import { ref, inject } from 'vue';
import { useUserStore } from "@/stores/user";
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useRiesgoTrabajoStore } from '@/stores/riesgosTrabajo';
import { calcularAntiguedad } from '@/helpers/dates';
import ModalEliminar from './ModalEliminar.vue';

const toast = inject('toast');
const emit = defineEmits(['closeModal']);

const userStore = useUserStore();
const empresasStore = useEmpresasStore();
const centrosTrabajoStore = useCentrosTrabajoStore();
const trabajadoresStore = useTrabajadoresStore();
const riesgosTrabajoStore = useRiesgoTrabajoStore();

const modo = ref('listado');
const rtEnEdicion = ref(null); // será un objeto con los datos del RT si se edita
const userId = userStore.user._id;

const closeModal = () => {
  emit('closeModal');
};

const solicitarEliminacionGlobal = inject('solicitarEliminacion');
const toggleDeleteModal = (id, rt) => {
  solicitarEliminacionGlobal(
    'Riesgo de Trabajo',
    id,
    rt.naturalezaLesion || 'Sin descripción de lesión',
    eliminarRT
  );
};

// console.log('trabajadores.currentTrabajador', trabajadoresStore.currentTrabajador);

const handleSubmit = async () => {
  try {
    const trabajadorId = trabajadoresStore.currentTrabajador?._id;
    if (!trabajadorId) return;

    const payload = limpiarCamposOpcionales(rtEnEdicion.value);

    if (modo.value === 'editar') {
      await riesgosTrabajoStore.updateRiesgoTrabajo(
        trabajadorId,
        rtEnEdicion.value._id,
        payload
      );
      toast.open({ message: 'Riesgo de Trabajo actualizado', type: 'success' });
    } else if (modo.value === 'nuevo') {
      await riesgosTrabajoStore.createRiesgoTrabajo(
        trabajadorId,
        { ...payload, idTrabajador: trabajadorId }
      );
      toast.open({ message: 'Riesgo de Trabajo registrado', type: 'success' });
    }

    await trabajadoresStore.fetchTrabajadorById(empresasStore.currentEmpresaId, centrosTrabajoStore.currentCentroTrabajoId, trabajadorId);

    modo.value = 'listado';
    rtEnEdicion.value = null;
    // emit('closeModal');
  } catch (error) {
    console.error(error);
    toast.open({ message: 'Error al guardar el Riesgo de Trabajo.', type: 'error' });
  }
};

function limpiarCamposOpcionales(data) {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === '') {
      delete cleaned[key];
    }
  });
  return cleaned;
}

const nuevoRT = () => {
  const trabajadorId = trabajadoresStore.currentTrabajador?._id;
  rtEnEdicion.value = {
    _id: '',
    fechaRiesgo: new Date().toISOString().slice(0, 10),
    diasIncapacidad: 0,
    porcentajeIPP: 0,
    idTrabajador: trabajadorId,
    createdBy: userId,
    updatedBy: userId
  };
  modo.value = 'nuevo';
};

const editarRT = (rt) => {
  rtEnEdicion.value = {
    ...rt,
    fechaRiesgo: rt.fechaRiesgo ? new Date(rt.fechaRiesgo).toISOString().slice(0, 10) : '',
    fechaAlta: rt.fechaAlta ? new Date(rt.fechaAlta).toISOString().slice(0, 10) : ''
  };
  modo.value = 'editar';
};

const eliminarRT = async (id) => {
  try {
    const trabajadorId = trabajadoresStore.currentTrabajador?._id;
    if (!trabajadorId) return;

    await riesgosTrabajoStore.deleteRiesgoTrabajo(trabajadorId, id);
    toast.open({ message: 'Riesgo de Trabajo eliminado', type: 'success' });

    await trabajadoresStore.fetchTrabajadorById(empresasStore.currentEmpresaId, centrosTrabajoStore.currentCentroTrabajoId, trabajadorId);
  } catch (error) {
    console.error(error);
    toast.open({ message: 'Error al eliminar el Riesgo de Trabajo.', type: 'error' });
  }
};

</script>

<template>
  <div class="modal fixed top-0 left-0 z-40 p-8 h-screen w-full grid place-items-center">
    <!-- Fondo -->
    <div class="absolute top-0 left-0 w-full h-full bg-emerald-900 bg-opacity-50 backdrop-blur-sm" @click="closeModal"></div>

    <Transition name="fade">
      <div class="modal-inner relative bg-white w-full sm:w-4/5 md:w-3/5 xl:w-2/5 2xl:w-1/3 p-10 rounded-lg shadow-md shadow-slate-900 max-h-[90vh] overflow-y-auto text-gray-800">
        <!-- Botón cerrar -->
        <div class="absolute h-16 w-16 flex justify-center items-center top-0 right-0 text-5xl text-gray-400 hover:text-gray-500 cursor-pointer" @click="closeModal">
          &times;
        </div>

        <h1 class="text-2xl font-semibold mb-2">Riesgos de Trabajo</h1>
        <hr class="mb-4">
        <!-- Información del trabajador -->
        <div class="mb-3 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-600">Nombre del trabajador</p>
              <p class="text-lg font-semibold text-gray-800">{{ trabajadoresStore.currentTrabajador?.nombre }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Puesto</p>
              <p class="text-lg font-semibold text-gray-800">{{ trabajadoresStore.currentTrabajador?.puesto }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Empresa</p>
              <p class="text-lg font-semibold text-gray-800">{{ empresasStore.currentEmpresa?.nombreComercial }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Antigüedad</p>
              <p class="text-lg font-semibold text-gray-800">{{ calcularAntiguedad(trabajadoresStore.currentTrabajador?.fechaIngreso) }}</p>
            </div>
          </div>
        </div>

        <!-- Lista de RTs existentes -->
        <div v-if="modo === 'listado'" class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Historial de Riesgos de Trabajo</h2>

            <div v-if="!trabajadoresStore.currentTrabajador?.riesgosTrabajo?.length" 
               class="p-4 border rounded-lg shadow-sm text-center bg-gray-50">
            <p class="text-gray-600">No hay riesgos de trabajo registrados</p>
            </div>

            <div
            v-else
            v-for="rt in trabajadoresStore.currentTrabajador?.riesgosTrabajo"
            :key="rt._id"
            class="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-gray-50"
            >
            <div>
            <p class="font-semibold text-gray-700">
              {{ rt.naturalezaLesion || 'Sin descripción de lesión' }} — {{ new Date(rt.fechaRiesgo).toLocaleDateString() }}
            </p>

            <p v-if="rt.manejo || rt.tipoRiesgo" class="text-sm text-gray-500">
              <span v-if="rt.manejo">Manejo: {{ rt.manejo }}</span>
              <span v-if="rt.manejo && rt.tipoRiesgo"> - </span>
              <span v-if="rt.tipoRiesgo">Tipo: {{ rt.tipoRiesgo }}</span>
            </p>

            <p v-if="rt.alta || rt.diasIncapacidad" class="text-sm text-gray-500">
              <span v-if="rt.alta === 'Incapacidad Activa'">Incapacidad Activa</span>
              <span v-else-if="rt.alta === 'Alta Interna'">
              Alta: 
              <span v-if="rt.fechaAlta">{{ new Date(rt.fechaAlta).toLocaleDateString() }} </span>
              (Interna)
              </span>
              <span v-else-if="rt.alta === 'Alta ST2'">
              Alta: 
              <span v-if="rt.fechaAlta">{{ new Date(rt.fechaAlta).toLocaleDateString() }} </span>
              (ST2)
              </span>
              <span v-if="rt.alta && rt.diasIncapacidad !== undefined && rt.diasIncapacidad !== null"> - </span>
              <span>{{ rt.diasIncapacidad ?? 0 }} días de incapacidad</span>
            </p>
            </div>
            <div class="flex gap-2">
              <button @click="editarRT(rt)" class="text-blue-600 hover:underline text-sm">Editar</button>
              <button @click="toggleDeleteModal(rt._id, rt)" class="text-red-600 hover:underline text-sm">Eliminar</button>
            </div>
            </div>

          <button @click="nuevoRT"
            class="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg">
            Registrar nuevo Riesgo de Trabajo
          </button>

          <button @click="closeModal"
            class="mt-3 w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100">
            Cerrar
          </button>
        </div>

        <!-- Formulario para crear o editar RT -->
        <div v-if="modo === 'nuevo' || modo === 'editar'" class="space-y-4 mb-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">
            {{ modo === 'editar' ? 'Editar Riesgo de Trabajo' : 'Registrar nuevo Riesgo de Trabajo' }}
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600">Fecha del Riesgo</label>
              <input type="date" v-model="rtEnEdicion.fechaRiesgo" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Tipo de Riesgo</label>
              <select v-model="rtEnEdicion.tipoRiesgo" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option disabled value="">Selecciona un tipo</option>
                <option>Accidente de Trabajo</option>
                <option>Accidente de Trayecto</option>
                <option>Enfermedad de Trabajo</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Naturaleza de la lesión</label>
              <input type="text" v-model="rtEnEdicion.naturalezaLesion" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Parte del cuerpo afectada</label>
              <input type="text" v-model="rtEnEdicion.parteCuerpoAfectada" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Manejo</label>
              <select v-model="rtEnEdicion.manejo" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option disabled value="">Selecciona un manejo</option>
                <option>IMSS</option>
                <option>Interno</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">NSS</label>
              <input type="text" v-model="rtEnEdicion.NSS" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Estatus de Alta</label>
              <select v-model="rtEnEdicion.alta" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option disabled value="">Selecciona una opción</option>
                <option>Incapacidad Activa</option>
                <option>Alta ST2</option>
                <option>Alta Interna</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Fecha de Alta</label>
              <input type="date" v-model="rtEnEdicion.fechaAlta" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>

            <!-- Fila agrupada para días de incapacidad, secuelas y porcentaje IPP -->
            <div class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Días de Incapacidad -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Días de Incapacidad</label>
                <input type="number" min="0" v-model="rtEnEdicion.diasIncapacidad"
                  class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 
                        focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>

              <!-- Secuelas -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Secuelas</label>
                <select v-model="rtEnEdicion.secuelas" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option disabled value="">Selecciona una opción</option>
                  <option>No</option>
                  <option>Si</option>
                </select>
              </div>

              <!-- Porcentaje de IPP -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Porcentaje de IPP</label>
                <input type="number" min="0" max="100" v-model="rtEnEdicion.porcentajeIPP"
                  class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 
                        focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Notas u observaciones</label>
              <textarea v-model="rtEnEdicion.notas" rows="3" class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
            </div>

            <div class="hidden">
              <input type="hidden" v-model="rtEnEdicion.idTrabajador" />
              <input type="hidden" v-model="rtEnEdicion.createdBy" />
              <input type="hidden" v-model="rtEnEdicion.updatedBy" />
            </div>

          </div>

          <div class="flex justify-between mt-4 gap-4">
            <button @click="modo = 'listado'; rtEnEdicion = null"
              class="w-1/2 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100">
              Cancelar
            </button>

            <button @click="handleSubmit"
              class="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all">
              Guardar
            </button>
          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>
