<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { DocumentsByYear } from '@/stores/documentos';
import DocumentoItem from './DocumentoItem.vue';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';
import type { PropType } from 'vue';
import { obtenerRutaDocumento, obtenerNombreArchivo, obtenerFechaDocumento } from '@/helpers/rutas';

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

// Calcular el total de documentos para mostrar en el header
const totalDocumentos = computed(() => {
    return (props.documents.aptitudes?.length || 0) +
           (props.documents.historiasClinicas?.length || 0) +
           (props.documents.exploracionesFisicas?.length || 0) +
           (props.documents.examenesVista?.length || 0) +
           (props.documents.antidopings?.length || 0) +
           (props.documents.certificados?.length || 0) +
           (props.documents.documentosExternos?.length || 0) +
           (props.documents.notasMedicas?.length || 0);
});

// Obtener todas las rutas de documentos de este grupo específico
const rutasDelGrupo = computed(() => {
    const rutas: string[] = [];
    
    if (props.documents.aptitudes) {
        props.documents.aptitudes.forEach(aptitud => {
            const rutaBase = obtenerRutaDocumento(aptitud, 'Aptitud');
            const fecha = obtenerFechaDocumento(aptitud) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(aptitud, 'Aptitud', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    if (props.documents.historiasClinicas) {
        props.documents.historiasClinicas.forEach(historiaClinica => {
            const rutaBase = obtenerRutaDocumento(historiaClinica, 'Historia Clinica');
            const fecha = obtenerFechaDocumento(historiaClinica) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(historiaClinica, 'Historia Clinica', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    if (props.documents.exploracionesFisicas) {
        props.documents.exploracionesFisicas.forEach(exploracionFisica => {
            const rutaBase = obtenerRutaDocumento(exploracionFisica, 'Exploracion Fisica');
            const fecha = obtenerFechaDocumento(exploracionFisica) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(exploracionFisica, 'Exploracion Fisica', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    if (props.documents.examenesVista) {
        props.documents.examenesVista.forEach(examenVista => {
            const rutaBase = obtenerRutaDocumento(examenVista, 'Examen Vista');
            const fecha = obtenerFechaDocumento(examenVista) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(examenVista, 'Examen Vista', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    if (props.documents.antidopings) {
        props.documents.antidopings.forEach(antidoping => {
            const rutaBase = obtenerRutaDocumento(antidoping, 'Antidoping');
            const fecha = obtenerFechaDocumento(antidoping) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(antidoping, 'Antidoping', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    if (props.documents.certificados) {
        props.documents.certificados.forEach(certificado => {
            const rutaBase = obtenerRutaDocumento(certificado, 'Certificado');
            const fecha = obtenerFechaDocumento(certificado) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(certificado, 'Certificado', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    if (props.documents.documentosExternos) {
        props.documents.documentosExternos.forEach(documentoExterno => {
            const rutaBase = obtenerRutaDocumento(documentoExterno, 'Documento Externo');
            const fecha = obtenerFechaDocumento(documentoExterno) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(documentoExterno, 'Documento Externo', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    if (props.documents.notasMedicas) {
        props.documents.notasMedicas.forEach(notaMedica => {
            const rutaBase = obtenerRutaDocumento(notaMedica, 'Nota Medica');
            const fecha = obtenerFechaDocumento(notaMedica) || 'SinFecha';
            const nombreArchivo = obtenerNombreArchivo(notaMedica, 'Nota Medica', fecha);
            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
            rutas.push(ruta);
        });
    }

    return rutas;
});

// Calcular cuántos documentos de este grupo están seleccionados
const documentosSeleccionadosDelGrupo = computed(() => {
    return rutasDelGrupo.value.filter(ruta => props.selectedRoutes.includes(ruta)).length;
});

// Determinar si todos los documentos de este grupo están seleccionados
const selectAll = computed({
    get: () => {
        return totalDocumentos.value > 0 && documentosSeleccionadosDelGrupo.value === totalDocumentos.value;
    },
    set: (value: boolean) => {
        // Aplicar la selección solo a los documentos de este grupo
        rutasDelGrupo.value.forEach(ruta => {
            props.toggleRouteSelection(ruta, value);
        });
    }
});

const toggleSelectAll = () => {
    selectAll.value = !selectAll.value;
};
</script>

<template>
    <div class="w-full rounded-xl shadow-lg overflow-hidden border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl">
        <!-- Header mejorado con gradiente y contador -->
        <div class="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 relative overflow-hidden">
            <!-- Patrón de fondo sutil -->
            <div class="absolute inset-0 bg-black opacity-5">
                <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;"></div>
            </div>
            
            <div class="relative px-6 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <!-- Icono de calendario -->
                    <div class="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    
                    <div>
                        <h1 class="text-2xl font-semibold text-white tracking-normal">
                            Expediente {{ year }}
                        </h1>
                        <p class="text-emerald-100 text-sm font-medium tracking-wide">
                            {{ totalDocumentos }} documento{{ totalDocumentos !== 1 ? 's' : '' }} en total
                        </p>
                    </div>
                </div>
                
                <!-- Indicador de selección -->
                <div v-if="documentosSeleccionadosDelGrupo > 0" class="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                    <div class="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                    <span class="text-white text-sm font-medium">
                        {{ documentosSeleccionadosDelGrupo }} seleccionado{{ documentosSeleccionadosDelGrupo !== 1 ? 's' : '' }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Barra de selección mejorada -->
        <div class="flex items-center px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200">
            <div class="flex items-center space-x-3">
                <!-- Checkbox personalizado -->
                <div class="relative">
                    <input
                        class="sr-only"
                        type="checkbox"
                        :checked="selectAll"
                        @change="toggleSelectAll"
                        :id="`select-all-checkbox-${year}`"
                    >
                    <label 
                        :for="`select-all-checkbox-${year}`"
                        class="flex items-center justify-center w-6 h-6 border-2 rounded-md cursor-pointer transition-all duration-200"
                        :class="{
                            'bg-emerald-500 border-emerald-600 shadow-sm': selectAll,
                            'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 hover:scale-105': !selectAll
                        }"
                    >
                        <svg v-if="selectAll" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                    </label>
                </div>
                
                <div class="flex flex-col">
                    <label :for="`select-all-checkbox-${year}`" class="text-gray-700 font-semibold cursor-pointer transition-colors duration-200 hover:text-emerald-700">
                        Seleccionar Todos
                    </label>
                    <span class="text-xs text-gray-500">
                        {{ documentosSeleccionadosDelGrupo }} de {{ totalDocumentos }} documentos
                    </span>
                </div>
            </div>
        </div>

        <!-- Contenido de documentos con espaciado mejorado -->
        <div class="divide-y divide-gray-100">
            <!-- Aptitudes -->
            <div v-if="documents.aptitudes && documents.aptitudes.length > 0" class="space-y-1">
                <div v-for="(aptitud, index) in documents.aptitudes" :key="aptitud._id" 
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
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
                        @eliminarDocumento="$emit('eliminarDocumento', aptitud._id, convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto), 'aptitud')" 
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>

            <!-- Historias Clinicas -->
            <div v-if="documents.historiasClinicas && documents.historiasClinicas.length > 0" class="space-y-1">
                <div v-for="(historiaClinica, index) in documents.historiasClinicas" :key="historiaClinica._id"
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
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
                        @eliminarDocumento="$emit('eliminarDocumento', historiaClinica._id, convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica), 'historiaClinica')" 
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>

            <!-- Exploraciones Fisicas -->
            <div v-if="documents.exploracionesFisicas && documents.exploracionesFisicas.length > 0" class="space-y-1">
                <div v-for="(exploracionFisica, index) in documents.exploracionesFisicas" :key="exploracionFisica._id"
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
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
                        @eliminarDocumento="$emit('eliminarDocumento', exploracionFisica._id, convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica), 'exploracionFisica')" 
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>

            <!-- Examenes de la Vista -->
            <div v-if="documents.examenesVista && documents.examenesVista.length > 0" class="space-y-1">
                <div v-for="(examenVista, index) in documents.examenesVista" :key="examenVista._id"
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
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
                        @eliminarDocumento="$emit('eliminarDocumento', examenVista._id, convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista), 'examenVista')" 
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>

            <!-- Antidopings -->
            <div v-if="documents.antidopings && documents.antidopings.length > 0" class="space-y-1">
                <div v-for="(antidoping, index) in documents.antidopings" :key="antidoping._id"
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
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
                        @eliminarDocumento="$emit('eliminarDocumento', antidoping._id, convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping), 'antidoping')" 
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>

            <!-- Certificados -->
            <div v-if="documents.certificados && documents.certificados.length > 0" class="space-y-1">
                <div v-for="(certificado, index) in documents.certificados" :key="certificado._id"
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
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
                        @eliminarDocumento="$emit('eliminarDocumento', certificado._id, convertirFechaISOaDDMMYYYY(certificado.fechaCertificado), 'certificado')" 
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>

            <!-- Documentos Externos -->
            <div v-if="documents.documentosExternos && documents.documentosExternos.length > 0" class="space-y-1">
                <div v-for="(documentoExterno, index) in documents.documentosExternos" :key="documentoExterno._id"
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
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
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>

            <!-- Notas Medicas -->
            <div v-if="documents.notasMedicas && documents.notasMedicas.length > 0" class="space-y-1">
                <div v-for="(notaMedica, index) in documents.notasMedicas" :key="notaMedica._id"
                     class="transition-all duration-200 hover:bg-gray-50"
                     :style="{ animationDelay: `${index * 50}ms` }">
                    <DocumentoItem 
                        :notaMedica="notaMedica" 
                        :documentoId="notaMedica._id" 
                        :documentoTipo="'notaMedica'" 
                        :toggleRouteSelection="toggleRouteSelection"
                        :isSelected="(() => {
                            const rutaBase = obtenerRutaDocumento(notaMedica, 'Nota Medica');
                            const fecha = obtenerFechaDocumento(notaMedica) || 'SinFecha';
                            const nombreArchivo = obtenerNombreArchivo(notaMedica, 'Nota Medica', fecha);
                            const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');
                            return props.selectedRoutes.includes(ruta);
                        })()"
                        @eliminarDocumento="$emit('eliminarDocumento', notaMedica._id, convertirFechaISOaDDMMYYYY(notaMedica.fechaNotaMedica), 'notaMedica')" 
                        @openSubscriptionModal="emit('openSubscriptionModal')"
                    />
                </div>
            </div>
        </div>

        <!-- Estado vacío mejorado -->
        <div v-if="totalDocumentos === 0" class="p-12 text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
            <p class="text-gray-500">No se encontraron documentos para el año {{ year }}</p>
        </div>
    </div>
</template>

<style scoped>
/* Animaciones personalizadas */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.space-y-1 > div {
    animation: fadeInUp 0.3s ease-out forwards;
}

/* Hover effects mejorados */
.hover\:bg-gray-50:hover {
    background-color: #f9fafb;
    transform: translateX(2px);
}

/* Transiciones suaves */
.transition-all {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto de sombra en hover */
.hover\:shadow-xl:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Animación del indicador de selección */
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: .5;
    }
}
</style>
