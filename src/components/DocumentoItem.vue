<script setup>
import axios from 'axios';
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { VPdfViewer, Locales, useLicense } from '@vue-pdf-viewer/viewer';
import { useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useDocumentosStore } from '@/stores/documentos';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { obtenerRutaDocumento, obtenerNombreArchivo, obtenerFechaDocumento, obtenerNombreDescargaCertificadoExpedito } from '@/helpers/rutas.ts';
import ModalPdfEliminado from './ModalPdfEliminado.vue';
import { useUserPermissions } from '@/composables/useUserPermissions';
import { usePermissionRestrictions } from '@/composables/usePermissionRestrictions';

const router = useRouter();

// Función para obtener el color según el resultado del cuestionario
const getResultadoCuestionarioColor = (resultado, resultadoPersonalizado) => {
  if (!resultado) {
    // Si no hay resultado pero hay texto personalizado, usar color gris
    if (resultadoPersonalizado) {
      return 'gray';
    }
    return 'gray';
  }
  
  const resultadoLower = resultado.toLowerCase();
  
  if (resultadoLower === 'procedente') {
    return 'green';
  } else if (resultadoLower === 'procedente con precaución') {
    return 'yellow';
  } else if (resultadoLower === 'no procedente') {
    return 'red';
  } else if (resultadoLower === 'otro') {
    return 'gray'; // Color gris para resultado personalizado
  }
  
  return 'gray';
};

const getResultadoCuestionarioTextoCorto = (resultado, resultadoPersonalizado) => {
  if (!resultado) return '';
  
  const resultadoLower = resultado.toLowerCase();
  
  // Si es "OTRO" y hay texto personalizado, mostrar el texto personalizado
  if (resultadoLower === 'otro' && resultadoPersonalizado) {
    return 'PERSONALIZADO';
  }
  
  // Si el resultado está vacío pero hay texto personalizado, mostrar el texto personalizado
  if (!resultado && resultadoPersonalizado) {
    return 'PERSONALIZADO';
  }
  
  // Para otros casos, mostrar el resultado normal
  return resultado.toUpperCase();
};

// Función para obtener el texto a mostrar del resultado
const getResultadoCuestionarioTexto = (resultado, resultadoPersonalizado) => {
  if (!resultado) return '';
  
  const resultadoLower = resultado.toLowerCase();
  
  // Si es "OTRO" y hay texto personalizado, mostrar el texto personalizado
  if (resultadoLower === 'otro' && resultadoPersonalizado) {
    return resultadoPersonalizado.toUpperCase();
  }
  
  // Si el resultado está vacío pero hay texto personalizado, mostrar el texto personalizado
  if (!resultado && resultadoPersonalizado) {
    return resultadoPersonalizado.toUpperCase();
  }
  
  // Para otros casos, mostrar el resultado normal
  return resultado.toUpperCase();
};

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const documentos = useDocumentosStore();
const proveedorSaludStore = useProveedorSaludStore();

const periodoDePruebaFinalizado = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado;
const estadoSuscripcion = proveedorSaludStore.proveedorSalud?.estadoSuscripcion;
const finDeSuscripcion = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

// Composables de permisos
const { canCreateDocument } = useUserPermissions();
const { 
  canManageDocumentosDiagnostico, 
  canManageDocumentosEvaluacion, 
  canManageDocumentosExternos,
  canManageCuestionariosAdicionales,
  executeIfCanManageDocumentosDiagnostico,
  executeIfCanManageDocumentosEvaluacion,
  executeIfCanManageDocumentosExternos,
  executeIfCanManageCuestionariosAdicionales
} = usePermissionRestrictions();

const mostrarModalPdfEliminado = ref(false);

// Estado para verificar disponibilidad del PDF
const pdfDisponible = ref(true);
const verificandoPDF = ref(false);

const emit = defineEmits(['eliminarDocumento', 'abrirModalUpdate', 'closeModalUpdate', 'openSubscriptionModal']);

// Función para determinar si se puede editar un documento según su tipo
const canEditDocument = (documentType) => {
  const tipoSinEspacios = documentType.toLowerCase().replace(/\s+/g, '');
  
  // Documentos de diagnóstico y certificación (solo aptitud y certificado)
  if (['aptitud', 'certificado'].includes(tipoSinEspacios)) {
    return canManageDocumentosDiagnostico.value;
  }
  
  // Cuestionarios adicionales (incluye certificadoExpedito)
  if (['controlprenatal', 'historiaotologica', 'previoespirometria', 'certificadoexpedito'].includes(tipoSinEspacios)) {
    return canManageCuestionariosAdicionales.value;
  }
  
  // Documentos externos
  if (tipoSinEspacios === 'documentoexterno') {
    return canManageDocumentosExternos.value;
  }
  
  // Documentos de evaluación (resto de documentos)
  return canManageDocumentosEvaluacion.value;
};

// Función para determinar si se puede eliminar un documento según su tipo
const canDeleteDocument = (documentType) => {
  return canEditDocument(documentType); // Mismo permiso para editar y eliminar
};

// Función para manejar la edición con validación de permisos
const handleEditDocument = (documentoId, documentoTipo) => {
  const tipoSinEspacios = documentoTipo.toLowerCase().replace(/\s+/g, '');
  
  if (['aptitud', 'certificado'].includes(tipoSinEspacios)) {
    executeIfCanManageDocumentosDiagnostico(() => {
      editarDocumento(documentoId, documentoTipo);
    }, 'editar documentos de diagnóstico y certificación');
  } else if (['controlprenatal', 'historiaotologica', 'previoespirometria', 'certificadoexpedito'].includes(tipoSinEspacios)) {
    executeIfCanManageCuestionariosAdicionales(() => {
      editarDocumento(documentoId, documentoTipo);
    }, 'editar cuestionarios adicionales');
  } else if (tipoSinEspacios === 'documentoexterno') {
    executeIfCanManageDocumentosExternos(() => {
      editarDocumento(documentoId, documentoTipo);
    }, 'editar documentos externos');
  } else {
    executeIfCanManageDocumentosEvaluacion(() => {
      editarDocumento(documentoId, documentoTipo);
    }, 'editar documentos de evaluación');
  }
};

// Función para manejar la edición de documentos externos con validación de permisos
const handleEditDocumentoExterno = async () => {
  executeIfCanManageDocumentosExternos(async () => {
    await documentos.fetchDocumentById(props.documentoTipo, trabajadores.currentTrabajador._id, props.documentoExterno._id);
    emit('abrirModalUpdate');
  }, 'editar documentos externos');
};

// Función para manejar la eliminación con validación de permisos
const handleDeleteDocument = (documentoId, documentoNombre, documentoTipo) => {
  const tipoSinEspacios = documentoTipo.toLowerCase().replace(/\s+/g, '');
  
  if (['aptitud', 'certificado'].includes(tipoSinEspacios)) {
    executeIfCanManageDocumentosDiagnostico(() => {
      emit('eliminarDocumento', documentoId, documentoNombre, documentoTipo);
    }, 'eliminar documentos de diagnóstico y certificación');
  } else if (['controlprenatal', 'historiaotologica', 'previoespirometria', 'certificadoexpedito'].includes(tipoSinEspacios)) {
    executeIfCanManageCuestionariosAdicionales(() => {
      emit('eliminarDocumento', documentoId, documentoNombre, documentoTipo);
    }, 'eliminar cuestionarios adicionales');
  } else if (tipoSinEspacios === 'documentoexterno') {
    executeIfCanManageDocumentosExternos(() => {
      emit('eliminarDocumento', documentoId, documentoNombre, documentoTipo);
    }, 'eliminar documentos externos');
  } else {
    executeIfCanManageDocumentosEvaluacion(() => {
      emit('eliminarDocumento', documentoId, documentoNombre, documentoTipo);
    }, 'eliminar documentos de evaluación');
  }
};

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

        // Para Certificado Expedito, usar el nombre personalizado para la descarga
        let nombreArchivo;
        let nombreArchivoReal;
        
        if (tipoDocumento === 'Certificado Expedito') {
            nombreArchivo = obtenerNombreDescargaCertificadoExpedito(fecha, trabajadores.currentTrabajador);
            nombreArchivoReal = obtenerNombreArchivo(documento, tipoDocumento, fecha);
        } else {
            nombreArchivo = obtenerNombreArchivo(documento, tipoDocumento, fecha);
            nombreArchivoReal = nombreArchivo;
        }

        await descargarYGuardarArchivo(ruta, nombreArchivo, nombreArchivoReal);

    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        alert('Ocurrió un error al intentar descargar el archivo.');
    }
};

