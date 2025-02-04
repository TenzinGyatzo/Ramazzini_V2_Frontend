<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import UserItem from '@/components/UserItem.vue';

const userStore = useUserStore();
const usuarios = ref([]);

const user = ref(
  JSON.parse(localStorage.getItem('user')) || null // Recuperar usuario guardado o establecer null si no existe
);

onMounted(async () => {
  const resultado = await userStore.fetchUsersByProveedorId(user.value.idProveedorSalud);
  usuarios.value = resultado.data;
});

</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <UserItem v-for="usuario in usuarios" :key="usuario.id" :username="usuario.username" :email="usuario.email" :phone="usuario.phone" :role="usuario.role" 
    />
  </div>
</template>