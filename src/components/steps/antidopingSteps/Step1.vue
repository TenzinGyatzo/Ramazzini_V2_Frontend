<script setup>
import { ref } from 'vue';

const fechaAntidoping = ref(null);
</script>

<template>
    <div>
        <h1 class="font-bold mb-4 text-gray-800 leading-5">Fecha de realización de la prueba</h1>

        <h1 class="font-medium mb-1 text-gray-800 leading-5">Fecha:</h1>

        <FormKit type="date" name="fechaAntidoping" placeholder="Seleccione una fecha" v-model="fechaAntidoping"/>
    </div>
</template>