<script lang="ts" setup>
import axios from 'axios';
import { inject, ref } from 'vue';

const toast: any = inject('toast');

const props = defineProps<{
  tipo: string
  empresaId: string
  trabajadorId: string
  documentoId: string
  userId: string
  getPdfMetadata: () => { ruta: string; nombre: string };
}>();

const emit = defineEmits(['regenerado', 'close']);

const isLoading = ref(false);

const esperarQuePDFEsteDisponible = async (url: string, maxIntentos = 10, intervalo = 300) => {
  for (let intento = 0; intento < maxIntentos; intento++) {
    try {
      const response = await axios.head(url); // HEAD es más eficiente que GET
      if (response.status === 200 && response.headers['content-type'] === 'application/pdf') {
        return true; // ¡PDF listo!
      }
    } catch (e) {
      // No está listo aún
    }
    await new Promise(resolve => setTimeout(resolve, intervalo)); // Espera antes del siguiente intento
  }
  return false; // No se pudo obtener tras varios intentos
};

const regenerar = async () => {
  try {
    isLoading.value = true;

    const apiEndpoint = `${import.meta.env.VITE_API_URL}/informes/${props.tipo}/${props.empresaId}/${props.trabajadorId}/${props.documentoId}/${props.userId}`;
    await axios.get(apiEndpoint); // Generar PDF

    const { ruta, nombre } = props.getPdfMetadata();
    const rutaCompleta = `${ruta}/${nombre}`.replace(/\/+/g, '/');
    const urlCompleta = new URL(rutaCompleta, import.meta.env.VITE_API_URL).href;
    const disponible = await esperarQuePDFEsteDisponible(urlCompleta);
    if (!disponible) throw new Error("El PDF aún no está disponible.");

    toast.open({ message: "El PDF ha sido regenerado correctamente." });

    console.log('✔️ Emitiendo evento regenerado');
    emit('regenerado'); 

    isLoading.value = false;
  } catch (error) {
    console.error('Error al regenerar el PDF:', error);
    toast.open({ message: 'No se pudo regenerar el PDF.', type: 'error' });
    isLoading.value = false;
  }
};

</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="emit('close');">
    <div class="bg-white rounded-xl p-6 shadow-xl max-w-md w-full" @click.stop>
      <template v-if="!isLoading && props.tipo != 'documentoexterno'">
        <h2 class="text-xl font-semibold mb-4 text-emerald-700 flex items-center gap-2">
          <i class="fa-solid fa-circle-info"></i>
          Documento no disponible
        </h2>
        <p class="text-gray-700 mb-6">
          El documento fue <strong>eliminado automáticamente</strong> tras <strong>14 meses</strong> como parte de nuestro sistema de limpieza y optimización.   
          Si necesitas consultarlo nuevamente, puedes <strong>regenerarlo</strong> haciendo clic en el botón de abajo.
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition-all text-sm lg:text-base font-medium w-full sm:w-auto"
            @click="emit('close');"
          >
            Cerrar
          </button>
          <button
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1 transition-all text-sm lg:text-base font-medium w-full sm:w-auto"
            @click="regenerar"
          >
            Regenerar Documento
          </button>
        </div>
      </template>

      <template v-else-if="!isLoading && props.tipo == 'documentoexterno'">
        <h2 class="text-xl font-semibold mb-4 text-rose-600 flex items-center gap-2">
          <i class="fa-solid fa-circle-info"></i>
          Documento externo no disponible
        </h2>
        <p class="text-gray-700 mb-6">
          El documento no está disponible, <strong>debes eliminar este registro</strong> y subirlo de nuevo.
        </p>
        <div class="flex justify-end gap-3">
        <button
          class="w-full bg-rose-500 hover:bg-rose-400 text-white font-medium py-2.5 px-5 rounded-lg transition"
          @click="emit('close');"
        >
          Entendido
        </button>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col items-center justify-center space-y-4 py-10">
          <svg class="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p class="text-gray-700">Regenerando el PDF, por favor espera...</p>
        </div>
      </template>
    </div>
  </div>
</template>

