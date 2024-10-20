<script setup lang="ts">
import { onMounted, ref } from 'vue';
import EmpresaItem from '@/components/EmpresaItem.vue';
import { useEmpresasStore } from '@/stores/empresas';
import GreenButton from '@/components/GreenButton.vue';
import EmpresasModal from '@/components/EmpresasModal.vue';

const showModal = ref(false);

const toggleModal = () => {
    showModal.value = !showModal.value;
};

const empresas = useEmpresasStore();

onMounted(() => {
  empresas.fetchEmpresas();
})
</script>

<template>
  <Transition appear name="fade">
    <EmpresasModal v-if="showModal" @closeModal="toggleModal" />
  </Transition>
  <div class="p-5 grid gap-5">
    <div class="flex flex-col items-center">
      <GreenButton 
        text="Nueva Empresa +" 
        @click="toggleModal" 
      />
    </div>
    <Transition appear mode="out-in" name="slide-up">
      <div v-if="empresas.loading"><h1 class="text-3xl sm:text-4xl md:text-5xl py-20 text-center font-semibold text-gray-700">Cargando...</h1></div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <EmpresaItem 
          v-for="empresa in empresas.empresas" 
          :key="empresa._id"
          :empresa="empresa"
        />
      </div>
    </Transition>
  </div>
</template>
