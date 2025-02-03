<script setup>
import { onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthAPI from '@/api/AuthAPI';

const route = useRoute();
const router = useRouter();
const { token } = route.params;

const toast = inject('toast');

onMounted(async () => {
  try {
    const { data } = await AuthAPI.verifyAccount(token);
    toast.open({
      message: data.msg,
      position: 'bottom-left'
    });
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 5000);
  } catch (error) {
    console.log(error);
    toast.open({
      message: error.response.data.msg,
      position: 'bottom-left',
      type: 'error'
    });

  }
});

</script>

<template>
  <div class="flex flex-col items-center justify-center p-6 w-full mx-auto">
    <div class="text-center mb-6">
      <h2 class="text-4xl font-semibold text-emerald-600 mb-4">Verificar Cuenta</h2>
    </div>
  </div>
</template>