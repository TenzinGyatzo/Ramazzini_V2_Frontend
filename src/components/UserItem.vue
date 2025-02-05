<script setup>

defineProps({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    }
});

defineEmits(['eliminarUsuario']);

</script>

<template>
    <div
        class="w-full sm:w-2/3 lg:w-1/2 xl:w-full p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col md:flex-row justify-between items-start md:items-center">
        <!-- Información del usuario -->
        <div class="w-full grid grid-cols-1 xl:grid-cols-4 gap-3 xl:gap-8">
            <div class="font-semibold text-gray-600"><span class="font-light">Nombre:</span><br> {{ username }}</div>
            <div class="font-semibold text-gray-600"><span class="font-light">Correo:</span><br> {{ email }}</div>
            <div class="font-semibold text-gray-600"><span class="font-light">Teléfono:</span><br> {{ phone }}</div>
            <div class="font-semibold text-gray-600"><span class="font-light">Usuario:</span><br> {{ role }}</div>
        </div>

        <!-- Botón de eliminar -->
        <div class="mt-4 md:mt-0 md:ml-4 w-full md:w-auto">
            <button v-if="role != 'Principal'" type="button"
                class="w-full md:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white uppercase rounded-lg transition duration-300 text-sm sm:text-base"
                @click="$emit('eliminarUsuario', email, username)"
                >
                Eliminar
            </button>
            <button v-else type="button"
                class="w-full md:w-auto px-4 py-2 bg-red-300 text-white uppercase rounded-lg transition duration-300 text-sm sm:text-base"
                disabled>
                Eliminar
            </button>
        </div>
    </div>
</template>