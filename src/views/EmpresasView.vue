<script setup lang="ts">
import { onUnmounted, ref, watch, inject, computed } from 'vue';
import EmpresaItem from '@/components/EmpresaItem.vue';
import { useEmpresasStore } from '@/stores/empresas';
import GreenButton from '@/components/GreenButton.vue';
import ModalEmpresas from '@/components/ModalEmpresas.vue';
import ModalEliminar from '@/components/ModalEliminar.vue';
import ModalSuscripcion from '@/components/suscripciones/ModalSuscripcion.vue';
import type { Empresa } from '@/interfaces/empresa.interface';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useRouter } from 'vue-router';

const toast: any = inject('toast');

const empresas = useEmpresasStore();
const proveedorSalud = useProveedorSaludStore();
const router = useRouter();

const showModal = ref(false);
const showDeleteModal = ref(false);
const selectedEmpresaId = ref<string | null>(null);
const selectedEmpresaNombre = ref<string | null>(null);
const showSubscriptionModal = ref(false);

const busqueda = ref('');

const empresasFiltradas = computed(() => {
  const termino = busqueda.value.toLowerCase().trim();
  if (!termino) return empresas.empresas;

  return empresas.empresas.filter(empresa =>
    empresa.nombreComercial?.toLowerCase().includes(termino) ||
    empresa.razonSocial?.toLowerCase().includes(termino) ||
    empresa.RFC?.toLowerCase().includes(termino)
  );
});


const openModal = async (empresa: Empresa | null = null) => {
  showModal.value = false;  // Cerramos el modal antes de cargar
  empresas.loadingModal = true;  // Iniciamos la carga del modal

  if (empresa) {
    try {
      await empresas.fetchEmpresaById(empresa._id);  // Esperamos a que se cargue la empresa
    } catch (error) {
      console.error('Error al cargar la empresa:', error);
    }
  } else {
    empresas.resetCurrentEmpresa();  // Resetear si es una nueva empresa
  }

  empresas.loadingModal = false;  // Terminamos la carga del modal
  showModal.value = true;  // Abrimos el modal
};

const closeModal = () => {
  showModal.value = false;
};

const toggleDeleteModal = (idEmpresa: string | null = null, nombreComercial: string | null = null) => {
  showDeleteModal.value = !showDeleteModal.value;
  selectedEmpresaId.value = idEmpresa;
  selectedEmpresaNombre.value = nombreComercial;
};

const deleteEmpresaById = async (id: string) => {
  try {
    // Esperamos a que la empresa sea eliminada
    await empresas.deleteEmpresaById(id);

    toast.open({ message: 'Empresa eliminada con éxito' });

    // Una vez eliminada, volvemos a hacer fetch para actualizar la lista
    await empresas.fetchEmpresas(proveedorSalud.proveedorSalud!._id);

    empresas.resetCurrentEmpresa();
    
  } catch (error) {
    console.log('Error al eliminar la empresa:', error);
    toast.open({ message: 'Error al eliminar la empresa. Algunos documentos no se pudieron eliminar. Elimínalos directamente y vuelve a intentarlo', type: 'error' });
  }
};

watch(
    () => proveedorSalud.proveedorSalud,
    (nuevoProveedorSalud) => {
        if (nuevoProveedorSalud) {
          empresas.fetchEmpresas(proveedorSalud.proveedorSalud!._id);
        }
    },
    { immediate: true } // Ejecutar inmediatamente al montar el componente
);

onUnmounted( async () => {
  if (proveedorSalud.proveedorSalud) {
    await proveedorSalud.verificarPeriodoDePrueba(proveedorSalud.proveedorSalud!._id);    
    await proveedorSalud.loadProveedorSalud(proveedorSalud.proveedorSalud!._id);
    if(proveedorSalud.proveedorSalud.estadoSuscripcion === 'cancelled') {
      await proveedorSalud.verificarFinSuscripcion(proveedorSalud.proveedorSalud!._id);  
    }
  }
});

