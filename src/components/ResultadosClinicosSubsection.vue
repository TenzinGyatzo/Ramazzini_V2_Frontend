<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-gray-800">Resultados clínicos ({{ results.length }})</p>
          <p class="text-xs text-gray-500">
            Resultados registrados que complementan el expediente. No representan documentos; son datos capturados.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      <div
        v-for="resultado in sortedResults"
        :key="resultado._id"
        class="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
      >
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                :style="{ backgroundColor: getIconBackground(resultado.tipoEstudio) }"
              >
                <i
                  :class="getTipoIcon(resultado.tipoEstudio)"
                  class="text-lg"
                  :style="{ color: getIconColor(resultado.tipoEstudio) }"
                ></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">
                  {{ store.getTipoLabel(resultado.tipoEstudio) }}
                </p>
                <div class="flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5 items-center">
                  <span>{{ formatDate(resultado.fechaEstudio) }}</span>
                </div>
              </div>
              <div class="text-xs lg:text-sm mt-0.5 items-center">
                <span
                  v-if="resultado.tipoEstudio !== 'TIPO_SANGRE' && resultado.resultadoGlobal === 'NORMAL'"
                  :class="['px-2 py-0.5 rounded-full font-semibold', getResultadoBadgeClasses(resultado.resultadoGlobal)]"
                >
                  {{ store.getResultadoLabel(resultado.resultadoGlobal) }}
                </span>
                <span
                  v-else-if="resultado.tipoEstudio === 'TIPO_SANGRE' && resultado.tipoSangre"
                  class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold"
                >
                  {{ getTipoSangreLabel(resultado.tipoSangre) }}
                </span>
                <span
                  v-if="resultado.resultadoGlobal === 'ANORMAL' && getAlteracionLabel(resultado)"
                  class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold"
                >
                  {{ store.getResultadoLabel(resultado.resultadoGlobal) }}
                </span>
              </div>
            </div>
              <div class="flex items-center justify-between gap-2">
              <button
                type="button"
                @click="toggleDetails(resultado._id)"
                class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1"
              >
                <i
                  class="fas fa-chevron-down transition-transform"
                  :class="isExpanded(resultado._id) ? 'rotate-180' : ''"
                ></i>
              </button>
              <button
                type="button"
                @click.stop="emitEdit(resultado)"
                class="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Editar resultado"
              >
                <i class="fas fa-edit text-lg"></i>
              </button>
              <button
                type="button"
                @click.stop="openDeleteModal(resultado)"
                class="text-red-500 hover:text-red-600 transition-colors"
                aria-label="Eliminar resultado"
              >
                <i class="fas fa-trash-alt text-base"></i>
              </button>
            </div>
          </div>

          <transition name="fade">
            <div
              v-if="isExpanded(resultado._id)"
              class="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600 space-y-1"
            >
              <p v-if="getAlteracionLabel(resultado)">
                <span class="font-semibold text-gray-800">Tipo de Alteración:</span> {{ getAlteracionLabel(resultado) }}
              </p>
              <p v-if="resultado.hallazgoEspecifico">
                <span class="font-semibold text-gray-800">Hallazgo Específico:</span> {{ resultado.hallazgoEspecifico }}
              </p>
              <p v-if="resultado.relevanciaClinica">
                <span class="font-semibold text-gray-800">Relevancia Clínica:</span> {{ getRelevanciaLabel(resultado.relevanciaClinica) }}
              </p>
              <p v-if="resultado.recomendacion">
                <span class="font-semibold text-gray-800">Recomendación:</span> {{ resultado.recomendacion }}
              </p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
  <ConfirmacionEliminar
    :is-open="isDeleteModalOpen"
    title="Eliminar resultado clínico"
    :message="deleteMessage"
    :fecha="modalFecha"
    :resultado="modalResultado"
    :tipo-sangre="modalTipoSangre"
    :tipo-estudio-label="modalTipoEstudio"
    @close="closeDeleteModal"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';
import {
  useResultadosClinicosStore,
  type ResultadoClinico,
} from '@/stores/resultadosClinicos';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import ConfirmacionEliminar from '@/components/ConfirmacionEliminar.vue';

const toast: any = inject('toast');

const props = defineProps<{
  results: ResultadoClinico[];
}>();

const emit = defineEmits<{
  (e: 'edit', resultado: ResultadoClinico): void;
}>();

const store = useResultadosClinicosStore();
const trabajadores = useTrabajadoresStore();
const expandedId = ref<string | null>(null);
const isDeleteModalOpen = ref(false);
const resultadoParaEliminar = ref<ResultadoClinico | null>(null);

const sortedResults = computed(() =>
  [...props.results].sort((a, b) => {
    const timeA = new Date(a.fechaEstudio).getTime();
    const timeB = new Date(b.fechaEstudio).getTime();
    return timeB - timeA;
  })
);

