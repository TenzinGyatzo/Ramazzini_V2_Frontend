<script setup>
import { useFormDataStore } from '@/stores/formDataStore';
const formData = useFormDataStore();
</script>

<template>
    <div
        class="border-shadow w-full col-span-1 2xl:col-span-9 text-left rounded-lg p-5 2xl:p-7 transition-all duration-300 ease-in-out transform shadow-md bg-white"
    >
      Aqui se visualiza el contenido del documento
      <pre>{{ formData.formData }}</pre>
    </div>
</template>