<script setup>
import axios from 'axios';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { VPdfViewer, Locales, useLicense } from '@vue-pdf-viewer/viewer';
import { useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { obtenerRutaDocumento, obtenerNombreArchivo, obtenerFechaDocumento } from '@/helpers/rutas.ts';
import ModalPdfEliminado from './ModalPdfEliminado.vue';

const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const proveedorSaludStore = useProveedorSaludStore();

const periodoDePruebaFinalizado = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado;
const estadoSuscripcion = proveedorSaludStore.proveedorSalud?.estadoSuscripcion;
const finDeSuscripcion = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const mostrarModalPdfEliminado = ref(false);

const emit = defineEmits(['eliminarDocumento', 'abrirModalUpdate', 'closeModalUpdate', 'openSubscriptionModal']);

const editarDocumento = (documentoId, documentoTipo) => {
    if (!proveedorSaludStore.proveedorSalud) return;

    if (periodoDePruebaFinalizado) {
        // Bloquear si el periodo de prueba ha finalizado y no tiene suscripción activa (Inactive aparece cuando el pago falla repetidamente)
        if (!estadoSuscripcion || estadoSuscripcion === 'inactive') {
            emit('openSubscriptionModal');
            return;
        }

        // Bloquear solo si canceló la suscripción y la fecha de fin de suscripción ya pasó
        if (estadoSuscripcion === 'cancelled' && finDeSuscripcion && new Date() > finDeSuscripcion) {
            emit('openSubscriptionModal');
            return;
        }
    }

    router.push({
        name: 'crear-documento',
        params: {
            idEmpresa: empresas.currentEmpresaId,
            idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId,
            idTrabajador: trabajadores.currentTrabajadorId,
            tipoDocumento: documentoTipo,
            idDocumento: documentoId,
        },
    });
};

// URL base donde se almacenan los documentos
const BASE_URL = import.meta.env.VITE_API_URL;

// Función dinámica para descargar un archivo basado en el documento// Función dinámica para descargar un archivo basado en el documento
const descargarArchivo = async (documento, tipoDocumento) => {
    try {
        console.log('Descargando archivo:', { documento, tipoDocumento });

        const ruta = obtenerRutaDocumento(documento, tipoDocumento);

        console.log('Ruta del documento:', ruta);
        if (!ruta) {
            console.warn('El documento no está disponible o no es válido:', { documento, tipoDocumento });
            alert('El documento no está disponible o no es válido.');
            return;
        }

        const fecha = obtenerFechaDocumento(documento) || 'SinFecha';

        const nombreArchivo = obtenerNombreArchivo(documento, tipoDocumento, fecha);

        await descargarYGuardarArchivo(ruta, nombreArchivo);

    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        alert('Ocurrió un error al intentar descargar el archivo.');
    }
};

const descargarYGuardarArchivo = async (ruta, nombreArchivo) => {
    try {
        const urlCompleta = `${BASE_URL}/${ruta}/${nombreArchivo}`;

        const response = await axios.get(encodeURI(urlCompleta), {
            responseType: 'blob',
        });

        const blob = response.data;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nombreArchivo;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Error al descargar o guardar el archivo:', error);
        throw error;
    }
};


// If the value is empty or incorrect, the watermark will remain.
const licenseKey = import.meta.env.VITE_VPV_LICENSE;

// useLicense must be used here to ensure proper license 
// initialization before the component renders.
useLicense({ licenseKey });

// Estados para mostrar el visor y la URL del PDF
const showPdfViewer = ref(false);
const pdfUrl = ref('');

const localization = {
    customLang: {
        // Import the English localization as a fallback
        ...Locales.en_US,
        documentPropertiesLabel: 'Propiedades del documento',
        documentPropertiesTooltip: 'Mostrar propiedades del documento',
        downloadFileLabel: 'Descargar',
        downloadFileTooltip: 'Descargar archivo',
        dragDropFileMessage: 'Arrastra y suelta un archivo aquí para abrirlo',
        dualPageLabel: 'Página doble',
        firstPageTooltip: 'Ir a la primera página',
        fullScreenLabel: 'Pantalla completa',
        fullScreenTooltip: 'Ver en pantalla completa',
        handToolLabel: 'Herramienta de mano',
        handToolTooltip: 'Mover página con herramienta de mano',
        horizontalScrollingLabel: 'Desplazamiento horizontal',
        lastPageLabel: 'Última página',
        lastPageTooltip: 'Ir a la última página',
        moreOptionTooltip: 'Más opciones',
        nextPageTooltip: 'Página siguiente',
        openLocalFileLabel: 'Abrir archivo local',
        openLocalFileTooltip: 'Seleccionar un archivo local para abrir',
        pageScrollingLabel: 'Desplazamiento por página',
        passwordConfirmLabel: 'Confirmar',
        passwordError: 'Contraseña incorrecta',
        passwordModalMessage: 'Este documento está protegido con contraseña. Introduce la contraseña para continuar.',
        passwordModalTitle: 'Contraseña requerida',
        passwordPlaceholder: 'Introducir contraseña',
        previousPageTooltip: 'Página anterior',
        printCancelLabel: 'Cancelar impresión',
        printLabel: 'Imprimir',
        printLoadingMessage: 'Preparando para imprimir...',
        printTooltip: 'Imprimir archivo',
        propertiesAuthorLabel: 'Autor',
        propertiesCreateOnLabel: 'Creado el',
        propertiesCreatorLabel: 'Creador',
        propertiesFilenameLabel: 'Nombre del archivo',
        propertiesFileSizeLabel: 'Tamaño del archivo',
        propertiesKeywordLabel: 'Palabras clave',
        propertiesModifiedOnLabel: 'Modificado el',
        propertiesPageCountLabel: 'Cantidad de páginas',
        propertiesPDFProducerLabel: 'Productor PDF',
        propertiesPDFVersionLabel: 'Versión de PDF',
        propertiesSubjectLabel: 'Asunto',
        propertiesTitleLabel: 'Título',
        rotateClockwiseLabel: 'Girar a la derecha',
        rotateClockwiseTooltip: 'Girar en sentido horario',
        rotateCounterclockwiseLabel: 'Girar a la izquierda',
        rotateCounterclockwiseTooltip: 'Girar en sentido antihorario',
        searchButtonTooltip: 'Buscar',
        searchCloseButtonTooltip: 'Cerrar búsqueda',
        searchInputPlaceholder: 'Buscar...',
        searchNextTooltip: 'Siguiente resultado',
        searchPrevTooltip: 'Resultado anterior',
        singlePageLabel: 'Página única',
        textSelectionLabel: 'Seleccionar texto',
        textSelectionTooltip: 'Activar herramienta de selección de texto',
        themeEnableDarkTooltip: 'Activar modo oscuro',
        themeEnableLightTooltip: 'Activar modo claro',
        thumbnailTooltip: 'Miniaturas',
        verticalScrollingLabel: 'Desplazamiento vertical',
        wrappedScrollingLabel: 'Desplazamiento envuelto',
        zoomActualSize: 'Tamaño real',
        zoomInTooltip: 'Acercar',
        zoomOutTooltip: 'Alejar',
        zoomPageFit: 'Ajustar a la página',
        zoomPageWidth: 'Ajustar al ancho de la página',
        zoomSelectTooltip: 'Seleccionar nivel de zoom'
    }
};

const abrirPdf = async (ruta, nombrePDF) => {
    // Sanear la ruta y el nombre del archivo para eliminar dobles diagonales
    const sanitizedRuta = ruta.replace(/\/+/g, '/'); // Reemplaza múltiples '/' por una sola
    const sanitizedNombrePDF = nombrePDF.replace(/\/+/g, '/'); // Reemplaza múltiples '/' por una sola

    // Generar la URL de forma explícita usando `new URL`
    const fullPath = new URL(`${sanitizedRuta}/${sanitizedNombrePDF}`, import.meta.env.VITE_API_URL);
    // console.log('Ruta completa del PDF:', fullPath.href);

    try {
        const response = await axios.get(fullPath.href, { responseType: 'blob' }); // Solicitud GET

        const contentType = response.headers['content-type'];

        if (response.status === 200 && contentType === 'application/pdf') {
            pdfUrl.value = fullPath.href; // Actualiza tu variable de URL
            showPdfViewer.value = true; // Muestra el visor PDF
        } else {
            console.warn('El archivo no es un PDF o no existe.', { status: response.status, contentType });
            alert('El archivo PDF no existe o no es válido.');
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            mostrarModalPdfEliminado.value = true;
        } else {
            console.error('Error al intentar cargar el archivo PDF:', error.message);
            alert('Ocurrió un error al intentar cargar el archivo PDF.');
        }
    }
};

// Función para cerrar el visor
const cerrarPdf = () => {
    showPdfViewer.value = false;
    pdfUrl.value = '';
};

// Función para abrir un documento externo
const abrirDocumentoExterno = async (documento) => {
    const extension = obtenerExtensionArchivo(documento); // Determina la extensión del archivo
    const isImage = ['png', 'jpg', 'jpeg'].includes(extension);

    const rutaCompleta = construirRutaCompleta(documento); // Construye la ruta completa

    if (isImage) {
        abrirImagen(rutaCompleta);
    } else {
        abrirPdf(documento.rutaDocumento, `${documento.nombreDocumento} ${convertirFechaISOaDDMMYYYY(documento.fechaDocumento)}.pdf`);
    }
};

// Función para obtener la extensión del archivo
const obtenerExtensionArchivo = (documento) => {
    const nombreArchivo = `${documento.nombreDocumento} ${convertirFechaISOaDDMMYYYY(documento.fechaDocumento)}${documento.extension}`;
    const archivo = documento.rutaDocumento.includes('.') ? documento.rutaDocumento.split('/').pop() : nombreArchivo;
    return archivo.split('.').pop().toLowerCase();
};

// Función para construir la ruta completa
const construirRutaCompleta = (documento) => {
    const nombreArchivo = `${documento.nombreDocumento} ${convertirFechaISOaDDMMYYYY(documento.fechaDocumento)}${documento.extension}`;
    if (documento.rutaDocumento.endsWith(nombreArchivo)) {
        return `${BASE_URL}/${documento.rutaDocumento}`; // Ruta ya incluye el nombre del archivo
    }
    return `${BASE_URL}/${documento.rutaDocumento}/${nombreArchivo}`; // Agrega el nombre del archivo
};

// Estado para el visor de imágenes
const showImageViewer = ref(false);
const imageUrl = ref('');

// Función para abrir el visor de imágenes
const abrirImagen = async (rutaCompleta) => {
    try {
        const response = await axios.head(rutaCompleta);

        if (response.status === 200 && response.headers['content-type'].startsWith('image/')) {
            imageUrl.value = rutaCompleta;
            showImageViewer.value = true;
        } else {
            console.warn('El archivo no es una imagen válida.');
            mostrarModalPdfEliminado.value = true;
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            mostrarModalPdfEliminado.value = true;
        } else {
            console.error('Error al cargar la imagen:', error);
            alert('Ocurrió un error al intentar cargar la imagen.');
        }
    }
};


// Función para cerrar el visor de imágenes
const cerrarImagen = () => {
    showImageViewer.value = false;
    imageUrl.value = '';
};

const handleCheckboxChange = (event, documento, tipoDocumento) => {
    const isChecked = event.target.checked;
    const rutaBase = obtenerRutaDocumento(documento, tipoDocumento); // Define cómo obtener la ruta del documento

    const fecha = obtenerFechaDocumento(documento) || 'SinFecha';
    const nombreArchivo = obtenerNombreArchivo(documento, tipoDocumento, fecha);

    const ruta = `${rutaBase}/${nombreArchivo}`.replace(/\/+/g, '/');

    if (ruta) {
        props.toggleRouteSelection(ruta, isChecked);
    }
};

const props = defineProps({
    documentoId: {
        type: String,
        required: true,
    },
    documentoTipo: {
        type: String,
        required: true,
    },
    isSelected: {
        type: Boolean,
        required: true,
    },
    toggleRouteSelection: {
        type: Function,
        required: true,
    },
    antidoping: [Object, String],
    aptitud: [Object, String],
    certificado: [Object, String],
    documentoExterno: [Object, String],
    examenVista: [Object, String],
    exploracionFisica: [Object, String],
    historiaClinica: [Object, String],
    notaMedica: [Object, String],
});

const { antidoping } = props; // Desestructuración para acceder a antidoping

const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        if (showImageViewer.value) {
            cerrarImagen();
        } else if (showPdfViewer.value) {
            cerrarPdf();
        }
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

////////////////////////////////////////////
// Estado para la anchura de la ventana
const windowWidth = ref(window.innerWidth);

// Actualizar la anchura de la ventana al cambiar de tamaño
const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
};

