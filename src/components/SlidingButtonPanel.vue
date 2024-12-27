<script setup>
import { ref } from "vue";

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

const handleClick = () => {
  // Ordenar las rutas seleccionadas
  const orderedRoutes = props.selectedRoutes.sort((a, b) => {
    const aType = getDocumentType(a);
    const bType = getDocumentType(b);

    return (
      (documentOrder[aType] || Infinity) - (documentOrder[bType] || Infinity)
    );
  });

  console.log("Rutas ordenadas: ", orderedRoutes);

  // Aquí puedes enviar orderedRoutes al backend
  // Por ejemplo:
  // sendRoutesToBackend(orderedRoutes);
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
        <span class="text-lg sm:text-lg md:text-base"
          >Combinar y descargar</span
        >
      </span>
    </button>
  </div>
</template>
