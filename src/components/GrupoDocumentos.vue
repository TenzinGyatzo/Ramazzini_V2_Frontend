<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DocumentsByYear } from '@/stores/documentos';
import DocumentoItem from './DocumentoItem.vue';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';
import type { PropType } from 'vue';
import { obtenerRutaDocumento, obtenerNombreArchivo, obtenerFechaDocumento } from '@/helpers/rutas';

const selectAll = ref(false);

const props = defineProps({
    documents: {
        type: Object as PropType<DocumentsByYear[string]>,
        required: true,
    },
    year: {
        type: String as PropType<string>,
        required: true,
    },
    toggleRouteSelection: {
        type: Function as PropType<(route: string, isSelected: boolean) => void>,
        required: true,
    },
    selectedRoutes: {
        type: Array as PropType<string[]>,
        required: true,
    },
});

const emit = defineEmits(['abrirModalUpdate', 'eliminarDocumento', 'openSubscriptionModal']);

// Watch para desmarcar "Seleccionar Todos" si se deselecciona un item
watch(() => props.selectedRoutes, (newSelectedRoutes) => {
    const totalDocuments = 
        (props.documents.aptitudes?.length || 0) +
        (props.documents.historiasClinicas?.length || 0) +
        (props.documents.exploracionesFisicas?.length || 0) +
        (props.documents.examenesVista?.length || 0) +
        (props.documents.antidopings?.length || 0) +
        (props.documents.certificados?.length || 0) +
        (props.documents.documentosExternos?.length || 0);

    // Si el número de rutas seleccionadas es menor que el total de documentos, desmarcar "Seleccionar Todos"
    selectAll.value = newSelectedRoutes.length === totalDocuments;
});

