<script lang="ts" setup>
import axios from 'axios';
import { inject } from 'vue';

const toast: any = inject('toast');

const props = defineProps<{
    tipo: string
    empresaId: string
    trabajadorId: string
    documentoId: string
    userId: string
    onClose: () => void;
    onAbrirPdf: () => void;
}>();

const regenerar = async () => {
  try {
    const apiEndpoint = `${import.meta.env.VITE_API_URL}/informes/${props.tipo}/${props.empresaId}/${props.trabajadorId}/${props.documentoId}/${props.userId}`;
    const response = await axios.get(apiEndpoint);
    console.log('PDF regenerado:', response.data);

    props.onClose(); // cerrar el modal inmediatamente

    toast.open({ message: "El PDF ha sido regenerado correctamente." });

    // espera 1.2 segundos para abrir el PDF ya generado
    setTimeout(() => {
      props.onAbrirPdf();
    }, 1200);
  } catch (error) {
    console.error('Error al regenerar el PDF:', error);
    toast.open({ message: 'No se pudo regenerar el PDF.' });
  }
};

</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="props.onClose">
    <div class="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">
        PDF eliminado automáticamente
      </h2>
      <p class="text-gray-700 mb-6">
        Este PDF ha sido eliminado automáticamente después de 14 meses. Puedes regenerarlo haciendo clic en el botón de abajo.
      </p>
      <div class="flex justify-end gap-3">
        <button
          class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition-all text-sm lg:text-base font-medium w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          @click="props.onClose"
        >
          Cerrar
        </button>
        <button
          class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1 transition-all text-sm lg:text-base font-semibold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          @click="regenerar"
        >
          Generar PDF
        </button>
      </div>
    </div>
  </div>
</template>
