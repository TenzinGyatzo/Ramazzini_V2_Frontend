<script setup>
import DocumentoItem from './DocumentoItem.vue';

</script>

<template>
    <div class="w-full">

        <h1 class="ring-1 ring-gray-600 bg-gray-300 rounded-t-md text-center text-xl">Documentos {Año}</h1>

        <div class="ring-1 ring-gray-600 border-t-0 bg-gray-50 flex  px-2 items-center">
            <input class="mx-2 my-3 transform scale-150" type="checkbox" name="" id="">
            <p class="mx-2">Seleccionar Todos</p>
        </div>

        <DocumentoItem />
        <DocumentoItem />
        <DocumentoItem />
        <DocumentoItem />

    </div>
</template>