// Agregar y eliminar el listener de eventos
onMounted(() => window.addEventListener('resize', updateWindowWidth));
onUnmounted(() => window.removeEventListener('resize', updateWindowWidth));

/// Computed para las condiciones responsivas
const isExtraLargeScreen = computed(() => windowWidth.value >= 1280);
const isLargeScreen = computed(() => windowWidth.value >= 1024 && windowWidth.value < 1280);
const isMediumScreen = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);
const isSmallScreen = computed(() => windowWidth.value < 768);

// Valores dinámicos para initialThumbnails-visible y initialScale
const initialThumbnailsVisible = computed(() => isLargeScreen.value || isExtraLargeScreen.value);
const initialScale = computed(() => {
  if (isExtraLargeScreen.value) return 2; // >= 1280px
  if (isLargeScreen.value) return 1.75;   // 1024px - 1279px
  if (isMediumScreen.value) return 1.4;   // 768px - 1023px
  return 0.8;                               // < 768px
});

// Lógica para mensajes dinámicos de antidopings
const parametros = [
  'marihuana',
  'cocaina',
  'anfetaminas',
  'metanfetaminas',
  'opiaceos',
  'benzodiacepinas',
  'fenciclidina',
  'metadona',
  'barbituricos',
  'antidepresivosTriciclicos'
]

