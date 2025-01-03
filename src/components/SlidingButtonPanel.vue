<script setup>
import { ref } from "vue";
import axios from "axios";
import { useTrabajadoresStore } from "@/stores/trabajadores";

const trabajadores = useTrabajadoresStore();

const today = new Date();

const documentOrder = {
  Aptitud: 1,
  "Historia Clinica": 2,
  "Exploracion Fisica": 3,
  "Examen Vista": 4,
  Antidoping: 5,
  Certificado: 6,
  "Documento Externo": 7,
};

const getDocumentType = (route) => {
  if (route.includes("Aptitud")) return "Aptitud";
  if (route.includes("Historia Clinica")) return "Historia Clinica";
  if (route.includes("Exploracion Fisica")) return "Exploracion Fisica";
  if (route.includes("Examen Vista")) return "Examen Vista";
  if (route.includes("Antidoping")) return "Antidoping";
  if (route.includes("Certificado")) return "Certificado";
  return "Documento Externo"; // Para cualquier otro caso
};

// Props
const props = defineProps({
  selectedRoutes: {
    type: Array,
    required: true,
  },
});

const isVisible = ref(true);

const handleClick = async () => {
  // Ordenar las rutas seleccionadas
  const orderedRoutes = props.selectedRoutes.sort((a, b) => {
    const aType = getDocumentType(a);
    const bType = getDocumentType(b);

    return (
      (documentOrder[aType] || Infinity) - (documentOrder[bType] || Infinity)
    );
  });

  // console.log("Rutas ordenadas: ", orderedRoutes);

  try {
    // Enviar las rutas ordenadas al backend
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/document-merger/merge`,
      { filePaths: orderedRoutes },
      { responseType: 'blob' } // Necesario para manejar la respuesta como un archivo
    );

    // Convertir la respuesta a Blob (archivo PDF)
    const blob = new Blob([response.data], { type: 'application/pdf' });

    // Crear un enlace de descarga para el archivo PDF
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trabajadores.currentTrabajador.nombre} ${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}.pdf`;
    document.body.appendChild(a);
    a.click();

    // Limpiar el enlace temporal
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // console.log('PDF descargado exitosamente');
  } catch (error) {
    console.error('Error al enviar las rutas al backend:', error);
    alert('Hubo un error al fusionar los documentos. Intente nuevamente.');
  }
};
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed -top-3 transform h-[13.5vh] md:h-[12vh] w-[64vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] xl:w-[30vw] 2xl:w-[20vw] bg-gradient-to-r from-green-500 via-emerald-600 to-emerald-500 flex justify-center items-center rounded-xl shadow-xl transition-transform duration-300 z-10"
  >
    <button
      @click="handleClick"
      class="px-6 py-3 sm:px-6 sm:py-3 md:px-6 md:py-3 bg-gradient-to-r from-white to-gray-100 font-bold text-gray-700 rounded-full shadow-md hover:from-gray-200 hover:to-gray-300 hover:text-gray-900 transition duration-300 ease-in-out"
    >
      <span class="flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 17l-4 4m0 0l-4-4m4 4V3"
          />
        </svg>
        <span class="text-sm sm:text-base md:text-lg lg:text-lg"
          >Combinar y descargar</span
        >
      </span>
    </button>
  </div>
</template>
