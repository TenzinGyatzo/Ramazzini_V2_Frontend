<script setup lang="ts">
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  fecha: {
    type: String,
    default: '',
  },
  resultado: {
    type: String,
    default: '',
  },
  tipoSangre: {
    type: String,
    default: '',
  },
  tipoEstudioLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close', 'confirm']);

const handleClose = () => {
  emit('close');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[70]">
      <div class="fixed inset-0 bg-gray-900/60 z-0" @click="handleClose" />
      <div class="flex min-h-full items-center justify-center p-4 z-10">
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl relative" @click.stop>
          <div class="px-6 py-5">
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <div class="mt-2 text-sm text-gray-600 space-y-1">
              <p class="text-gray-700">
                <span>{{ message }}</span>
                <strong
                  v-if="tipoEstudioLabel"
                  class="font-semibold text-gray-800"
                >{{ tipoEstudioLabel }}</strong>
                <span v-if="tipoEstudioLabel">?</span>
                <span> Esta acción no se puede deshacer.</span>
              </p>
              <div v-if="fecha" class="flex items-center gap-2 text-gray-700">
                <span class="font-semibold">Fecha:</span>
                <span>{{ fecha }}</span>
              </div>
              <div v-if="resultado" class="flex items-center gap-2 text-gray-700">
                <span class="font-semibold">Resultado:</span>
                <span>{{ resultado }}</span>
              </div>
              <div v-if="tipoSangre" class="flex items-center gap-2 text-gray-700">
                <span class="font-semibold">Tipo de sangre:</span>
                <span>{{ tipoSangre }}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row-reverse">
            <button
              type="button"
              class="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 sm:w-auto"
              @click="handleConfirm"
            >
              Eliminar
            </button>
            <button
              type="button"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:w-auto"
              @click="handleClose"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