// Obtenemos solo los parámetros que existen en el objeto actual
const parametrosPresentes = computed(() =>
  parametros.filter(p => antidoping[p] !== undefined)
)

// ¿Hay algún parámetro positivo?
const positivos = computed(() =>
  parametrosPresentes.value.some(p => antidoping[p] === 'Positivo')
)

// ¿Todos los parámetros presentes son negativos?
const todosNegativos = computed(() =>
  parametrosPresentes.value.every(p => antidoping[p] === 'Negativo')
)

// Mensaje según cantidad de parámetros y estado
const mensajeNegativo = computed(() => {
  if (!positivos.value && todosNegativos.value) {
    const cantidad = parametrosPresentes.value.length
    if (cantidad === 5) return 'Negativo a cinco parámetros'
    if (cantidad === 6) return 'Negativo a seis parámetros'
    if (cantidad === 10) return 'Negativo a diez parámetros'
  }
  return null
})
///////////////////////////////////////////

const construirRutaYNombrePDF = () => {
  const tipoSinEspacios = props.documentoTipo.toLowerCase().replace(/\s+/g, '');
  const doc = {
    'antidoping': props.antidoping,
    'aptitud': props.aptitud, 
    'certificado': props.certificado,
    'examenvista': props.examenVista,
    'exploracionfisica': props.exploracionFisica,
    'historiaclinica': props.historiaClinica,
    'notamedica': props.notaMedica,
  }[tipoSinEspacios];

  const fecha = doc?.fechaAntidoping || doc?.fechaAptitudPuesto || doc?.fechaCertificado || doc?.fechaExamenVista || doc?.fechaExploracionFisica || doc?.fechaHistoriaClinica || doc?.fechaNotaMedica;

  const tiposDocumentos = {
    'antidoping': 'Antidoping',
    'aptitud': 'Aptitud',
    'certificado': 'Certificado',
    'examenvista': 'Examen Vista', 
    'exploracionfisica': 'Exploracion Fisica',
    'historiaclinica': 'Historia Clinica',
    'notamedica': 'Nota Medica'
  };

  const tipoDocumentoFormateado = tiposDocumentos[tipoSinEspacios];
  const fechaFormateada = fecha ? convertirFechaISOaDDMMYYYY(fecha).replace(/\//g, '-') : '';
  const nombreArchivo = fecha ? `${tipoDocumentoFormateado} ${fechaFormateada}.pdf` : `${tipoDocumentoFormateado}.pdf`;

  return {
      ruta: doc.rutaPDF,        // solo la carpeta
      nombre: nombreArchivo     // solo el nombre del archivo
  };
};

const abrirDocumentoCorrespondiente = () => {
  const { ruta, nombre } = construirRutaYNombrePDF();
  console.log('Abriendo documento desde evento regenerado:', { ruta, nombre });
  abrirPdf(ruta, nombre); 
};

const manejarRegeneracionDesdePadre = async () => {
  console.log('✔️ Evento "regenerado" recibido desde el padre');
  await abrirDocumentoCorrespondiente();      // Abre visor
  await nextTick();                           // Espera a que DOM actualice
  mostrarModalPdfEliminado.value = false;     // Cierra el modal
};

</script>

<template>
    <transition name="fade">
        <ModalPdfEliminado
            v-if="mostrarModalPdfEliminado"
            :tipo="documentoTipo.toLowerCase().replace(/\s+/g, '')"
            :empresaId="empresas.currentEmpresaId"
            :trabajadorId="trabajadores.currentTrabajadorId"
            :documentoId="documentoId"
            :userId="user._id"
            :getPdfMetadata="construirRutaYNombrePDF"
            @regenerado="manejarRegeneracionDesdePadre"
            @close="mostrarModalPdfEliminado = false"
        />
    </transition>

    <div
        class="ring-1 ring-gray-200 border-t-0 bg-white hover:bg-gray-50 shadow-lg flex justify-between items-center md:p-2 transition-transform duration-300 ease-in-out cursor-pointer">
        <div class="flex items-center">
            <div v-if="typeof antidoping === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, antidoping, 'Antidoping')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full" @click="abrirPdf(
                    `${antidoping.rutaPDF}`,
                    `Antidoping ${convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping)}.pdf`)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">Antidoping</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping) }}</p>
                    </div>
                    <div class="flex gap-2 md-lg:block hidden">
                        <div class="w-72">
                            <p class="leading-5 text-sm px-1">Resultados:</p>
                            <p v-if="positivos" class="leading-5 font-semibold text-red-500 px-1">Positivo</p>
                            <p v-else-if="mensajeNegativo" class="leading-5 font-semibold text-gray-800 px-1">
                                {{ mensajeNegativo }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="typeof aptitud === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, aptitud, 'Aptitud')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full" @click="abrirPdf(
                    `${aptitud.rutaPDF}`,
                    `Aptitud ${convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto)}.pdf`)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">Aptitud al Puesto</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto) }}</p>
                    </div>
                    <div class="flex gap-2 md-lg:block hidden">
                        <div class="w-72">
                            <p class="leading-5 text-sm px-1">Resultado:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="aptitud.aptitudPuesto === 'No Apto' ? 'text-red-500' : 'text-gray-800'">{{
                                    aptitud.aptitudPuesto }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="typeof certificado === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, certificado, 'Certificado')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full" @click="abrirPdf(
                    `${certificado.rutaPDF}`,
                    `Certificado ${convertirFechaISOaDDMMYYYY(certificado.fechaCertificado)}.pdf`)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">Certificado</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(certificado.fechaCertificado) }}</p>
                    </div>
                    <div class="flex gap-2 md-lg:block hidden">
                        <div class="w-72">
                            <p class="leading-5 text-sm px-1">Impedimentos Físicos:</p>
                            <p class="leading-5 font-semibold px-1"
                                :class="certificado.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'text-gray-800' : 'text-red-500'">
                                {{ certificado.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'No presenta impedimentos físicos' :
                                certificado.impedimentosFisicos }}
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            <div v-if="typeof documentoExterno === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, documentoExterno, 'Documento Externo')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full" @click="abrirDocumentoExterno(documentoExterno)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">{{ documentoExterno.nombreDocumento }}</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(documentoExterno.fechaDocumento) }}</p>
                    </div>
                    <div class="flex gap-2 md-lg:block hidden">
                        <div class="min-w-72">
                            <p class="leading-5 text-sm px-1">Notas:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1">
                                {{ documentoExterno.notasDocumento.trim() !== '' &&
                                    documentoExterno.notasDocumento.trim()
                                    !== 'undefined' ?
                                    documentoExterno.notasDocumento : 'Sin notas'
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="typeof examenVista === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, examenVista, 'Examen Vista')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full" @click="abrirPdf(
                    `${examenVista.rutaPDF}`,
                    `Examen Vista ${convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista)}.pdf`)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">Examen de la Vista</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista) }}</p>
                    </div>
                    <div v-if="!examenVista.ojoIzquierdoLejanaConCorreccion && !examenVista.ojoDerechoLejanaConCorreccion"
                        class="flex gap-2 md-lg:block hidden">
                        <div class="w-72 md-lg:block hidden">
                            <p class="leading-5 text-sm px-1">Resultados:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="examenVista.sinCorreccionLejanaInterpretacion === 'Visión moderadamente reducida' || examenVista.sinCorreccionLejanaInterpretacion === 'Visión significativamente reducida' || examenVista.sinCorreccionLejanaInterpretacion === 'Visión muy reducida' ? 'text-red-500' : 'text-gray-800'">
                                {{ examenVista.sinCorreccionLejanaInterpretacion }}</p>
                        </div>
                    </div>
                    <div v-else class="flex gap-2">
                        <div class="w-72 md-lg:block hidden">
                            <p class="leading-5 text-sm px-1">Resultados:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1">{{
                                examenVista.conCorreccionLejanaInterpretacion }} corregida</p>
                        </div>
                    </div>
                    <div class="flex gap-2 2xl:block hidden">
                        <div class="w-72">
                            <p class="leading-5 text-sm px-1">Requiere Lentes:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="examenVista.requiereLentesUsoGeneral === 'Si' ? 'text-red-500' : 'text-gray-800'">
                                {{
                                    examenVista.requiereLentesUsoGeneral }}</p>
                        </div>
                    </div>
                    <div class="flex gap-2 xl:block hidden">
                        <div class="w-72">
                            <p class="leading-5 text-sm px-1">Ishihara:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="examenVista.porcentajeIshihara < 80 ? 'text-red-500' : 'text-gray-800'">{{
                                    examenVista.porcentajeIshihara }}% - {{ examenVista.interpretacionIshihara }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="typeof exploracionFisica === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, exploracionFisica, 'Exploracion Fisica')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full"
                    @click="abrirPdf(`${exploracionFisica.rutaPDF}`, `Exploracion Fisica ${convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica)}.pdf`)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">Exploración Física</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica) }}</p>
                    </div>
                    <div class="flex gap-2">
                        <div class="w-72 xl:block hidden">
                            <p class="leading-5 text-sm px-1">Categoría IMC:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="exploracionFisica.indiceMasaCorporal >= 30 ? 'text-red-500' : 'text-gray-800'">
                                {{
                                    exploracionFisica.indiceMasaCorporal }} - {{ exploracionFisica.categoriaIMC }}</p>
                        </div>
                        <div class="w-72 2xl:block hidden">
                            <p class="leading-5 text-sm px-1">Tension Arterial:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="exploracionFisica.categoriaTensionArterial === 'Hipertensión moderada' || exploracionFisica.categoriaTensionArterial === 'Hipertensión severa' ? 'text-red-500' : 'text-gray-800'">
                                {{ exploracionFisica.categoriaTensionArterial }}</p>
                        </div>
                        <div class="w-72 md-lg:block hidden">
                            <p class="leading-5 text-sm px-1">Resumen:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sano' || exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sana' ? 'text-gray-800' : 'text-red-500'">
                                {{ exploracionFisica.resumenExploracionFisica }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="typeof historiaClinica === 'object'"
                class="my-1 mx-1 flex gap-2 items-center h-full cursor-pointer">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, historiaClinica, 'Historia Clinica')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full cursor-pointer" @click="abrirPdf(
                    `${historiaClinica.rutaPDF}`,
                    `Historia Clinica ${convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica)}.pdf`)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">Historia Clinica</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica) }}</p>
                    </div>
                    <div class="flex gap-2">
                        <div class="w-72 xl:block hidden">
                            <p class="leading-5 text-sm px-1">Evaluacion:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1">{{ historiaClinica.motivoExamen }}</p>
                        </div>
                        <div class="w-72 2xl:block hidden">
                            <p class="leading-5 text-sm px-1">Accidente Laboral:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="historiaClinica.accidenteLaboralEspecificar !== 'Niega haber sufrido accidentes' ? 'text-red-500' : 'text-gray-800'">
                                {{ historiaClinica.accidenteLaboralEspecificar }}</p>
                        </div>
                        <div class="w-72 md-lg:block hidden">
                            <p class="leading-5 text-sm px-1">Resumen:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1"
                                :class="historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomático' || historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomática' ? 'text-gray-800' : 'text-red-500'">
                                {{ historiaClinica.resumenHistoriaClinica }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="typeof notaMedica === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="ml-1">
                    <input
                        class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                        type="checkbox" :checked="isSelected"
                        @change="(event) => handleCheckboxChange(event, notaMedica, 'Nota Medica')">
                </div>
                <div class="my-1 mx-1 flex gap-2 items-center h-full" @click="abrirPdf(
                    `${notaMedica.rutaPDF}`,
                    `Nota Medica ${convertirFechaISOaDDMMYYYY(notaMedica.fechaNotaMedica)}.pdf`)">
                    <div class="min-w-18 sm:min-w-44">
                        <p class="leading-5 text-sm sm:text-xl font-medium">Nota Medica</p>
                        <p class="leading-5 text-xs sm:text-base text-gray-500">{{
                            convertirFechaISOaDDMMYYYY(notaMedica.fechaNotaMedica) }}</p>
                    </div>
                    <div v-if="notaMedica.diagnostico"
                        class="flex gap-2 md-lg:block hidden">
                        <div class="w-72 md-lg:block hidden">
                            <p class="leading-5 text-sm px-1">IDX:</p>
                            <p class="leading-5 font-semibold text-gray-800 px-1">
                                {{ notaMedica.diagnostico }}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>



        <div class="flex gap-1 sm:gap-1 md:gap-2 lg:gap-4 mx-2">
            <!-- Botón de descarga dinámico -->
            <template v-for="(documento, key) in {
                'Antidoping': antidoping,
                'Aptitud': aptitud,
                'Certificado': certificado,
                'Documento Externo': documentoExterno,
                'Examen Vista': examenVista,
                'Exploracion Fisica': exploracionFisica,
                'Historia Clinica': historiaClinica,
                'Nota Medica': notaMedica
            }" :key="key">
                <button v-if="documento && documento.rutaDocumento" @click="descargarArchivo(documento, key)"
                    type="button"
                    class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-transform duration-300 ease-in-out transform hover:scale-110 shadow-sm z-5">
                    <i class="fa-solid fa-download fa-lg"></i>
                </button>
                <button v-if="documento && documento.rutaPDF" @click="descargarArchivo(documento, key)" type="button"
                    class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-transform duration-300 ease-in-out transform hover:scale-110 shadow-sm z-5">
                    <i class="fa-solid fa-download fa-lg"></i>
                </button>
            </template>

            <button v-if="documentoTipo === 'documentoExterno'" type="button"
                class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm z-5"
                @click="async () => {
                    await documentos.fetchDocumentById(documentoTipo, trabajadores.currentTrabajador._id, documentoExterno._id);
                    $emit('abrirModalUpdate');
                }">
                <i class="fa-regular fa-pen-to-square fa-lg"></i>
            </button>
            <button v-else type="button" @click="editarDocumento(documentoId, documentoTipo)"
                class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm z-5">
                <i class="fa-regular fa-pen-to-square fa-lg"></i>
            </button>

            <button type="button" @click="$emit('eliminarDocumento', documentoId, documentoNombre, documentoTipo)"
                class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm z-5">
                <i class="fa-solid fa-trash-can fa-lg"></i>
            </button>

        </div>
    </div>

    <!-- Visor de PDF -->
    <div v-if="showPdfViewer"
        class="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-center z-50"
        @click.self="cerrarPdf">
        <!-- Botón para cerrar, en el fondo -->
        <div class="absolute top-2 right-2">
            <button class="bg-red-600 text-white text-sm px-4 py-2 rounded shadow-lg hover:bg-red-500 transition"
                @click="cerrarPdf">
                Cerrar
            </button>
        </div>

        <!-- Contenedor del visor de PDF -->
        <div :style="{ width: '90%', height: '90%' }" class="bg-white rounded shadow-lg relative">
            <VPdfViewer :src="pdfUrl" :initialThumbnails-visible="initialThumbnailsVisible" :initialScale="initialScale"
                locale="customLang" :localization="localization" />
        </div>
    </div>

    <!-- Visor de Imágenes -->
    <div v-if="showImageViewer"
        class="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex justify-center items-center z-50"
        @click.self="cerrarImagen">
        <!-- Botón para cerrar -->
        <div class="absolute top-2 right-2">
            <button class="bg-red-600 text-white text-sm px-4 py-2 rounded shadow-lg hover:bg-red-500 transition"
                @click="cerrarImagen">
                Cerrar
            </button>
        </div>

        <!-- Contenedor de la imagen -->
        <div class="relative bg-white rounded shadow-lg">
            <h1 class="text-2xl text-center text-gray-800 p-2">Documento Externo</h1>
            <hr>
            <img :src="imageUrl" alt="Vista previa del documento" class="max-w-full max-h-screen rounded" />
        </div>
    </div>

</template>

<style>
@media (max-width: 768px) {
    /* Pantallas pequeñas (sm) */
}

@media (min-width: 768px) and (max-width: 1024px) {
    /* Pantallas medianas (md) */
}

@media (min-width: 1024px) and (max-width: 1280px) {
    /* Pantallas grandes (md) */
}

@media (min-width: 1280px) {
    /* Pantallas extra grandes (xl) */
}
</style>