<script setup>
import { computed, ref } from 'vue';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const props = defineProps({
  id: String,
  nombre: String,
  RFC: String,
  correoElectronico: String,
  maxHistoriasPermitidasAlMes: Number,
  estadoSuscripcion: String,
  periodoDePruebaFinalizado: Boolean,
  fechaInicioTrial: String,
  colorInforme: String,
  semaforizacionActivada: Boolean,
  logotipoEmpresa: Object,
  suscripcion: Object,
  historiasClinicasMes: Number,
  notasMedicasMes: Number,
});

const historiasDelMes = ref(0);
const detallesAbiertos = ref(false);

const baseURL = import.meta.env.VITE_API_URL || 'https://ramazzini.app';
// console.log('baseURL:', baseURL);

const logoSrc = computed(() => {
  return `${baseURL}/assets/providers-logos/${props.logotipoEmpresa?.data}?t=${Date.now()}`;
});

const colorOptions = [
  { name: "Gris Oscuro (Default)", hex: "#343A40" },
  { name: "Gris", hex: "#6C757D" },
  // { name: "Gris Claro", hex: "#F8F9FA" },
  { name: "Azul Oscuro", hex: "#004085" },
  { name: "Azul Profesional", hex: "#007BFF" },
  { name: "Turquesa Oscuro", hex: "#138496" },
  { name: "Turquesa", hex: "#17A2B8" },
  { name: "Azul Claro", hex: "#2BB9D9" },
  { name: "Verde Oscuro", hex: "#1E7E34" },
  { name: "Verde Médico", hex: "#28A745" },
  { name: "Rojo Oscuro", hex: "#C82333" },
  { name: "Rojo Médico", hex: "#DC3545" },
  { name: "Naranja", hex: "#E67E22" },
  { name: "Oro", hex: "#E0A800" },
];

const nombreColorInforme = computed(() => {
  const color = colorOptions.find(option => option.hex.toLowerCase() === props.colorInforme?.toLowerCase());
  return color ? color.name : 'No disponible';
});

const mesActual = computed(() => {
  const mes = format(new Date(), 'MMMM', { locale: es });
  return mes.charAt(0).toUpperCase() + mes.slice(1);
});

const formatDate = (dateString) =>
  dateString
    ? format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
    : 'No disponible';

const periodoGratuito = computed(() => {
  if (!props.fechaInicioTrial) return 'No disponible';

  const fechaInicio = parseISO(props.fechaInicioTrial);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + 15);
  fechaFin.setHours(23, 59, 59);

  const hoy = new Date();
  const diasRestantes = differenceInDays(fechaFin, hoy);

  return diasRestantes > 0
    ? `Hasta el ${formatDate(fechaFin)} (${diasRestantes} días restantes)`
    : `Finalizado el ${formatDate(fechaFin)}`;
});

const clasesEstado = computed(() => ({
  'text-green-600 bg-green-100 px-2 py-0.5 rounded-full': props.estadoSuscripcion === 'authorized',
  'text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full': props.estadoSuscripcion === 'pending',
  'text-red-600 bg-red-100 px-2 py-0.5 rounded-full': props.estadoSuscripcion === 'cancelled',
  'text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full': !props.estadoSuscripcion,
}));

const formatCurrency = (amount) => {
  return amount.toLocaleString("en-US");
};
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-4 w-full max-w-3xl mx-auto bg-white border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out h-102">
        <div class="col-span-3">
            <p class="text-gray-600"><strong>👤 Nombre:</strong> {{ nombre || 'No disponible' }}</p>
            <!-- <p class="text-gray-600"><strong>🆔 RFC:</strong> {{ RFC || 'No disponible' }}</p> -->
            <!-- <p class="text-gray-600"><strong>📧 Correo:</strong> {{ correoElectronico || 'No disponible' }}</p> -->
            <p class="text-gray-600"><strong>🎨 Color Informe:</strong> {{ nombreColorInforme }}</p>
            <p class="text-gray-600"><strong>🚦 Semaforización:</strong> {{ semaforizacionActivada ? 'Activada' : 'Desactivada' }}</p>
            <p class="text-gray-600">
                <strong>👥 H. Clínicas Usadas en {{ mesActual }}:</strong>
                {{ `${historiasClinicasMes} de ${maxHistoriasPermitidasAlMes} permitidas` }}
            </p>
            <p class="text-gray-600"><strong>📝 Notas Médicas Usadas en {{ mesActual }}:</strong> {{ `${notasMedicasMes} ${notasMedicasMes === 1 ? 'nota' : 'notas'}` }}</p>
            <p class="text-gray-600"><strong>⏳ Periodo Gratuito:</strong> {{ periodoGratuito }}</p>
            <p class="text-gray-600">
                <strong>📍 Estado: </strong>
                <span :class="clasesEstado">
                    {{ estadoSuscripcion || 'Sin suscripción actual' }}
                </span>
            </p>
            <div v-if="suscripcion" class="mt-4">
                <button
                    @click="detallesAbiertos = !detallesAbiertos"
                    class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200 focus:outline-none"
                >
                    <span class="text-lg font-semibold text-gray-700">
                    📅 Detalles de Suscripción
                    </span>
                    <svg
                    :class="{ 'rotate-180': detallesAbiertos }"
                    class="w-4 h-4 transform transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 9l-7 7-7-7"
                    />
                    </svg>
                </button>

                <Transition name="fade" mode="out-in">
                    <div v-show="detallesAbiertos" class="mt-2">
                        <p class="text-gray-600"><strong>📦 {{ suscripcion.reason || 'No disponible' }}</strong></p>
                        <p class="text-gray-600"><strong>💰 Monto mensual:</strong> $ {{ formatCurrency(suscripcion.auto_recurring?.transaction_amount) }} MXN</p>
                        <p class="text-gray-600"><strong>💳 Método de pago:</strong> {{ suscripcion.payment_method_id }}</p>
                        <p class="text-gray-600"><strong>📆 Inició:</strong> {{ formatDate(suscripcion.date_created) }}</p>
                        <p class="text-gray-600"><strong>🔄 Próximo cobro:</strong> {{ formatDate(suscripcion.next_payment_date) }}</p>
                        <p class="text-gray-600"><strong>🕓 Última actualización:</strong> {{ formatDate(suscripcion.last_modified) }}</p>
                        <!-- <p class="text-gray-600"><strong>📍 Estado:</strong> {{ suscripcion.status || 'No disponible' }}</p> -->
                        <p class="text-gray-600"><strong>👤 Email del pagador:</strong> {{ suscripcion.payer_email || 'No disponible' }}</p>
                    </div>
                </Transition>
            </div>
        </div>
        <div class="col-span-1">
            <div v-if="logotipoEmpresa?.data" class="w-full h-full flex justify-center items-center">
                    <img
                        :src="logoSrc"
                        :alt="'Logo de ' + nombre"
                        class="w-48 h-48 object-contain"
                    />
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
