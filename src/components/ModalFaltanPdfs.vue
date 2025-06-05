<script lang="ts" setup>
  const emit = defineEmits(['close']);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="emit('close')">
    <div class="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4 text-amber-600 flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation"></i>
        No se puede continuar
      </h2>
      <p class="text-gray-700 mb-6">
        Faltan uno o más documentos seleccionados. Por favor <strong>regenera los PDFs</strong> antes de continuar.
      </p>
      <button
        class="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-5 rounded-lg transition"
        @click="emit('close')"
      >
        Entendido
      </button>
    </div>
  </div>
</template>

