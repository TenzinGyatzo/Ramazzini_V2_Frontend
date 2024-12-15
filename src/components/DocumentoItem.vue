<script setup>
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';
import { ref } from 'vue';
import { VPdfViewer, Locales, useLicense } from '@vue-pdf-viewer/viewer';
import { useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';

const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();

const editarDocumento = (documentoId, documentoTipo) => {
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

// If the value is empty or incorrect, the watermark will remain.
const licenseKey = import.meta.env.VITE_VPV_LICENSE ?? '102d64ec-006b-4fd6-8850-a00a050703ad';

// useLicense must be used here to ensure proper license 
// initialization before the component renders.
useLicense({ licenseKey });

// Estados para mostrar el visor y la URL del PDF
const showPdfViewer = ref(false);
const pdfUrl = ref('');
const customLang = ref("es_MX");

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

// Función para abrir el visor con una ruta dinámica
const abrirPdf = async (ruta) => {
    const fullPath = `/${ruta}`; // Construir la ruta absoluta

    try {
        // Verificar si el archivo existe y es un PDF
        const response = await fetch(fullPath, { method: 'HEAD' });

        if (response.ok && response.headers.get('Content-Type') === 'application/pdf') {
            // Si el archivo existe y es un PDF, abrir el visor
            pdfUrl.value = fullPath;
            showPdfViewer.value = true;
        } else {
            // Si no es un PDF o no existe, mostrar alerta
            alert('El archivo PDF no existe o no es válido.');
        }
    } catch (error) {
        // Manejo de errores de red u otros problemas
        alert('Ocurrió un error al intentar cargar el archivo PDF.');
    }
};

// Función para cerrar el visor
const cerrarPdf = () => {
    showPdfViewer.value = false;
    pdfUrl.value = '';
};

defineProps({
    documentoId: {
        type: String,
        required: true,
    },
    documentoTipo: {
        type: String,
        required: true,
    },
    antidoping: [Object, String],
    aptitud: [Object, String],
    certificado: [Object, String],
    documentoExterno: [Object, String],
    examenVista: [Object, String],
    exploracionFisica: [Object, String],
    historiaClinica: [Object, String]
});

defineEmits(['eliminarDocumento']);

</script>

<template>
    <div
        class="ring-1 ring-gray-200 border-t-0 bg-white hover:bg-gray-50 shadow-lg flex justify-between items-center p-2 transition-transform duration-300 ease-in-out cursor-pointer">
        <div class="flex items-center">
            <div class="mx-2">
                <input
                    class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150 z-10"
                    type="checkbox" name="" id="">
            </div>
            <div v-if="typeof antidoping === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="min-w-32 sm:min-w-44">
                    <p class="leading-5 text-lg sm:text-xl font-medium">Antidoping</p>
                    <p class="leading-5 text-sm sm:text-base text-gray-500">{{
                        convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping) }}</p>
                </div>
                <div class="flex gap-2 md-lg:block hidden">
                    <div class="w-72">
                        <p class="leading-5 text-sm px-1">Resultados:</p>
                        <p v-if="antidoping.marihuana === 'Positivo' || antidoping.cocaina === 'Positivo' || antidoping.anfetaminas === 'Positivo' || antidoping.metanfetaminas === 'Positivo' || antidoping.opiaceos === 'Positivo'"
                            class="leading-5 font-semibold text-red-500 px-1">Positivo</p>
                        <p v-else class="leading-5 font-semibold text-gray-800 px-1"> Negativo a cinco parámetros</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof aptitud === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="min-w-32 sm:min-w-44">
                    <p class="leading-5 text-lg sm:text-xl font-medium">Aptitud al Puesto</p>
                    <p class="leading-5 text-sm sm:text-base text-gray-500">{{
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

            <div v-if="typeof certificado === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="min-w-32 sm:min-w-44">
                    <p class="leading-5 text-lg sm:text-xl font-medium">Certificado</p>
                    <p class="leading-5 text-sm sm:text-base text-gray-500">{{
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

            <div v-if="typeof documentoExterno === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="min-w-32 sm:min-w-44">
                    <p class="leading-5 text-lg sm:text-xl font-medium">{{ documentoExterno.nombreDocumento }}</p>
                    <p class="leading-5 text-sm sm:text-base text-gray-500">{{
                        convertirFechaISOaDDMMYYYY(documentoExterno.fechaDocumento) }}</p>
                </div>
                <div class="flex gap-2 md-lg:block hidden">
                    <div class="min-w-72">
                        <p class="leading-5 text-sm px-1">Notas:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">
                            {{ documentoExterno.notasDocumento && documentoExterno.notasDocumento.trim() !== '' ?
                                documentoExterno.notasDocumento : 'Presionar editar para agregar notas &nbsp&nbsp --->'
                            }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="typeof examenVista === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="min-w-30 sm:min-w-44">
                    <p class="leading-5 text-lg sm:text-xl font-medium">Examen de la Vista</p>
                    <p class="leading-5 text-sm sm:text-base text-gray-500">{{
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
                            :class="examenVista.requiereLentesUsoGeneral === 'Si' ? 'text-red-500' : 'text-gray-800'">{{
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

            <div v-if="typeof exploracionFisica === 'object'" class="my-1 mx-1 flex gap-2 items-center h-full">
                <div class="min-w-30 sm:min-w-44">
                    <p class="leading-5 text-lg sm:text-xl font-medium">Exploración Física</p>
                    <p class="leading-5 text-sm sm:text-base text-gray-500">{{
                        convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica) }}</p>
                </div>
                <div class="flex gap-2">
                    <div class="w-72 xl:block hidden">
                        <p class="leading-5 text-sm px-1">Categoría IMC:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1"
                            :class="exploracionFisica.indiceMasaCorporal >= 30 ? 'text-red-500' : 'text-gray-800'">{{
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

            <div v-if="typeof historiaClinica === 'object'"
                class="my-1 mx-1 flex gap-2 items-center h-full cursor-pointer"
                @click="abrirPdf(`${historiaClinica.rutaPDF}`)">
                <div class="min-w-30 sm:min-w-44">
                    <p class="leading-5 text-lg sm:text-xl font-medium">Historia Clínica</p>
                    <p class="leading-5 text-sm sm:text-base text-gray-500">{{
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

        <div class="flex gap-1 sm:gap-1 md:gap-2 lg:gap-4 mx-2">
            <button type="button"
                class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm z-10">
                <i class="fa-solid fa-download fa-lg"></i>
            </button>
            <button type="button" @click="editarDocumento(documentoId, documentoTipo)"
                class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm z-10">
                <i class="fa-regular fa-pen-to-square fa-lg"></i>
            </button>

            <button type="button" @click="$emit('eliminarDocumento', documentoId, documentoNombre, documentoTipo)"
                class="py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm z-10">
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
            <VPdfViewer :src="pdfUrl" :initialThumbnails-visible="true" :initialScale="2" locale="customLang"
                :localization="localization" />
        </div>
    </div>

</template>
