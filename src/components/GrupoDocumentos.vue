<script setup lang="ts">
import DocumentoItem from './DocumentoItem.vue';
import { useDocumentosStore } from '@/stores/documentos';
import type { Antidoping, Aptitud, Certificado, DocumentoExterno, ExamenVista, ExploracionFisica, HistoriaClinica } from "@/interfaces/documentos.inteface";


const documentos = useDocumentosStore();

defineProps<{
    antidopings: { [year: string]: Antidoping[] };
    aptitudes: { [year: string]: Aptitud[] };
    certificados: { [year: string]: Certificado[] };
    documentosExternos: { [year: string]: DocumentoExterno[] };
    examenesVista: { [year: string]: ExamenVista[] };
    exploracionesFisicas: { [year: string]: ExploracionFisica[] };
    historiasClinicas: { [year: string]: HistoriaClinica[] };
}>();
</script>

<template>
    <div class="w-full">

        <h1 class="ring-1 ring-gray-600 bg-gray-300 rounded-t-md text-center text-xl">Documentos {Año}</h1>

        <div class="ring-1 ring-gray-600 border-t-0 bg-gray-50 flex px-2 items-center">
            <input class="mx-2 my-3 transform scale-150" type="checkbox" name="" id="">
            <p class="mx-2">Seleccionar Todos</p>
        </div>

        <div class="w-full">
            <!-- Antidopings -->
            <div v-if="Object.keys(antidopings).length > 0">
                <h2 class="text-xl font-semibold">Antidopings</h2>
                <div v-for="(docs, year) in antidopings" :key="year">
                    <h3 class="text-lg font-medium bg-gray-200 p-2 rounded-t-md">{{ year }}</h3>
                    <div v-for="antidoping in docs" :key="antidoping._id">
                        <DocumentoItem :antidoping="antidoping" />
                    </div>
                </div>
            </div>

            <!-- Aptitudes -->
            <div v-if="Object.keys(aptitudes).length > 0">
                <h2 class="text-xl font-semibold">Aptitudes</h2>
                <div v-for="(docs, year) in aptitudes" :key="year">
                    <h3 class="text-lg font-medium bg-gray-200 p-2 rounded-t-md">{{ year }}</h3>
                    <div v-for="aptitud in docs" :key="aptitud._id">
                        <DocumentoItem :aptitud="aptitud" />
                    </div>
                </div>
            </div>

            <!-- Certificados -->
            <div v-if="Object.keys(certificados).length > 0">
                <h2 class="text-xl font-semibold">Certificados</h2>
                <div v-for="(docs, year) in certificados" :key="year">
                    <h3 class="text-lg font-medium bg-gray-200 p-2 rounded-t-md">{{ year }}</h3>
                    <div v-for="certificado in docs" :key="certificado._id">
                        <DocumentoItem :certificado="certificado" />
                    </div>
                </div>
            </div>
        </div>

<!--         <div v-if="documentos.antidopings.length > 0">
            <DocumentoItem v-for="antidoping in documentos.antidopings" :key="antidoping._id" :antidoping="antidoping" />
        </div>
        
        <div v-if="documentos.aptitudes.length > 0">
            <DocumentoItem v-for="aptitud in documentos.aptitudes" :key="aptitud._id" :aptitud="aptitud" />
        </div>
        
        <div v-if="documentos.certificados.length > 0">
            <DocumentoItem v-for="certificado in documentos.certificados" :key="certificado._id" :certificado="certificado" />
        </div>
        
        <div v-if="documentos.documentosExternos.length > 0">
            <DocumentoItem v-for="documentoExterno in documentos.documentosExternos" :key="documentoExterno._id" :documentoExterno="documentoExterno" />
        </div>
        
        <div v-if="documentos.examenesVista.length > 0">
            <DocumentoItem v-for="examenVista in documentos.examenesVista" :key="examenVista._id" :examenVista="examenVista" />
        </div>
        
        <div v-if="documentos.exploracionesFisicas.length > 0">
            <DocumentoItem v-for="exploracionFisica in documentos.exploracionesFisicas" :key="exploracionFisica._id" :exploracionFisica="exploracionFisica" />
        </div>
        
        <div v-if="documentos.historiasClinicas.length > 0">
            <DocumentoItem v-for="historiaClinica in documentos.historiasClinicas" :key="historiaClinica._id" :historiaClinica="historiaClinica" />
        </div> -->

    </div>
</template>
