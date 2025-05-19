<script setup>
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import ProveedorItem from '@/components/ProveedorItem.vue';
import { usePagosStore } from '@/stores/pagosStore';
import { useEmpresasStore } from '@/stores/empresas';

const userStore = useUserStore();
const router = useRouter();
const proveedorSaludStore = useProveedorSaludStore();
const pagosStore = usePagosStore();
const empresasStore = useEmpresasStore();
const proveedores = ref([]);

const redirigirSiNoEsAdmin = () => {
  const adminEmail = 'edgarcoronel66@gmail.com';
  if (userStore.user?.email !== adminEmail) {
    router.push({ name: 'inicio' });
  }
};

const cargarProveedores = async () => {
  const listaProveedores = await proveedorSaludStore.getAllProveedores();

  // Crear un array de Promesas para cargar todos los proveedores en paralelo
  const proveedoresConInfo = await Promise.all(
    listaProveedores.map(async (p) => {
      // Hacer las consultas en paralelo
      const [suscripcion, historiasClinicasMes, notasMedicasMes, todasLasHistoriasClinicas, todasLasNotasMedicas, empresas, users] = await Promise.all([
        p.suscripcionActiva ? pagosStore.getSubscriptionFromDB(p.suscripcionActiva) : null,
        proveedorSaludStore.getHistoriasClinicasDelMesById(p._id),
        proveedorSaludStore.getNotasMedicasDelMesById(p._id),
        proveedorSaludStore.getCantidadHistoriasClinicasById(p._id),
        proveedorSaludStore.getCantidadNotasMedicasById(p._id),
        empresasStore.fetchEmpresas(p._id),
        userStore.fetchUsersByProveedorId(p._id),
      ]);

      return {
        ...p,
        suscripcion,
        historiasClinicasMes,
        notasMedicasMes,
        todasLasHistoriasClinicas,
        todasLasNotasMedicas,
        empresas,
        users,
      };
    })
  );

  proveedores.value = proveedoresConInfo;
};

redirigirSiNoEsAdmin();

onMounted(cargarProveedores);


</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
    <ProveedorItem
      v-for="proveedor in proveedores"
      :key="proveedor._id"
      v-bind="proveedor"
    />
  </div>
</template>