const descargarYGuardarArchivo = async (ruta, nombreArchivo, nombreArchivoReal) => {
    try {
        // Usar el nombre real del archivo para construir la URL (el que existe en el servidor)
        const urlCompleta = `${BASE_URL}/${ruta}/${nombreArchivoReal}`;

        const response = await axios.get(encodeURI(urlCompleta), {
            responseType: 'blob',
        });

        const blob = response.data;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // Usar el nombre personalizado para el atributo download
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

const abrirPdf = async (ruta, nombrePDF, updatedAt = null) => {
    // Sanear la ruta y el nombre del archivo para eliminar dobles diagonales
    const sanitizedRuta = ruta.replace(/\/+/g, '/'); // Reemplaza múltiples '/' por una sola
    const sanitizedNombrePDF = nombrePDF.replace(/\/+/g, '/'); // Reemplaza múltiples '/' por una sola

    // Generar la URL de forma explícita usando `new URL`
    let fullPath = new URL(`${sanitizedRuta}/${sanitizedNombrePDF}`, import.meta.env.VITE_API_URL);
    
    // Agregar parámetro de cache-busting para evitar que se muestre versión cacheada del PDF
    // Si updatedAt está disponible, usarlo; si no, usar timestamp actual
    const cacheBuster = updatedAt || Date.now();
    fullPath.searchParams.set('t', cacheBuster.toString());
    
    // console.log('Ruta completa del PDF:', fullPath.href);

    try {
        const response = await axios.get(fullPath.href, { responseType: 'blob' }); // Solicitud GET

        const contentType = response.headers['content-type'];

        if (response.status === 200 && contentType === 'application/pdf') {
            pdfUrl.value = fullPath.href; // Actualiza tu variable de URL
            currentPdfUrl.value = fullPath.href; // Guarda la URL actual para descargar/imprimir
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
        const updatedAt = documento.updatedAt ? new Date(documento.updatedAt).getTime() : null;
        abrirPdf(documento.rutaDocumento, `${documento.nombreDocumento} ${convertirFechaISOaDDMMYYYY(documento.fechaDocumento)}.pdf`, updatedAt);
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
const imageZoom = ref(0.8); // Reducido de 1 a 0.8 para que las imágenes se vean más pequeñas por defecto
const rotationAngle = ref(0);
const currentPdfUrl = ref('');
const currentImageUrl = ref('');

// Estado para el pan (desplazamiento) de la imagen
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const imagePosition = ref({ x: 0, y: 0 });
const lastImagePosition = ref({ x: 0, y: 0 });

// Función para abrir el visor de imágenes
const abrirImagen = async (rutaCompleta) => {
    try {
        const response = await axios.head(rutaCompleta);

        if (response.status === 200 && response.headers['content-type'].startsWith('image/')) {
            imageUrl.value = rutaCompleta;
            currentImageUrl.value = rutaCompleta; // Guarda la URL actual para descargar
            showImageViewer.value = true;
            
            // Agregar event listeners globales para el arrastre
            nextTick(() => {
                document.addEventListener('mousemove', handleGlobalMouseMove);
                document.addEventListener('mouseup', handleGlobalMouseUp);
                // Agregar event listener para ESC
                document.addEventListener('keydown', handleKeyDown);
            });
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
    imageZoom.value = 0.8; // Mantiene el zoom reducido al cerrar
    rotationAngle.value = 0; // Resetea la rotación al cerrar
    // Resetear posición de la imagen
    imagePosition.value = { x: 0, y: 0 };
    lastImagePosition.value = { x: 0, y: 0 };
    
    // Resetear estado de arrastre y cursor
    isDragging.value = false;
    document.body.style.cursor = 'default';
    
    // Remover event listeners globales
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    document.removeEventListener('keydown', handleKeyDown);
};

// Funciones para controles de imagen
const rotarImagen = () => {
    rotationAngle.value += 90;
    // No usamos módulo para mantener la rotación continua en la misma dirección
};

const zoomIn = () => {
    imageZoom.value = Math.min(imageZoom.value * 1.2, 5);
};

const zoomOut = () => {
    const newZoom = Math.max(imageZoom.value / 1.2, 0.4);
    imageZoom.value = newZoom;
    
    // Solo resetear posición si el zoom es menor o igual a 1 Y la imagen está desplazada
    if (newZoom <= 1 && (imagePosition.value.x !== 0 || imagePosition.value.y !== 0)) {
        // Solo resetear posición, no el zoom
        imagePosition.value = { x: 0, y: 0 };
        lastImagePosition.value = { x: 0, y: 0 };
    }
};

const handleImageWheel = (event) => {
    event.preventDefault();
    if (event.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
};

// Event listener global para el mouse
const handleGlobalMouseMove = (event) => {
    if (isDragging.value) {
        onDrag(event);
    }
};

const handleGlobalMouseUp = (event) => {
    if (isDragging.value) {
        stopDrag(event);
    }
    
    // Asegurar que el cursor se restaure correctamente
    document.body.style.cursor = 'default';
};

// Funciones para el pan (desplazamiento) de la imagen
const startDrag = (event) => {
    // Prevenir el comportamiento de arrastre por defecto del navegador
    event.preventDefault();
    
    // Removida la limitación del zoom - ahora se puede arrastrar en cualquier zoom
    isDragging.value = true;
    dragStart.value = {
        x: event.clientX - imagePosition.value.x,
        y: event.clientY - imagePosition.value.y
    };
    
    // Cambiar cursor
    event.target.style.cursor = 'grabbing';
};

const onDrag = (event) => {
    if (!isDragging.value) return; // Removida la limitación del zoom
    
    // Prevenir el comportamiento de arrastre por defecto del navegador
    event.preventDefault();
    
    imagePosition.value = {
        x: event.clientX - dragStart.value.x,
        y: event.clientY - dragStart.value.y
    };
};

const stopDrag = (event) => {
    if (!isDragging.value) return;
    
    // Prevenir el comportamiento de arrastre por defecto del navegador
    if (event) {
        event.preventDefault();
    }
    
    isDragging.value = false;
    lastImagePosition.value = { ...imagePosition.value };
    
    // Restaurar cursor en todos los elementos de imagen
    const imageElements = document.querySelectorAll('.image-viewer img');
    imageElements.forEach(element => {
        element.style.cursor = 'grab';
    });
    
    // También restaurar el cursor en el documento
    document.body.style.cursor = 'default';
};

// Función para resetear la posición de la imagen
const resetImagePosition = () => {
    imagePosition.value = { x: 0, y: 0 };
    lastImagePosition.value = { x: 0, y: 0 };
    // Resetear también el zoom al valor inicial
    imageZoom.value = 0.8;
};

// Función para manejar cuando el mouse sale de la imagen
const handleMouseLeave = (event) => {
    // Solo cambiar el cursor si no estamos arrastrando
    if (!isDragging.value) {
        event.target.style.cursor = 'default';
    }
};

// Funciones para controles de PDF
const descargarPdfActual = async () => {
    if (currentPdfUrl.value) {
        try {
            // Determinar qué documento está siendo visualizado
            const tipoSinEspacios = props.documentoTipo.toLowerCase().replace(/\s+/g, '');
            let documento = null;
            let tipoDocumento = '';
            
            // Identificar el documento actual basado en el tipo
            switch (tipoSinEspacios) {
                case 'antidoping':
                    documento = props.antidoping;
                    tipoDocumento = 'Antidoping';
                    break;
                case 'aptitud':
                    documento = props.aptitud;
                    tipoDocumento = 'Aptitud';
                    break;
                case 'constanciaaptitud':
                    documento = props.constanciaAptitud;
                    tipoDocumento = 'Constancia de Aptitud';
                    break;
                case 'audiometria':
                    documento = props.audiometria;
                    tipoDocumento = 'Audiometria';
                    break;
                case 'certificado':
                    documento = props.certificado;
                    tipoDocumento = 'Certificado';
                    break;
                case 'certificadoexpedito':
                    documento = props.certificadoExpedito;
                    tipoDocumento = 'Certificado Expedito';
                    break;
                case 'examenvista':
                    documento = props.examenVista;
                    tipoDocumento = 'Examen Vista';
                    break;
                case 'exploracionfisica':
                    documento = props.exploracionFisica;
                    tipoDocumento = 'Exploracion Fisica';
                    break;
                case 'historiaclinica':
                    documento = props.historiaClinica;
                    tipoDocumento = 'Historia Clinica';
                    break;
                case 'notamedica':
                    documento = props.notaMedica;
                    tipoDocumento = 'Nota Medica';
                    break;
                case 'controlprenatal':
                    documento = props.controlPrenatal;
                    tipoDocumento = 'Control Prenatal';
                    break;
                case 'historiaotologica':
                    documento = props.historiaOtologica;
                    tipoDocumento = 'Historia Otologica';
                    break;
                case 'previoespirometria':
                    documento = props.previoEspirometria;
                    tipoDocumento = 'Previo Espirometria';
                    break;
                case 'documentoexterno':
                    documento = props.documentoExterno;
                    tipoDocumento = 'Documento Externo';
                    break;
            }
            
            if (documento) {
                // Usar la misma lógica que descargarArchivo
                await descargarArchivo(documento, tipoDocumento);
            } else {
                // Fallback al método original si no se puede identificar el documento
                const response = await axios.get(currentPdfUrl.value, { responseType: 'blob' });
                const blob = response.data;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'documento.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            console.error('Error al descargar el PDF:', error);
            alert('Error al descargar el PDF');
        }
    }
};

const imprimirPdfActual = () => {
    if (currentPdfUrl.value) {
        const printWindow = window.open(currentPdfUrl.value, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    }
};

const descargarImagenActual = async () => {
    if (currentImageUrl.value) {
        try {
            // Para documentos externos que son imágenes, usar el nombre original
            if (props.documentoExterno && props.documentoTipo.toLowerCase().replace(/\s+/g, '') === 'documentoexterno') {
                const extension = obtenerExtensionArchivo(props.documentoExterno);
                const nombreArchivo = `${props.documentoExterno.nombreDocumento} ${convertirFechaISOaDDMMYYYY(props.documentoExterno.fechaDocumento)}.${extension}`;
                
                const response = await axios.get(currentImageUrl.value, { responseType: 'blob' });
                const blob = response.data;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = nombreArchivo;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } else {
                // Fallback para otros casos
                const response = await axios.get(currentImageUrl.value, { responseType: 'blob' });
                const blob = response.data;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'imagen.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            console.error('Error al descargar la imagen:', error);
            alert('Error al descargar la imagen');
        }
    }
};

const handleCheckboxChange = (event, documento, tipoDocumento) => {
    const isChecked = event.target.checked;
    const rutaBase = obtenerRutaDocumento(documento, tipoDocumento); // Define cómo obtener la ruta del documento

    const fecha = obtenerFechaDocumento(documento) || 'SinFecha';
    const nombreArchivo = obtenerNombreArchivo(documento, tipoDocumento, fecha, trabajadores.currentTrabajador);

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
    // Nueva prop para el modo eliminación
    isDeletionMode: {
        type: Boolean,
        default: false,
    },
    antidoping: [Object, String],
    aptitud: [Object, String],
    audiometria: [Object, String],
    constanciaAptitud: [Object, String],
    certificado: [Object, String],
    certificadoExpedito: [Object, String],
    receta: [Object, String],
    documentoExterno: [Object, String],
    examenVista: [Object, String],
    exploracionFisica: [Object, String],
    historiaClinica: [Object, String],
    notaMedica: [Object, String],
    controlPrenatal: [Object, String],
    historiaOtologica: [Object, String],
    previoEspirometria: [Object, String],
});

const { antidoping } = props; // Desestructuración para acceder a antidoping

// Computed para el indicador lateral
const indicadorLateral = computed(() => {
  // Verificando disponibilidad
  if (verificandoPDF.value) {
    return {
      class: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-orange-500 animate-pulse',
      title: 'Verificando disponibilidad del PDF...'
    };
  }
  
  // Modo Eliminación
  if (props.isDeletionMode) {
    // Si está seleccionado en modo eliminación, siempre rojo
    if (props.isSelected) {
      return {
        class: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-rose-600',
        title: 'Seleccionado para eliminar'
      };
    }
    
    // Si no está seleccionado, verde si está disponible, gris si no
    if (pdfDisponible.value) {
      return {
        class: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-green-600',
        title: 'PDF disponible'
      };
    } else {
      return {
        class: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-300 to-gray-300',
        title: 'No disponible'
      };
    }
  }
  
  // Modo Normal
  if (pdfDisponible.value) {
    return {
      class: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-green-600',
      title: 'PDF disponible'
    };
  }
  
  // Documento externo no disponible (solo en modo normal)
  if (props.documentoTipo.toLowerCase().replace(/\s+/g, '') === 'documentoexterno' && !pdfDisponible.value) {
    return {
      class: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-red-400',
      title: 'Documento externo no disponible'
    };
  }
  
  // PDF no disponible (modo normal)
  return {
    class: 'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-300 to-gray-300',
    title: 'PDF no disponible - Se puede regenerar'
  };
});

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
    verificarDisponibilidadPDF();
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
  'antidepresivosTriciclicos',
  'metilendioximetanfetamina',
  'ketamina'
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
    if (cantidad === 12) return 'Negativo a doce parámetros'
  }
  return null
})

// Mensaje detallado de sustancias positivas (similar a VisualizadorAptitud.vue)
const mensajeDetalladoAntidoping = computed(() => {
  if (!antidoping || typeof antidoping !== 'object') return null;

  // Contar cuántos parámetros están presentes
  const evaluados = parametros.filter(param => antidoping[param] !== undefined);

  // Evaluar si todos los evaluados son 'Negativo'
  const todosNegativos = evaluados.every(param => antidoping[param] === 'Negativo');

  if (todosNegativos) {
    const cantidadEnLetras = {
      5: 'cinco',
      6: 'seis',
      10: 'diez',
      12: 'doce'
    }[evaluados.length] || evaluados.length;

    return `Negativo a ${cantidadEnLetras} parámetros`;
  }

  // Si hay algún positivo, construir el mensaje con las sustancias correspondientes
  const sustanciasPositivas = [
    antidoping.marihuana !== 'Negativo' ? 'Marihuana' : null,
    antidoping.cocaina !== 'Negativo' ? 'Cocaína' : null,
    antidoping.anfetaminas !== 'Negativo' ? 'Anfetaminas' : null,
    antidoping.metanfetaminas !== 'Negativo' ? 'Metanfetaminas' : null,
    antidoping.opiaceos !== 'Negativo' ? 'Opiáceos' : null,
    antidoping.benzodiacepinas && antidoping.benzodiacepinas !== 'Negativo' ? 'Benzodiazepinas' : null,
    antidoping.fenciclidina && antidoping.fenciclidina !== 'Negativo' ? 'Fenciclidina' : null,
    antidoping.metadona && antidoping.metadona !== 'Negativo' ? 'Metadona' : null,
    antidoping.barbituricos && antidoping.barbituricos !== 'Negativo' ? 'Barbitúricos' : null,
    antidoping.antidepresivosTriciclicos && antidoping.antidepresivosTriciclicos !== 'Negativo' ? 'Antidepresivos Tricíclicos' : null,
    antidoping.metilendioximetanfetamina && antidoping.metilendioximetanfetamina !== 'Negativo' ? 'Metilendioximetanfetamina' : null,
    antidoping.ketamina && antidoping.ketamina !== 'Negativo' ? 'Ketamina' : null
  ].filter(Boolean).join(', '); // Filtrar valores nulos o `undefined` y unirlos en una cadena separada por comas

  return `Positivo a: ${sustanciasPositivas}`;
})
///////////////////////////////////////////

const construirRutaYNombrePDF = () => {
  const tipoSinEspacios = props.documentoTipo.toLowerCase().replace(/\s+/g, '');
  const doc = {
    'constanciaaptitud': props.constanciaAptitud,
    'antidoping': props.antidoping,
    'aptitud': props.aptitud, 
    'audiometria': props.audiometria,
    'certificado': props.certificado,
    'certificadoexpedito': props.certificadoExpedito,
    'receta': props.receta,
    'examenvista': props.examenVista,
    'exploracionfisica': props.exploracionFisica,
    'historiaclinica': props.historiaClinica,
    'notamedica': props.notaMedica,
    'controlprenatal': props.controlPrenatal,
    'historiaotologica': props.historiaOtologica,
    'previoespirometria': props.previoEspirometria,
  }[tipoSinEspacios];

  const fecha = doc?.fechaAntidoping || doc?.fechaAptitudPuesto || doc?.fechaConstanciaAptitud || doc?.fechaAudiometria || doc?.fechaCertificado || doc?.fechaCertificadoExpedito || doc?.fechaReceta || doc?.fechaExamenVista || doc?.fechaExploracionFisica || doc?.fechaHistoriaClinica || doc?.fechaNotaMedica || doc?.fechaInicioControlPrenatal || doc?.fechaHistoriaOtologica || doc?.fechaPrevioEspirometria;

  const tiposDocumentos = {
    'constanciaaptitud': 'Constancia de Aptitud',
    'antidoping': 'Antidoping',
    'aptitud': 'Aptitud',
    'audiometria': 'Audiometria',
    'certificado': 'Certificado',
    'certificadoexpedito': 'Certificado Expedito',
    'receta': 'Receta',
    'examenvista': 'Examen Vista', 
    'exploracionfisica': 'Exploracion Fisica',
    'historiaclinica': 'Historia Clinica',
    'notamedica': 'Nota Medica',
    'controlprenatal': 'Control Prenatal',
    'historiaotologica': 'Historia Otologica',
    'previoespirometria': 'Previo Espirometria',
  };

  const tipoDocumentoFormateado = tiposDocumentos[tipoSinEspacios];
  const fechaFormateada = fecha ? convertirFechaISOaDDMMYYYY(fecha).replace(/\//g, '-') : '';
  const nombreArchivo = fecha ? `${tipoDocumentoFormateado} ${fechaFormateada}.pdf` : `${tipoDocumentoFormateado}.pdf`;

  // Obtener updatedAt para cache-busting (evitar que se muestre versión cacheada del PDF)
  const updatedAt = doc?.updatedAt ? new Date(doc.updatedAt).getTime() : Date.now();

  return {
      ruta: doc.rutaPDF,        // solo la carpeta
      nombre: nombreArchivo,    // solo el nombre del archivo
      updatedAt: updatedAt      // timestamp para cache-busting
  };
};

const abrirDocumentoCorrespondiente = () => {
  const { ruta, nombre, updatedAt } = construirRutaYNombrePDF();
  abrirPdf(ruta, nombre, updatedAt); 
};

const manejarRegeneracionDesdePadre = async () => {
  await abrirDocumentoCorrespondiente();      // Abre visor
  await nextTick();                           // Espera a que DOM actualice
  mostrarModalPdfEliminado.value = false;     // Cierra el modal
  // Verificar disponibilidad después de regenerar
  setTimeout(() => {
    verificarDisponibilidadPDF();
  }, 1000); // Pequeño delay para asegurar que el PDF se haya generado
};

/*
 * SISTEMA DE INDICADORES DE ESTADO DEL PDF:
 * 
 * 1. INDICADOR LATERAL (línea izquierda):
 *    - Verde: PDF disponible y listo para mostrar
 *    - Naranja/Rojo: Documento externo no disponible (solo para documentos externos)
 *    - Amarillo/Naranja: Verificando disponibilidad del PDF
 *    - Sin indicador: PDF no disponible (comportamiento normal del sistema)
 * 
 * 2. BORDE DEL ITEM:
 *    - Gris: Estado normal (PDF disponible o no disponible)
 *    - Amarillo: Verificando disponibilidad
 * 
 * 3. ICONO EN EL TÍTULO:
 *    - ✓ Verde: PDF disponible
 *    - ⚠️ Naranja: Documento externo no disponible (solo para documentos externos)
 *    - 🔄 Amarillo: Verificando disponibilidad
 *    - Sin icono: PDF no disponible (comportamiento normal del sistema)
 * 
 * 4. TOOLTIPS:
 *    - Al hacer hover sobre el indicador lateral se muestra el estado
 *    - Al hacer hover sobre el icono se muestra información adicional
 * 
 * 5. DIFERENCIACIÓN POR TIPO:
 *    - Informes (Antidoping, Aptitud, etc.): Solo indican cuando están disponibles
 *    - Documentos Externos: Indican tanto disponibilidad como no disponibilidad
 */

// Función para verificar si el PDF está disponible
const verificarDisponibilidadPDF = async () => {
  const tipoSinEspacios = props.documentoTipo.toLowerCase().replace(/\s+/g, '');
  
  // Para documentos externos, verificar si el archivo existe
  if (tipoSinEspacios === 'documentoexterno') {
    if (!props.documentoExterno || !props.documentoExterno.rutaDocumento) {
      pdfDisponible.value = false;
      return;
    }

    try {
      verificandoPDF.value = true;
      const rutaCompleta = construirRutaCompleta(props.documentoExterno);
      const response = await axios.head(rutaCompleta);
      pdfDisponible.value = response.status === 200;
    } catch (error) {
      pdfDisponible.value = false;
    } finally {
      verificandoPDF.value = false;
    }
    return;
  }

  // Para informes, verificar si el PDF existe
  const { ruta, nombre } = construirRutaYNombrePDF();
  if (!ruta || !nombre) {
    pdfDisponible.value = false;
    return;
  }

  try {
    verificandoPDF.value = true;
    const rutaCompleta = `${ruta}/${nombre}`.replace(/\/+/g, '/');
    const urlCompleta = new URL(rutaCompleta, import.meta.env.VITE_API_URL).href;
    
    const response = await axios.head(urlCompleta);
    pdfDisponible.value = response.status === 200 && response.headers['content-type'] === 'application/pdf';
  } catch (error) {
    pdfDisponible.value = false;
  } finally {
    verificandoPDF.value = false;
  }
};

// Verificar disponibilidad al montar el componente
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  verificarDisponibilidadPDF();
});

// Watcher para verificar disponibilidad cuando cambien las props
watch(() => [props.antidoping, props.aptitud, props.audiometria, props.constanciaAptitud, props.certificado, props.certificadoExpedito, props.receta, props.documentoExterno, props.examenVista, props.exploracionFisica, props.historiaClinica, props.notaMedica, props.controlPrenatal, props.historiaOtologica, props.previoEspirometria], () => {
  verificarDisponibilidadPDF();
}, { deep: true });

</script>

<template>
    <Teleport to="body">
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
    </Teleport>

    <!-- Items de documentos -->
    <div
        class="group relative bg-white border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer overflow-hidden"
        :class="{
            'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50': !isDeletionMode,
            'hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50': isDeletionMode,
            'border-yellow-300 hover:border-yellow-400': verificandoPDF,
            'border-gray-200 hover:border-emerald-300': pdfDisponible && !isDeletionMode,
            'border-gray-200 hover:border-red-300': pdfDisponible && isDeletionMode,
            'border-gray-200 hover:border-gray-300': !pdfDisponible && !isDeletionMode,
            'border-gray-200 hover:border-red-400': !pdfDisponible && isDeletionMode
        }">
        
        <!-- Indicador de disponibilidad del PDF -->
        <div :class="indicadorLateral.class" :title="indicadorLateral.title"></div>
        
        <div class="flex items-center justify-between p-4 pl-6 min-h-[80px] max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3 max-[390px]:p-3 max-[390px]:pl-3">
            <div class="flex items-center flex-1 max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3 w-full">

                <!-- Antidoping -->
                <div v-if="typeof antidoping === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, antidoping, 'Antidoping')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${antidoping.rutaPDF}`,
                        `Antidoping ${convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping)}.pdf`,
                        antidoping.updatedAt ? new Date(antidoping.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mr-4 group-hover:bg-red-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-flask text-red-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200 flex items-center max-[390px]:text-base">
                                    Antidoping
                                </h3>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                    :class="positivos ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                                    {{ positivos ? 'Positivo' : 'Negativo' }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Resultados</p>
                                    <p v-if="mensajeDetalladoAntidoping" class="font-medium text-sm truncate max-w-full"
                                        :class="positivos ? 'text-red-600' : 'text-gray-800'">
                                        {{ mensajeDetalladoAntidoping }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Constancia de Aptitud -->
                <div v-if="typeof constanciaAptitud === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, constanciaAptitud, 'Constancia de Aptitud')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${constanciaAptitud.rutaPDF}`,
                        `Constancia de Aptitud ${convertirFechaISOaDDMMYYYY(constanciaAptitud.fechaConstanciaAptitud)}.pdf`,
                        constanciaAptitud.updatedAt ? new Date(constanciaAptitud.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-user-check text-green-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-80 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Constancia de Aptitud
                                </h3>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(constanciaAptitud.fechaConstanciaAptitud) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Aptitud al Puesto -->
                <div v-if="typeof aptitud === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, aptitud, 'Aptitud')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${aptitud.rutaPDF}`,
                        `Aptitud ${convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto)}.pdf`,
                        aptitud.updatedAt ? new Date(aptitud.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-user-check text-green-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-80 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Aptitud al Puesto
                                </h3>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                    :class="aptitud.aptitudPuesto === 'Apto Sin Restricciones' ? 'bg-emerald-100 text-emerald-700' : 
                                           aptitud.aptitudPuesto === 'Apto Con Precaución' ? 'bg-amber-100 text-amber-700' :
                                           aptitud.aptitudPuesto === 'Apto Con Restricciones' ? 'bg-orange-100 text-orange-700' :
                                           aptitud.aptitudPuesto === 'No Apto' ? 'bg-red-100 text-red-700' :
                                           aptitud.aptitudPuesto === 'Evaluación No Completada' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'">
                                    {{ aptitud.aptitudPuesto === 'Evaluación No Completada' ? 'No completada' : 
                                       trabajadores.currentTrabajador?.sexo === 'Femenino' ? 
                                         aptitud.aptitudPuesto.replace('Apto', 'Apta').charAt(0).toUpperCase() + aptitud.aptitudPuesto.replace('Apto', 'Apta').slice(1).toLowerCase() :
                                         aptitud.aptitudPuesto.charAt(0).toUpperCase() + aptitud.aptitudPuesto.slice(1).toLowerCase() }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <!-- <div class="hidden xl:block w-64 flex-shrink-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Resultado</p>
                                    <p class="font-medium text-sm truncate"
                                        :class="aptitud.aptitudPuesto === 'No Apto' ? 'text-red-600' : 'text-gray-800'">
                                        {{ aptitud.aptitudPuesto === 'Evaluación No Completada' ? 'No completada' : aptitud.aptitudPuesto.charAt(0).toUpperCase() + aptitud.aptitudPuesto.slice(1).toLowerCase() }}
                                    </p>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </div>

                <!-- Audiometría -->
                <div v-if="typeof audiometria === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, audiometria, 'Audiometria')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${audiometria.rutaPDF}`,
                        `Audiometria ${convertirFechaISOaDDMMYYYY(audiometria.fechaAudiometria)}.pdf`,
                        audiometria.updatedAt ? new Date(audiometria.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-volume-up text-purple-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Audiometría
                                </h3>
                                <!-- Mostrar resultado según método de audiometría -->
                                <span v-if="audiometria.metodoAudiometria === 'AMA' && audiometria.perdidaAuditivaBilateralAMA" class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                    PAB: {{ audiometria.perdidaAuditivaBilateralAMA }}%
                                </span>
                                <span v-else-if="audiometria.metodoAudiometria === 'LFT' && audiometria.hipoacusiaBilateralCombinada" class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                    HBC: {{ audiometria.hipoacusiaBilateralCombinada }}%
                                </span>
                                <span v-else-if="!audiometria.metodoAudiometria && audiometria.hipoacusiaBilateralCombinada" class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                    HBC: {{ audiometria.hipoacusiaBilateralCombinada }}%
                                </span>
                                <span v-else class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                    Incompleta
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(audiometria.fechaAudiometria) }}
                            </p>
                        </div>

                        <!-- Información adicional (pantallas grandes) -->
                        <div v-if="audiometria.diagnosticoAudiometria" class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Diagnóstico</p>
                                    <p class="font-medium text-sm truncate max-w-full text-gray-800">
                                        {{ audiometria.diagnosticoAudiometria.toUpperCase() }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Certificado -->
                <div v-if="typeof certificado === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, certificado, 'Certificado')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${certificado.rutaPDF}`,
                        `Certificado ${convertirFechaISOaDDMMYYYY(certificado.fechaCertificado)}.pdf`,
                        certificado.updatedAt ? new Date(certificado.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-certificate text-blue-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Certificado
                                </h3>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                    :class="certificado.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                    {{ certificado.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'Sin impedimentos' : 'Con impedimentos' }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(certificado.fechaCertificado) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Impedimentos Físicos</p>
                                    <p class="font-medium text-sm truncate max-w-full"
                                        :class="certificado.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'text-gray-800' : 'text-red-600'">
                                        {{ certificado.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'No presenta impedimentos físicos' : certificado.impedimentosFisicos }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Certificado Expedito -->
                <div v-if="typeof certificadoExpedito === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, certificadoExpedito, 'Certificado Expedito')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${certificadoExpedito.rutaPDF}`,
                        `Certificado Expedito ${convertirFechaISOaDDMMYYYY(certificadoExpedito.fechaCertificadoExpedito)}.pdf`,
                        certificadoExpedito.updatedAt ? new Date(certificadoExpedito.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-certificate text-blue-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Certificado Ex.
                                </h3>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                    :class="certificadoExpedito.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                    {{ certificadoExpedito.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'Sin impedimentos' : 'Con impedimentos' }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(certificadoExpedito.fechaCertificadoExpedito) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block w-64 flex-shrink-0">
                            <div class="text-sm flex xl:space-x-2">
                                <div class="hidden xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Impedimentos Físicos</p>
                                    <p class="font-medium text-sm truncate max-w-full"
                                        :class="certificadoExpedito.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'text-gray-800' : 'text-red-600'">
                                        {{ certificadoExpedito.impedimentosFisicos === 'no presenta impedimento físico para desarrollar el puesto que actualmente solicita' ? 'No presenta impedimentos físicos' : certificadoExpedito.impedimentosFisicos }}
                                    </p>
                                </div>
                                <div class="hidden 2xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Aptitud</p>
                                    <p class="font-medium text-sm truncate max-w-full"
                                        :class="certificadoExpedito.aptitudPuesto === 'No Apto' ? 'text-red-600' : 'text-gray-800'">
                                        {{ certificadoExpedito.aptitudPuesto }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Documento Externo -->
                <div v-if="typeof documentoExterno === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, documentoExterno, 'Documento Externo')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirDocumentoExterno(documentoExterno)">
                        
                        <!-- Icono del documento dinámico -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 rounded-lg mr-4 transition-colors duration-200 flex-shrink-0"
                             :class="obtenerExtensionArchivo(documentoExterno) === 'pdf' ? 'bg-red-100 group-hover:bg-red-200' : 'bg-blue-100 group-hover:bg-blue-200'">
                            <!-- Icono PDF -->
                            <svg v-if="obtenerExtensionArchivo(documentoExterno) === 'pdf'" class="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                            </svg>
                            <!-- Icono imagen -->
                            <svg v-else class="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    <span class="max-w-56">
                                        <i v-if="verificandoPDF" class="fas fa-spinner fa-spin mr-0.5 text-yellow-500 text-sm"></i>
                                        <i v-else-if="!pdfDisponible" class="fas fa-exclamation-triangle mr-0.5 text-rose-500 text-sm" title="Documento externo no disponible"></i>
                                        <!-- <i v-else class="fas fa-check-circle mr-0.5 text-emerald-500 text-sm" title="Documento disponible"></i> -->
                                        {{ documentoExterno.nombreDocumento }}
                                    </span>
                                    <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                          :class="obtenerExtensionArchivo(documentoExterno) === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">
                                        {{ obtenerExtensionArchivo(documentoExterno).toUpperCase() }}
                                    </span>
                                </h3>
                            </div>
                            <div class="flex">
                                <p class="text-sm text-gray-500 flex items-center">
                                    <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                    {{ convertirFechaISOaDDMMYYYY(documentoExterno.fechaDocumento) }}
                                </p>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                    Documento Externo
                                </span>
                            </div>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Notas</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">
                                        {{ documentoExterno.notasDocumento.trim() !== '' && documentoExterno.notasDocumento.trim() !== 'undefined' ? documentoExterno.notasDocumento : 'Sin notas' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Examen de la Vista -->
                <div v-if="typeof examenVista === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, examenVista, 'Examen Vista')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${examenVista.rutaPDF}`,
                        `Examen Vista ${convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista)}.pdf`,
                        examenVista.updatedAt ? new Date(examenVista.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4 group-hover:bg-yellow-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-eye text-yellow-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Examen de la Vista
                                </h3>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                    :class="examenVista.requiereLentesUsoGeneral === 'Si' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                                    {{ examenVista.requiereLentesUsoGeneral === 'Si' ? 'Requiere lentes' : 'Agudeza normal' }}
                                </span>
                            </div>
                            <div class="flex">
                                <p class="text-sm mr-0.5 text-gray-500 flex items-center">
                                    <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                    {{ convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista) }}
                                </p>
                                <span v-if="examenVista.porcentajeIshihara && examenVista.porcentajeIshihara < 80" 
                                    class="hidden sm:flex ml-16 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                    Daltonismo
                                </span>                                
                            </div>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block flex-shrink-0">
                            <div class="text-sm flex space-x-2">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Resultados</p>
                                    <p v-if="!examenVista.ojoIzquierdoLejanaConCorreccion && !examenVista.ojoDerechoLejanaConCorreccion" class="font-medium text-sm truncate"
                                        :class="examenVista.sinCorreccionLejanaInterpretacion === 'Visión excepcional' ? 'text-emerald-600' :
                                               examenVista.sinCorreccionLejanaInterpretacion === 'Visión normal' ? 'text-emerald-600' :
                                               examenVista.sinCorreccionLejanaInterpretacion === 'Visión ligeramente reducida' ? 'text-amber-600' :
                                               examenVista.sinCorreccionLejanaInterpretacion === 'Visión moderadamente reducida' ? 'text-red-600' :
                                               examenVista.sinCorreccionLejanaInterpretacion === 'Visión significativamente reducida' ? 'text-red-600' :
                                               examenVista.sinCorreccionLejanaInterpretacion === 'Visión muy reducida' ? 'text-red-700' : 'text-gray-800'">
                                        {{ examenVista.sinCorreccionLejanaInterpretacion }}
                                    </p>
                                    <p v-else class="font-medium text-sm text-gray-800 truncate">
                                        {{ examenVista.conCorreccionLejanaInterpretacion }} corregida
                                    </p>
                                </div>
                                <div class="hidden 2xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Lentes</p>
                                    <p class="font-medium text-sm truncate"
                                        :class="examenVista.requiereLentesUsoGeneral === 'Si' ? 'text-red-600' : 'text-gray-800'">
                                        {{ examenVista.requiereLentesUsoGeneral === 'Si' ? 'Requiere' : examenVista.requiereLentesUsoGeneral === 'No' ? 'No requiere' : examenVista.requiereLentesUsoGeneral }}
                                    </p>
                                </div>
                                <div class="hidden xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Ishihara</p>
                                    <p class="font-medium text-sm truncate"
                                        :class="!examenVista.porcentajeIshihara ? 'text-gray-600' : examenVista.porcentajeIshihara < 80 ? 'text-red-600' : 'text-gray-800'">
                                        {{ !examenVista.porcentajeIshihara ? 'Pendiente' : examenVista.porcentajeIshihara < 80 ? `${examenVista.porcentajeIshihara}% - Daltonismo` : `${examenVista.porcentajeIshihara}% - Normal` }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Exploracion Fisica -->
                <div v-if="typeof exploracionFisica === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, exploracionFisica, 'Exploracion Fisica')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${exploracionFisica.rutaPDF}`, 
                        `Exploracion Fisica ${convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica)}.pdf`,
                        exploracionFisica.updatedAt ? new Date(exploracionFisica.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mr-4 group-hover:bg-indigo-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-heartbeat text-indigo-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Exploración Física
                                </h3>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                    :class="exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sano' || exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sana' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                    {{ exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sano' || exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sana' ? 'Sin hallazgos' : 'Hallazgos' }}
                                </span>
                            </div>
                            <div class="flex">
                                <p class="text-sm mr-1.5 text-gray-500 flex items-center">
                                    <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                    {{ convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica) }}
                                </p>
                                <span v-if="exploracionFisica.indiceMasaCorporal && exploracionFisica.indiceMasaCorporal >= 30" 
                                    class="hidden sm:flex ml-14 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                    Obesidad
                                </span>
                            </div>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block w-64 flex-shrink-0">
                            <div class="text-sm flex xl:space-x-2">
                                <div class="hidden xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">IMC</p>
                                    <p class="font-medium text-sm truncate"
                                        :class="exploracionFisica.categoriaIMC === 'Bajo peso' ? 'text-amber-600' :
                                               exploracionFisica.categoriaIMC === 'Normal' ? 'text-emerald-600' :
                                               exploracionFisica.categoriaIMC === 'Sobrepeso' ? 'text-amber-600' :
                                               exploracionFisica.categoriaIMC === 'Obesidad clase I' ? 'text-red-600' :
                                               exploracionFisica.categoriaIMC === 'Obesidad clase II' ? 'text-red-600' :
                                               exploracionFisica.categoriaIMC === 'Obesidad clase III' ? 'text-red-700' : 'text-gray-800'">
                                        {{ exploracionFisica.indiceMasaCorporal }} - {{ exploracionFisica.categoriaIMC }}
                                    </p>
                                </div>
                                <div class="hidden 2xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Tensión Arterial</p>
                                    <p class="font-medium text-sm truncate"
                                        :class="exploracionFisica.categoriaTensionArterial === 'Óptima' ? 'text-emerald-600' :
                                               exploracionFisica.categoriaTensionArterial === 'Normal' ? 'text-emerald-600' :
                                               exploracionFisica.categoriaTensionArterial === 'Alta' ? 'text-amber-600' :
                                               exploracionFisica.categoriaTensionArterial === 'Hipertensión ligera' ? 'text-amber-600' :
                                               exploracionFisica.categoriaTensionArterial === 'Hipertensión moderada' ? 'text-red-600' :
                                               exploracionFisica.categoriaTensionArterial === 'Hipertensión severa' ? 'text-red-700' : 'text-gray-800'">
                                        <span>
                                            {{ exploracionFisica.categoriaTensionArterial }}
                                            <span v-if="exploracionFisica.categoriaTensionArterial === 'Normal' || exploracionFisica.categoriaTensionArterial === 'Óptima' || exploracionFisica.categoriaTensionArterial === 'Alta'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        </span>
                                    </p>
                                </div>
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-exploracion xl-max-w-dynamic-exploracion-xl xxl-max-w-dynamic-exploracion-2xl">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Resumen</p>
                                    <p class="font-medium text-sm truncate max-w-full "
                                        :class="exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sano' || exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sana' ? 'text-gray-800' : 'text-red-600'">
                                        {{ exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sano' ? 'Clínicamente sano' : exploracionFisica.resumenExploracionFisica === 'Se encuentra clínicamente sana' ? 'Clínicamente sana' : exploracionFisica.resumenExploracionFisica }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Historia Clínica -->
                <div v-if="typeof historiaClinica === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, historiaClinica, 'Historia Clinica')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${historiaClinica.rutaPDF}`,
                        `Historia Clinica ${convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica)}.pdf`,
                        historiaClinica.updatedAt ? new Date(historiaClinica.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mr-4 group-hover:bg-teal-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-notes-medical text-teal-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Historia Clínica
                                </h3>
                                <span class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                    :class="historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomático' || historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomática' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                                    {{ historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomático' ? 'Asintomático' : historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomática' ? 'Asintomática' : 'Hallazgo' }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block w-64 flex-shrink-0">
                            <div class="text-sm flex xl:space-x-2">
                                <div class="hidden xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Evaluación</p>
                                    <p class="font-medium text-gray-800 text-sm truncate">{{ historiaClinica.motivoExamen }}</p>
                                </div>
                                <div class="hidden 2xl:block bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 flex-1">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Accidente</p>
                                    <p class="font-medium text-sm truncate"
                                        :class="historiaClinica.accidenteLaboral === 'Si' && historiaClinica.secuelas !== 'Sin secuelas' ? 'text-red-600' : 'text-gray-800'">
                                        {{ 
                                            historiaClinica.accidenteLaboral === 'Si' && historiaClinica.secuelas === 'Sin secuelas' ? 'Si - Sin secuelas' :
                                            historiaClinica.accidenteLaboral === 'Si' && historiaClinica.secuelas !== 'Sin secuelas' ? `Si - Con secuelas` :
                                            historiaClinica.accidenteLaboral === 'No' ? 'Negado' : 'Negado'
                                        }}
                                    </p>
                                </div>
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-historia xl-max-w-dynamic-historia-xl xxl-max-w-dynamic-historia-2xl">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Resumen</p>
                                    <p class="font-medium text-sm truncate max-w-full xl:max-w-none 2xl:max-w-none"
                                        :class="historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomático' || historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomática' ? 'text-gray-800' : 'text-red-600'">
                                        {{ historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomático' ? 'Se refiere asintomático' : historiaClinica.resumenHistoriaClinica === 'Se refiere actualmente asintomática' ? 'Se refiere asintomática' : historiaClinica.resumenHistoriaClinica }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nota Medica -->
                <div v-if="typeof notaMedica === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, notaMedica, 'Nota Medica')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${notaMedica.rutaPDF}`,
                        `Nota Medica ${convertirFechaISOaDDMMYYYY(notaMedica.fechaNotaMedica)}.pdf`,
                        notaMedica.updatedAt ? new Date(notaMedica.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mr-4 group-hover:bg-orange-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-stethoscope text-orange-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Nota Médica
                                </h3>
                                <span v-if="notaMedica.diagnostico" class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                    {{ notaMedica.tipoNota }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(notaMedica.fechaNotaMedica) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div v-if="notaMedica.diagnostico" class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Diagnóstico</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ notaMedica.diagnostico }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Receta Médica -->
                <div v-if="typeof receta === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, receta, 'Receta')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${receta.rutaPDF}`,
                        `Receta ${convertirFechaISOaDDMMYYYY(receta.fechaReceta)}.pdf`,
                        receta.updatedAt ? new Date(receta.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mr-4 group-hover:bg-emerald-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-prescription-bottle-medical text-emerald-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Receta Médica
                                </h3>
                                <span v-if="Array.isArray(receta.tratamiento) && receta.tratamiento.length" class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                    {{ receta.tratamiento.length }} indicac{{ receta.tratamiento.length === 1 ? 'ión' : 'iones' }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(receta.fechaReceta) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div v-if="receta.indicaciones" class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Indicaciones</p>
                                    <p class="font-medium text-sm truncate max-w-full text-gray-800">
                                        {{ receta.indicaciones }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Control Prenatal -->   
                <div v-if="typeof controlPrenatal === 'object'" class="flex itemsats-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, controlPrenatal, 'Control Prenatal')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${controlPrenatal.rutaPDF}`,
                        `Control Prenatal ${convertirFechaISOaDDMMYYYY(controlPrenatal.fechaInicioControlPrenatal)}.pdf`,
                        controlPrenatal.updatedAt ? new Date(controlPrenatal.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg mr-4 group-hover:bg-pink-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-baby text-pink-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Control Prenatal
                                </h3>
                                <span v-if="controlPrenatal.fpp" class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                    FPP {{ convertirFechaISOaDDMMYYYY(controlPrenatal.fpp) }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(controlPrenatal.fechaInicioControlPrenatal) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">ENE</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.eneroFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">FEB</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.febreroFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">MAR</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.marzoFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">ABR</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.abrilFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">MAY</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.mayoFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">JUN</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.junioFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">JUL</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.julioFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">AGO</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.agostoFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">SEP</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.septiembreFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">OCT</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.octubreFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">NOV</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.noviembreFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">DIC</p>
                                    <p class="font-medium text-gray-800 text-sm truncate max-w-full">{{ controlPrenatal.diciembreFecha ? '✅' : '➖' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Historia Otologica -->
                <div v-if="typeof historiaOtologica === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, historiaOtologica, 'Historia Otologica')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${historiaOtologica.rutaPDF}`,
                        `Historia Otologica ${convertirFechaISOaDDMMYYYY(historiaOtologica.fechaHistoriaOtologica)}.pdf`,
                        historiaOtologica.updatedAt ? new Date(historiaOtologica.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-ear-listen text-purple-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Historia Otologica
                                </h3>
                                <span v-if="historiaOtologica.resultadoCuestionario || historiaOtologica.resultadoCuestionarioPersonalizado" 
                                      class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                      :class="{
                                        'bg-green-100 text-green-700': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'green',
                                        'bg-yellow-100 text-yellow-700': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'yellow',
                                        'bg-red-100 text-red-700': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'red',
                                        'bg-gray-100 text-gray-700': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'gray'
                                      }">
                                    {{ getResultadoCuestionarioTextoCorto(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(historiaOtologica.fechaHistoriaOtologica) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div v-if="historiaOtologica.resultadoCuestionario || historiaOtologica.resultadoCuestionarioPersonalizado" class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Resultado</p>
                                    <p class="font-medium text-sm truncate max-w-full"
                                       :class="{
                                         'text-green-700': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'green',
                                         'text-yellow-700': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'yellow',
                                         'text-red-700': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'red',
                                         'text-gray-800': getResultadoCuestionarioColor(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) === 'gray'
                                       }">
                                        {{ getResultadoCuestionarioTexto(historiaOtologica.resultadoCuestionario, historiaOtologica.resultadoCuestionarioPersonalizado) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Previo Espirometria -->
                <div v-if="typeof previoEspirometria === 'object'" class="flex items-center w-full h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3">
                    <!-- Checkbox mejorado -->
                    <div class="mr-4 flex-shrink-0">
                        <input
                            class="w-5 h-5 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
                            :class="isDeletionMode ? 'accent-red-600 text-red-600 focus:ring-red-500' : 'accent-teal-600 text-emerald-600 focus:ring-emerald-500'"
                            type="checkbox" :checked="isSelected"
                            @change="(event) => handleCheckboxChange(event, previoEspirometria, 'Previo Espirometria')">
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="flex items-center flex-1 h-full max-[390px]:flex-col max-[390px]:items-start max-[390px]:gap-3" @click="abrirPdf(
                        `${previoEspirometria.rutaPDF}`,
                        `Previo Espirometria ${convertirFechaISOaDDMMYYYY(previoEspirometria.fechaPrevioEspirometria)}.pdf`,
                        previoEspirometria.updatedAt ? new Date(previoEspirometria.updatedAt).getTime() : null)">
                        
                        <!-- Icono del documento -->
                        <div class="hidden md:flex items-center justify-center w-12 h-12 bg-sky-100 rounded-lg mr-4 group-hover:bg-sky-200 transition-colors duration-200 flex-shrink-0">
                            <i class="fas fa-wind text-sky-600 text-lg"></i>
                        </div>
                        
                        <!-- Información del documento -->
                        <div class="sm:w-72 min-w-0 max-w-xs w-full max-[390px]:max-w-full">
                            <div class="flex items-center mb-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duración-200 flex items-center max-[390px]:text-base">
                                    Previo Espirometria
                                </h3>
                                <span v-if="previoEspirometria.resultadoCuestionario || previoEspirometria.resultadoCuestionarioPersonalizado" 
                                      class="hidden sm:flex ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                      :class="{
                                        'bg-green-100 text-green-700': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'green',
                                        'bg-yellow-100 text-yellow-700': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'yellow',
                                        'bg-red-100 text-red-700': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'red',
                                        'bg-gray-100 text-gray-700': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'gray'
                                      }">
                                    {{ getResultadoCuestionarioTextoCorto(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500 flex items-center">
                                <i class="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                {{ convertirFechaISOaDDMMYYYY(previoEspirometria.fechaPrevioEspirometria) }}
                            </p>
                        </div>
                        
                        <!-- Información adicional (pantallas grandes) -->
                        <div v-if="previoEspirometria.resultadoCuestionario || previoEspirometria.resultadoCuestionarioPersonalizado" class="hidden xl:block mr-4 flex-shrink-0 min-w-0">
                            <div class="text-sm">
                                <div class="bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 w-fit max-w-dynamic-base">
                                    <p class="text-gray-600 text-xs font-medium mb-0.5 uppercase tracking-wide">Resultado</p>
                                    <p class="font-medium text-sm truncate max-w-full"
                                       :class="{
                                         'text-green-700': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'green',
                                         'text-yellow-700': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'yellow',
                                         'text-red-700': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'red',
                                         'text-gray-800': getResultadoCuestionarioColor(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) === 'gray'
                                       }">
                                        {{ getResultadoCuestionarioTexto(previoEspirometria.resultadoCuestionario, previoEspirometria.resultadoCuestionarioPersonalizado) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Botones de acción -->
            <div class="flex flex-wrap justify-end gap-1 sm:gap-1.5 md:gap-2 mx-1.5 w-full lg:w-auto">
                <!-- Botón de descarga dinámico -->
                <template v-for="(documento, key) in {
                    'Antidoping': antidoping,
                    'Aptitud': aptitud,
                    'Constancia de Aptitud': constanciaAptitud,
                    'Audiometria': audiometria,
                    'Certificado': certificado,
                    'Certificado Expedito': certificadoExpedito,
                    'Receta': receta,
                    'Documento Externo': documentoExterno,
                    'Examen Vista': examenVista,
                    'Exploracion Fisica': exploracionFisica,
                    'Historia Clinica': historiaClinica,
                    'Nota Medica': notaMedica,
                    'Control Prenatal': controlPrenatal,
                    'Historia Otologica': historiaOtologica,
                    'Previo Espirometria': previoEspirometria,
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
                    :class="[
                        'py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full transition-transform duration-200 ease-in-out transform shadow-sm z-5',
                        canEditDocument(documentoTipo) 
                            ? 'bg-sky-100 hover:bg-sky-200 text-sky-600 hover:scale-110' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    ]"
                    :disabled="!canEditDocument(documentoTipo)"
                    @click="handleEditDocumentoExterno">
                    <i class="fa-regular fa-pen-to-square fa-lg"></i>
                </button>
                <button v-else type="button" 
                    :class="[
                        'py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full transition-transform duration-200 ease-in-out transform shadow-sm z-5',
                        canEditDocument(documentoTipo) 
                            ? 'bg-sky-100 hover:bg-sky-200 text-sky-600 hover:scale-110' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    ]"
                    :disabled="!canEditDocument(documentoTipo)"
                    @click="handleEditDocument(documentoId, documentoTipo)">
                    <i class="fa-regular fa-pen-to-square fa-lg"></i>
                </button>

                <button type="button" 
                    :class="[
                        'py-1 px-1.5 sm:py-2 sm:px-2.5 rounded-full transition-transform duration-200 ease-in-out transform shadow-sm z-5',
                        canDeleteDocument(documentoTipo) 
                            ? 'bg-red-100 hover:bg-red-200 text-red-600 hover:scale-110' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    ]"
                    :disabled="!canDeleteDocument(documentoTipo)"
                    @click="handleDeleteDocument(documentoId, documentoNombre, documentoTipo)">
                    <i class="fa-solid fa-trash-can fa-lg"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Visor de PDF -->
    <Teleport to="body">
        <Transition name="modal-fade" appear>
            <div v-if="showPdfViewer"
                class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 backdrop-blur-sm flex justify-center items-center z-50"
                @click.self="cerrarPdf">
            
            <!-- Header del visor -->
            <div class="absolute top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 z-10">
                <div class="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
                    <!-- Sección izquierda -->
                    <div class="flex items-center space-x-2 sm:space-x-4">
                        <button @click="cerrarPdf" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-times text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Cerrar</span>
                        </button>
                        <div class="flex items-center space-x-1 sm:space-x-2">
                            <i class="fas fa-file-pdf text-red-500 text-sm sm:text-lg"></i>
                            <span class="text-gray-700 font-medium text-xs sm:text-sm">Visor de PDF</span>
                        </div>
                    </div>
                    
                    <!-- Controles adicionales -->
                    <div class="flex items-center space-x-1 sm:space-x-3">
                        <button @click="descargarPdfActual" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-download text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Descargar</span>
                        </button>
                        <button @click="imprimirPdfActual" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-print text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Imprimir</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Contenedor principal del visor -->
            <div class="relative w-full h-full flex flex-col">
                <!-- Contenedor del visor de PDF -->
                <div class="flex-1 mt-16 sm:mt-20 mx-2 sm:mx-4 mb-4 bg-white rounded-xl shadow-2xl overflow-hidden">
                    <VPdfViewer 
                        :src="pdfUrl" 
                        :initialThumbnails-visible="initialThumbnailsVisible" 
                        :initialScale="initialScale"
                        locale="customLang" 
                        :localization="localization" 
                    />
                </div>
            </div>

            <!-- Indicador de ayuda -->
            <div class="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
                <i class="fas fa-keyboard mr-1 sm:mr-2"></i>
                <span class="hidden sm:inline">Presiona</span> <kbd class="px-1 sm:px-2 py-0.5 sm:py-1 bg-gray-700 rounded text-xs">ESC</kbd> <span class="hidden sm:inline">para cerrar</span>
            </div>
        </div>
    </Transition>
    </Teleport>

    <!-- Visor de Imágenes -->
    <Teleport to="body">
        <Transition name="modal-fade" appear>
            <div v-if="showImageViewer"
                class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 backdrop-blur-sm flex justify-center items-center z-50"
                @click.self="cerrarImagen">
            
            <!-- Header del visor -->
            <div class="absolute top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 z-10">
                <div class="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
                    <!-- Sección izquierda -->
                    <div class="flex items-center space-x-2 sm:space-x-4">
                        <button @click="cerrarImagen" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-times text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Cerrar</span>
                        </button>
                        <div class="flex items-center space-x-1 sm:space-x-2">
                            <i class="fas fa-image text-blue-500 text-sm sm:text-lg"></i>
                            <span class="text-gray-700 font-medium text-xs sm:text-sm">Visor de Imagen</span>
                        </div>
                    </div>
                    
                    <!-- Controles de imagen -->
                    <div class="flex items-center space-x-1 sm:space-x-3">
                        <button @click="rotarImagen" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-redo text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Rotar</span>
                        </button>
                        <button @click="descargarImagenActual" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-download text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Descargar</span>
                        </button>
                        <button @click="resetImagePosition" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-crosshairs text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Centrar</span>
                        </button>
                        <button @click="zoomIn" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-search-plus text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Zoom +</span>
                        </button>
                        <button @click="zoomOut" 
                            class="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                            <i class="fas fa-search-minus text-xs sm:text-sm"></i>
                            <span class="font-medium hidden sm:inline">Zoom -</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Contenedor principal de la imagen -->
            <div class="relative w-full h-full flex flex-col image-viewer">
                <div class="flex-1 mt-16 sm:mt-20 mx-2 sm:mx-4 mb-4 bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center">
                    <img 
                        :src="imageUrl" 
                        :style="{ 
                            transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) rotate(${rotationAngle}deg) scale(${imageZoom})`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }"
                        alt="Vista previa del documento" 
                        class="max-w-full max-h-full object-contain select-none"
                        draggable="false"
                        @wheel="handleImageWheel"
                        @mousedown="startDrag"
                        @mouseenter="$event.target.style.cursor = isDragging ? 'grabbing' : 'grab'"
                        @mouseleave="handleMouseLeave"
                    />
                </div>
            </div>

            <!-- Indicador de zoom (se muestra cuando el zoom es diferente al valor inicial) -->
            <div v-if="imageZoom !== 0.8" class="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black bg-opacity-75 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
                <i class="fas fa-search mr-1 sm:mr-2"></i>
                {{ Math.round(imageZoom * 100) }}%
            </div>

            <!-- Indicador de ayuda -->
            <div class="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
                <i class="fas fa-mouse mr-1 sm:mr-2"></i>
                <span class="hidden sm:inline">Rueda del mouse para zoom •</span> 
                <span class="hidden sm:inline">Arrastra para mover •</span>
                <kbd class="px-1 sm:px-2 py-0.5 sm:py-1 bg-gray-700 rounded text-xs">ESC</kbd> <span class="hidden sm:inline">para cerrar</span>
            </div>
        </div>
    </Transition>
    </Teleport>

</template>

<style>
/* Animaciones para los modales */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.3s ease;
}

.modal-fade-enter-from {
    opacity: 0;
    transform: scale(0.9);
}

.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

/* Estilos para los botones de control */
.control-button {
    @apply transition-all duration-200 ease-in-out;
}

.control-button:hover {
    @apply transform scale-105;
}

/* Estilos para el indicador de zoom */
.zoom-indicator {
    @apply bg-black bg-opacity-75 text-white px-3 py-2 rounded-full text-sm;
    backdrop-filter: blur(10px);
}

/* Estilos para el indicador de ayuda */
.help-indicator {
    @apply bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm;
    backdrop-filter: blur(10px);
}

/* Estilos responsivos */
@media (max-width: 640px) {
    /* Pantallas muy pequeñas (xs) */
    .modal-fade-enter-active,
    .modal-fade-leave-active {
        transition: all 0.2s ease;
    }
}

@media (max-width: 768px) {
    /* Pantallas pequeñas (sm) */
    .control-button {
        @apply px-2 py-1 text-xs;
    }
    
    .help-indicator {
        @apply text-xs px-2 py-1;
    }
    
    /* Ajustes específicos para móviles */
    .modal-fade-enter-from,
    .modal-fade-leave-to {
        transform: scale(0.95);
    }
}

@media (min-width: 768px) and (max-width: 1024px) {
    /* Pantallas medianas (md) */
    .control-button {
        @apply px-3 py-2 text-sm;
    }
}

@media (min-width: 1024px) and (max-width: 1280px) {
    /* Pantallas grandes (lg) */
}

@media (min-width: 1280px) {
    /* Pantallas extra grandes (xl) */
}
</style>