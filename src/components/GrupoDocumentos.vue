<script setup lang="ts">
import type { DocumentsByYear } from '@/stores/documentos';
import DocumentoItem from './DocumentoItem.vue';

defineProps<{
    documents: DocumentsByYear[string];
    year: string;
}>();
</script>

<template>
    <div class="w-full">

        <h1 class="ring-1 ring-gray-600 bg-gray-300 rounded-t-md text-center text-xl">Documentos {{ year }}</h1>

        <div class="ring-1 ring-gray-600 border-t-0 bg-gray-50 flex px-2 items-center">
            <input class="mx-2 my-3 transform scale-150" type="checkbox" name="" id="">
            <p class="mx-2">Seleccionar Todos</p>
        </div>

        <!-- Aptitudes -->
        <div v-if="documents.aptitudes && documents.aptitudes.length > 0">
            <div v-for="aptitud in documents.aptitudes" :key="aptitud._id">
                <DocumentoItem :aptitud="aptitud" />
            </div>
        </div>

        <!-- Historias Clinicas -->
        <div v-if="documents.historiasClinicas && documents.historiasClinicas.length > 0">
            <div v-for="historiaClinica in documents.historiasClinicas" :key="historiaClinica._id">
                <DocumentoItem :historiaClinica="historiaClinica" />
            </div>
        </div>

        <!-- Exploraciones Fisicas -->
        <div v-if="documents.exploracionesFisicas && documents.exploracionesFisicas.length > 0">
            <div v-for="exploracionFisica in documents.exploracionesFisicas" :key="exploracionFisica._id">
                <DocumentoItem :exploracionFisica="exploracionFisica" />
            </div>
        </div>

        <!-- Examenes de la Vista -->
        <div v-if="documents.examenesVista && documents.examenesVista.length > 0">
            <div v-for="examenVista in documents.examenesVista" :key="examenVista._id">
                <DocumentoItem :examenVista="examenVista" />
            </div>
        </div>

        <!-- Antidopings -->
        <div v-if="documents.antidopings && documents.antidopings.length > 0">
            <div v-for="antidoping in documents.antidopings" :key="antidoping._id">
                <DocumentoItem :antidoping="antidoping" />
            </div>
        </div>

        <!-- Certificados -->
        <div v-if="documents.certificados && documents.certificados.length > 0">
            <div v-for="certificado in documents.certificados" :key="certificado._id">
                <DocumentoItem :certificado="certificado" />
            </div>
        </div>

        <!-- Documentos Externos -->
        <div v-if="documents.documentosExternos && documents.documentosExternos.length > 0">
            <div v-for="documentoExterno in documents.documentosExternos" :key="documentoExterno._id">
                <DocumentoItem :documentoExterno="documentoExterno" />
            </div>
        </div>

    </div>
</template>
