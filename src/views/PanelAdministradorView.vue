<script setup>
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import ProveedorItem from '@/components/ProveedorItem.vue';
import { usePagosStore } from '@/stores/pagosStore';

const userStore = useUserStore();
const router = useRouter();
const proveedorSaludStore = useProveedorSaludStore();
const pagosStore = usePagosStore();
const proveedores = ref([]);

const redirigirSiNoEsAdmin = () => {
  const adminEmail = 'edgarcoronel66@gmail.com';
  if (userStore.user?.email !== adminEmail) {
    router.push({ name: 'inicio' });
  }
};

const cargarProveedores = async () => {
  const listaProveedores = await proveedorSaludStore.getAllProveedores();
  const proveedoresConSuscripcion = await Promise.all(
    listaProveedores.map(async (p) => {
      if (p.suscripcionActiva) {
        const suscripcion = await pagosStore.getSubscriptionFromDB(p.suscripcionActiva);
        return { ...p, suscripcion };
      }
      return { ...p, suscripcion: null };
    })
  );
  proveedores.value = proveedoresConSuscripcion;
};

redirigirSiNoEsAdmin();

onMounted(cargarProveedores);


</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-2">
    <ProveedorItem
      v-for="proveedor in proveedores"
      :key="proveedor._id"
      v-bind="proveedor"
    />
  </div>
</template>