const toggleSelectAll = () => {
    if (props.documents.aptitudes) {
        props.documents.aptitudes.forEach(aptitud => {
            const rutaBase = obtenerRutaDocumento(aptitud, 'Aptitud');
            const fecha = obtenerFechaDocumento(aptitud) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(aptitud, 'Aptitud', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            props.toggleRouteSelection(ruta, selectAll.value);
        });
    }

    if (props.documents.historiasClinicas) {
        props.documents.historiasClinicas.forEach(historiaClinica => {
            const rutaBase = obtenerRutaDocumento(historiaClinica, 'Historia Clinica');
            const fecha = obtenerFechaDocumento(historiaClinica) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(historiaClinica, 'Historia Clinica', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            props.toggleRouteSelection(ruta, selectAll.value);
        });
    }

    if (props.documents.exploracionesFisicas) {
        props.documents.exploracionesFisicas.forEach(exploracionFisica => {
            const rutaBase = obtenerRutaDocumento(exploracionFisica, 'Exploracion Fisica');
            const fecha = obtenerFechaDocumento(exploracionFisica) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(exploracionFisica, 'Exploracion Fisica', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            props.toggleRouteSelection(ruta, selectAll.value);
        });
    }

    if (props.documents.examenesVista) {
        props.documents.examenesVista.forEach(examenVista => {
            const rutaBase = obtenerRutaDocumento(examenVista, 'Examen Vista');
            const fecha = obtenerFechaDocumento(examenVista) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(examenVista, 'Examen Vista', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            props.toggleRouteSelection(ruta, selectAll.value);
        });
    }

    if (props.documents.antidopings) {
        props.documents.antidopings.forEach(antidoping => {
            const rutaBase = obtenerRutaDocumento(antidoping, 'Antidoping');
            const fecha = obtenerFechaDocumento(antidoping) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(antidoping, 'Antidoping', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            props.toggleRouteSelection(ruta, selectAll.value);
        });
    }

    if (props.documents.certificados) {
        props.documents.certificados.forEach(certificado => {
            const rutaBase = obtenerRutaDocumento(certificado, 'Certificado');
            const fecha = obtenerFechaDocumento(certificado) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(certificado, 'Certificado', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            props.toggleRouteSelection(ruta, selectAll.value);
        });
    }

    if (props.documents.documentosExternos) {
        props.documents.documentosExternos.forEach(documentoExterno => {
            const rutaBase = obtenerRutaDocumento(documentoExterno, 'Documento Externo');
            const fecha = obtenerFechaDocumento(documentoExterno) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(documentoExterno, 'Documento Externo', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            props.toggleRouteSelection(ruta, selectAll.value);
        });
    }
};
</script>

<template>
    <div class="w-full rounded-lg shadow-lg">

        <h1
            class="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg text-center text-2xl font-medium py-2">
            Documentos {{ year }}</h1>

        <div class="flex items-center px-4 py-1 bg-gray-50 border-b border-gray-200">
            <input
                class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150"
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
                >
            <label for="" class="text-gray-700 font-medium">Seleccionar Todos</label>
        </div>

        <!-- Aptitudes -->
        <div v-if="documents.aptitudes && documents.aptitudes.length > 0">
            <div v-for="aptitud in documents.aptitudes" :key="aptitud._id">
                <DocumentoItem 
                    :aptitud="aptitud" 
                    :documentoId="aptitud._id" 
                    :documentoTipo="'aptitud'" 
                    :toggleRouteSelection="toggleRouteSelection" 
                    :isSelected="(() => {
                        const rutaBase = obtenerRutaDocumento(aptitud, 'Aptitud');
                        const fecha = obtenerFechaDocumento(aptitud) || 'SinFecha';
                        const nombreArchivo = obtenerNombreArchivo(aptitud, 'Aptitud', fecha);
                        const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                        return props.selectedRoutes.includes(ruta);
                    })()"
                    @eliminarDocumento="$emit('eliminarDocumento', aptitud._id, convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto), 'aptitud')" />
            </div>
        </div>

        <!-- Historias Clinicas -->
        <div v-if="documents.historiasClinicas && documents.historiasClinicas.length > 0">
            <div v-for="historiaClinica in documents.historiasClinicas" :key="historiaClinica._id">
                <DocumentoItem 
                    :historiaClinica="historiaClinica" 
                    :documentoId="historiaClinica._id"
                    :documentoTipo="'historiaClinica'" 
                    :toggleRouteSelection="toggleRouteSelection"
                    :isSelected="(() => {
                        const rutaBase = obtenerRutaDocumento(historiaClinica, 'Historia Clinica');
                        const fecha = obtenerFechaDocumento(historiaClinica) || 'SinFecha';
                        const nombreArchivo = obtenerNombreArchivo(historiaClinica, 'Historia Clinica', fecha);
                        const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                        return props.selectedRoutes.includes(ruta);
                    })()"
                    @eliminarDocumento="$emit('eliminarDocumento', historiaClinica._id, convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica), 'historiaClinica')" />
            </div>
        </div>

        <!-- Exploraciones Fisicas -->
        <div v-if="documents.exploracionesFisicas && documents.exploracionesFisicas.length > 0">
            <div v-for="exploracionFisica in documents.exploracionesFisicas" :key="exploracionFisica._id">
                <DocumentoItem 
                    :exploracionFisica="exploracionFisica" 
                    :documentoId="exploracionFisica._id"
                    :documentoTipo="'exploracionFisica'" 
                    :toggleRouteSelection="toggleRouteSelection"
                    :isSelected="(() => {
                        const rutaBase = obtenerRutaDocumento(exploracionFisica, 'Exploracion Fisica');
                        const fecha = obtenerFechaDocumento(exploracionFisica) || 'SinFecha';
                        const nombreArchivo = obtenerNombreArchivo(exploracionFisica, 'Exploracion Fisica', fecha);
                        const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                        return props.selectedRoutes.includes(ruta);
                    })()"
                    @eliminarDocumento="$emit('eliminarDocumento', exploracionFisica._id, convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica), 'exploracionFisica')" />
            </div>
        </div>

        <!-- Examenes de la Vista -->
        <div v-if="documents.examenesVista && documents.examenesVista.length > 0">
            <div v-for="examenVista in documents.examenesVista" :key="examenVista._id">
                <DocumentoItem 
                    :examenVista="examenVista" 
                    :documentoId="examenVista._id" 
                    :documentoTipo="'examenVista'" 
                    :toggleRouteSelection="toggleRouteSelection"
                    :isSelected="(() => {
                        const rutaBase = obtenerRutaDocumento(examenVista, 'Examen Vista');
                        const fecha = obtenerFechaDocumento(examenVista) || 'SinFecha';
                        const nombreArchivo = obtenerNombreArchivo(examenVista, 'Examen Vista', fecha);
                        const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                        return props.selectedRoutes.includes(ruta);
                    })()"
                    @eliminarDocumento="$emit('eliminarDocumento', examenVista._id, convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista), 'examenVista')" />
            </div>
        </div>

        <!-- Antidopings -->
        <div v-if="documents.antidopings && documents.antidopings.length > 0">
            <div v-for="antidoping in documents.antidopings" :key="antidoping._id">
                <DocumentoItem 
                    :antidoping="antidoping" 
                    :documentoId="antidoping._id" 
                    :documentoTipo="'antidoping'" 
                    :toggleRouteSelection="toggleRouteSelection"
                    :isSelected="(() => {
                        const rutaBase = obtenerRutaDocumento(antidoping, 'Antidoping');
                        const fecha = obtenerFechaDocumento(antidoping) || 'SinFecha';
                        const nombreArchivo = obtenerNombreArchivo(antidoping, 'Antidoping', fecha);
                        const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                        return props.selectedRoutes.includes(ruta);
                    })()"
                    @eliminarDocumento="$emit('eliminarDocumento', antidoping._id, convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping), 'antidoping')" />
            </div>
        </div>

        <!-- Certificados -->
        <div v-if="documents.certificados && documents.certificados.length > 0">
            <div v-for="certificado in documents.certificados" :key="certificado._id">
                <DocumentoItem 
                    :certificado="certificado" 
                    :documentoId="certificado._id" 
                    :documentoTipo="'certificado'" 
                    :toggleRouteSelection="toggleRouteSelection"
                    :isSelected="(() => {
                        const rutaBase = obtenerRutaDocumento(certificado, 'Certificado');
                        const fecha = obtenerFechaDocumento(certificado) || 'SinFecha';
                        const nombreArchivo = obtenerNombreArchivo(certificado, 'Certificado', fecha);
                        const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                        return props.selectedRoutes.includes(ruta);
                    })()"
                    @eliminarDocumento="$emit('eliminarDocumento', certificado._id, convertirFechaISOaDDMMYYYY(certificado.fechaCertificado), 'certificado')" />
            </div>
        </div>

        <!-- Documentos Externos -->
        <div v-if="documents.documentosExternos && documents.documentosExternos.length > 0">
            <div v-for="documentoExterno in documents.documentosExternos" :key="documentoExterno._id">
                <DocumentoItem 
                    :documentoExterno="documentoExterno" 
                    :documentoId="documentoExterno._id"
                    :documentoTipo="'documentoExterno'" 
                    :toggleRouteSelection="toggleRouteSelection"
                    :isSelected="(() => {
                        const rutaBase = obtenerRutaDocumento(documentoExterno, 'Documento Externo');
                        const fecha = obtenerFechaDocumento(documentoExterno) || 'SinFecha';
                        const nombreArchivo = obtenerNombreArchivo(documentoExterno, 'Documento Externo', fecha);
                        const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                        return props.selectedRoutes.includes(ruta);
                    })()"
                    @eliminarDocumento="$emit('eliminarDocumento', documentoExterno._id, convertirFechaISOaDDMMYYYY(documentoExterno.fechaDocumento), 'documentoExterno')"
                    @abrirModalUpdate="$emit('abrirModalUpdate')" 
                    @openSubscriptionModal="() => {
                        console.log('Propagando openSubscriptionModal desde GrupoDocumentos.vue');
                        $emit('openSubscriptionModal');
                    }"
                />
            </div>
        </div>
    </div>
</template>