const formatDate = (date: string | Date) => {
  if (!date) return '';
  const raw = date instanceof Date ? date.toISOString() : date;
  return convertirFechaISOaDDMMYYYY(raw);
};

const toggleDetails = (id: string | undefined) => {
  if (!id) return;
  expandedId.value = expandedId.value === id ? null : id;
};

const isExpanded = (id: string | undefined) => {
  if (!id) return false;
  return expandedId.value === id;
};

const emitEdit = (resultado: ResultadoClinico) => {
  emit('edit', resultado);
};

const openDeleteModal = (resultado: ResultadoClinico) => {
  resultadoParaEliminar.value = resultado;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  resultadoParaEliminar.value = null;
};

const confirmDelete = async () => {
  if (!resultadoParaEliminar.value?._id) return;
  try {
    await store.deleteResultado(resultadoParaEliminar.value._id);
    if (trabajadores.currentTrabajadorId) {
      await store.fetchResultadosAgrupados(trabajadores.currentTrabajadorId);
    }
    toast.open({
      message: 'Resultado eliminado correctamente',
      type: 'success',
    });
  } catch (error) {
    toast.open({
      message: 'Error al eliminar el resultado',
      type: 'error',
    });
  } finally {
    closeDeleteModal();
  }
};

const getTipoIcon = (tipo?: string) => {
  if (tipo === 'ESPIROMETRIA') return 'fas fa-lungs';
  if (tipo === 'EKG') return 'fas fa-heartbeat';
  if (tipo === 'TIPO_SANGRE') return 'fas fa-tint';
  return 'fas fa-notes-medical';
};

const getIconColor = (tipo?: string) => {
  if (tipo === 'ESPIROMETRIA') return '#1d4ed8';
  if (tipo === 'EKG') return '#dc2626';
  if (tipo === 'TIPO_SANGRE') return '#991b1b';
  return '#475569';
};

const getIconBackground = (tipo?: string) => {
  if (tipo === 'ESPIROMETRIA') return 'rgba(30,64,175,0.12)';
  if (tipo === 'EKG') return 'rgba(220,38,38,0.12)';
  if (tipo === 'TIPO_SANGRE') return 'rgba(153,27,27,0.12)';
  return 'rgba(71,85,105,0.08)';
};

const getAlteracionLabel = (resultado: ResultadoClinico) => {
  if (resultado.tipoEstudio === 'ESPIROMETRIA' && resultado.tipoAlteracion) {
    const option = store.tipoAlteracionEspirometriaOptions.find(
      (opt) => opt.value === resultado.tipoAlteracion
    );
    return option?.label || resultado.tipoAlteracion;
  }

  if (resultado.tipoEstudio === 'EKG' && resultado.tipoAlteracionPrincipal) {
    const option = store.tipoAlteracionEKGOptions.find(
      (opt) => opt.value === resultado.tipoAlteracionPrincipal
    );
    return option?.label || resultado.tipoAlteracionPrincipal;
  }

  return '';
};

const getTipoSangreLabel = (tipo?: string) => {
  const option = store.tipoSangreOptions.find((opt) => opt.value === tipo);
  return option?.label || tipo || '';
};

const getRelevanciaLabel = (relevancia?: string) => {
  const option = store.relevanciaClinicaOptions.find(
    (opt) => opt.value === relevancia
  );
  return option?.label || relevancia || '';
};

const getResultadoBadgeClasses = (resultado?: string) => {
  if (resultado === 'NORMAL') return 'bg-emerald-100 text-emerald-700';
  if (resultado === 'ANORMAL') return 'bg-red-100 text-red-700';
  if (resultado === 'NO_CONCLUYENTE') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-600';
};

const getResultadoLabel = (resultado?: string) => {
  const option = store.resultadoGlobalOptions.find(opt => opt.value === resultado);
  return option?.label || resultado || '';
};

const getTipoLabel = (tipo?: string) => {
  const option = store.tipoEstudioOptions.find(opt => opt.value === tipo);
  return option?.label || tipo || '';
};

const deleteMessage = computed(() => {
  return '¿Deseas eliminar el resultado de ';
});

const modalFecha = computed(() => {
  if (!resultadoParaEliminar.value?.fechaEstudio) return '';
  return formatDate(resultadoParaEliminar.value.fechaEstudio);
});

const modalResultado = computed(() => {
  if (!resultadoParaEliminar.value?.resultadoGlobal) return '';
  return getResultadoLabel(resultadoParaEliminar.value.resultadoGlobal);
});

const modalTipoSangre = computed(() => {
  if (resultadoParaEliminar.value?.tipoSangre) {
    return getTipoSangreLabel(resultadoParaEliminar.value.tipoSangre);
  }
  return '';
});

const modalTipoEstudio = computed(() => {
  if (!resultadoParaEliminar.value?.tipoEstudio) return '';
  return getTipoLabel(resultadoParaEliminar.value.tipoEstudio);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