const proveedor = ref(
    JSON.parse(localStorage.getItem('proveedorSalud') || 'null') // Recuperar usuario guardado o establecer null si no existe
);

const periodoDePruebaFinalizado = proveedor.value?.periodoDePruebaFinalizado; // true or false
const estadoSuscripcion = proveedor.value?.estadoSuscripcion; // authorized, inactive, cancelled
const finDeSuscripcion = proveedor.value?.finDeSuscripcion
  ? new Date(proveedor.value.finDeSuscripcion)
  : null;

if (periodoDePruebaFinalizado && estadoSuscripcion === 'cancelled' && finDeSuscripcion && new Date(finDeSuscripcion) > new Date()) {
  toast.open({
    message: `Aún tienes acceso hasta el ${finDeSuscripcion.toLocaleDateString()}.`,
    type: 'success',
    onClick: () => router.push({ name: 'subscription' }),
  });
  toast.open({
    message: `Haz clic aquí para renovar tu suscripción.`,
    type: 'info',
    onClick: () => router.push({ name: 'subscription' }),
  });
}
</script>

<template>
  <Transition appear name="fade">
    <ModalEmpresas v-if="showModal" @closeModal="closeModal" @openSubscriptionModal="showSubscriptionModal = true"/>
  </Transition>

  <Transition appear name="fade">
    <ModalSuscripcion v-if="showSubscriptionModal" 
      @closeModal="showSubscriptionModal = false"/>
  </Transition>

  <Transition appear name="fade">
    <ModalEliminar v-if="showDeleteModal && selectedEmpresaId && selectedEmpresaNombre" :idRegistro="selectedEmpresaId"
      :identificacion="selectedEmpresaNombre" tipoRegistro="Empresa" @closeModal="toggleDeleteModal"
      @confirmDelete="deleteEmpresaById" />
  </Transition>

  <div class="p-5 grid gap-5">
    <div class="w-full px-4 grid gap-4">
      <!-- Layout responsivo -->
      <div class="flex flex-col sm:flex-row md:items-center md:justify-between xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-center gap-0">
      
        <!-- Botón: centrado en sm, a la izquierda en md, centrado en xl -->
        <div class="flex justify-center md:justify-start xl:col-start-2">
          <GreenButton text="Nuevo Cliente +" @click="openModal(null)" />
        </div>

        <!-- Buscador -->
        <div class="relative mt-4 sm:mt-0 w-full sm:w-60 md:w-80 lg:w-96 xl:justify-self-end sm:ml-auto">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fa-solid fa-magnifying-glass text-gray-500 focus:text-emerald-500"></i>
          </span>
          <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar empresa..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 hover:shadow-md rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>
    </div>

    <!-- <Transition name="slide-up">
      <div v-if="empresasFiltradas.length === 0" 
          class="fixed bottom-4 right-4 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-lg p-3 flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105">
        <i class="fa-regular fa-lightbulb text-yellow-500 text-xl mr-1"></i>
        <div>
          <p class="text-sm font-medium">
            Aún no tienes clientes registrados <br>
            <a :href="guiaURL" target="_blank" rel="noopener noreferrer" class="underline text-blue-600">Sigue esta guía para registrar a tu primer cliente.</a>.
          </p>
        </div>
      </div>
    </Transition> -->

    <Transition appear mode="out-in" name="slide-up">
      <div>
        <!-- Si el array está vacío, mostramos el mensaje -->
        <div v-if="empresasFiltradas.length === 0">
          <h2 class="text-2xl sm:text-3xl md:text-4xl py-10 text-center font-semibold text-gray-700">Aún no hay empresas de clientes registradas</h2>
        </div>
        <!-- Si hay empresas, mostramos los items -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <EmpresaItem v-for="empresa in empresasFiltradas" :key="empresa._id" :empresa="empresa"
            @editarEmpresa="openModal" @eliminarEmpresa="toggleDeleteModal" />
        </div>
      </div>
    </Transition>
  </div>
</template>

