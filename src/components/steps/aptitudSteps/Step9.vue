<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import DocumentosAPI from '@/api/DocumentosAPI';
import { findNearestDocument } from '@/helpers/findNearestDocuments';
import { useDocumentosStore } from '@/stores/documentos';

const trabajadores = useTrabajadoresStore();
const { formDataAptitud } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para la alteracionesSalud principal, inicializado con el valor actual del store
const alteracionesSalud = ref(formDataAptitud.alteracionesSalud || '');

onMounted(() => {
    if (documentos.currentDocument) {
        alteracionesSalud.value = documentos.currentDocument.alteracionesSalud;
    }
});

// Sincronizar el valor seleccionado con formDataAptitud.alteracionesSalud
watch(alteracionesSalud, (newValue) => {
    formDataAptitud.alteracionesSalud = newValue;
});

// Lógica para traerse la data de los documentos con fecha más cercana a la aptitud
const historiasClinicas = ref([]);
const nearestHistoriaClinica = ref(null);

const exploracionesFisicas = ref([]);
const nearestExploracionFisica = ref(null);

const examenesVista = ref([]);
const nearestExamenVista = ref(null);

onMounted(async () => {
    try {
        // Obtener los datos necesarios
        const responseHistorias = await DocumentosAPI.getHistoriasClinicas(trabajadores.currentTrabajadorId);
        historiasClinicas.value = responseHistorias.data;
        nearestHistoriaClinica.value = findNearestDocument(historiasClinicas.value, formDataAptitud.fechaAptitudPuesto, 'fechaHistoriaClinica');

        const responseExploraciones = await DocumentosAPI.getExploracionesFisicas(trabajadores.currentTrabajadorId);
        exploracionesFisicas.value = responseExploraciones.data;
        nearestExploracionFisica.value = findNearestDocument(exploracionesFisicas.value, formDataAptitud.fechaAptitudPuesto, 'fechaExploracionFisica');

        const responseExamenes = await DocumentosAPI.getExamenesVista(trabajadores.currentTrabajadorId);
        examenesVista.value = responseExamenes.data;
        nearestExamenVista.value = findNearestDocument(examenesVista.value, formDataAptitud.fechaAptitudPuesto, 'fechaExamenVista');

        // Inicializa alteracionesSalud solo si está vacío
        if (!formDataAptitud.alteracionesSalud) {
            formDataAptitud.alteracionesSalud = textoBase.value;
        }
        alteracionesSalud.value = formDataAptitud.alteracionesSalud;
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
    }
});

// Generar el texto dinámico basado en la información
const textoBase = computed(() => {
    if (!nearestExploracionFisica.value || !nearestHistoriaClinica.value) {
        return 'Hace falta registrar la historia clínica y/o la exploración física para generar el texto base.';
    }

    const { sexo } = trabajadores.currentTrabajador;
    const {
        categoriaIMC,
        indiceMasaCorporal,
        circunferenciaCintura,
        categoriaCircunferenciaCintura,
        categoriaTensionArterial,
        tensionArterialSistolica,
        tensionArterialDiastolica,
    } = nearestExploracionFisica.value;

    const { sinCorreccionLejanaInterpretacion, porcentajeIshihara } = nearestExamenVista.value || {};

    // Categoría de circunferencia de cintura personalizada
    let riesgoCintura = '';
    if (categoriaCircunferenciaCintura === 'Bajo Riesgo') {
        riesgoCintura = 'riesgo bajo de desarrollar enfermedades cardiometabólicas.';
    } else if (categoriaCircunferenciaCintura === 'Riesgo Aumentado') {
        riesgoCintura = 'riesgo aumentado de desarrollar enfermedades cardiometabólicas.';
    } else if (categoriaCircunferenciaCintura === 'Alto Riesgo') {
        riesgoCintura = 'riesgo alto de desarrollar enfermedades cardiometabólicas.';
    } else {
        riesgoCintura = 'riesgo no clasificado de desarrollar enfermedades cardiometabólicas.';
    }

    // Personalización de tensión arterial
    let tensionArterialTexto = '';
    const categoriasTensionArterialValidas = ['óptima', 'normal', 'alta'];
    if (categoriasTensionArterialValidas.includes(categoriaTensionArterial.toLowerCase())) {
        tensionArterialTexto = `presión arterial ${categoriaTensionArterial.toLowerCase()}`;
    } else {
        tensionArterialTexto = categoriaTensionArterial.toLowerCase();
    }
    tensionArterialTexto += ` con una medición de ${tensionArterialSistolica}/${tensionArterialDiastolica} mmHg.`;

    const categoriaIMCMap = {
        "Bajo peso": "peso bajo",
        "Normal": "peso normal",
        "Sobrepeso": "sobrepeso",
        "Obesidad clase I": "obesidad clase I",
        "Obesidad clase II": "obesidad clase II",
        "Obesidad clase III": "obesidad clase III",
    };

    // Construcción del texto base
    let texto = `${sexo === 'Femenino' ? 'La trabajadora' : 'El trabajador'} presenta ${categoriaIMCMap[categoriaIMC] || categoriaIMC} con un índice de masa corporal (IMC) de ${indiceMasaCorporal}. Tiene una circunferencia de cintura de ${circunferenciaCintura} cm por lo que tiene ${riesgoCintura} Presenta ${tensionArterialTexto}`;

    // Información adicional del examen de vista
    if (nearestExamenVista.value) {
        texto += ` Tiene una ${sinCorreccionLejanaInterpretacion.toLowerCase()}${porcentajeIshihara < 80 ? ' y padece daltonismo' : ' y tiene una visión cromática normal'}.`;
    }

    // Información adicional de historia clínica y exploración física
    texto += ` ${nearestHistoriaClinica.value?.resumenHistoriaClinica || ''}. ${nearestExploracionFisica.value?.resumenExploracionFisica || ''}.`;

    return texto;
});

</script>

<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Aptitud al Puesto</h1>
    <div class="mb-4">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Alteraciones de Salud</h2>
        <p class="text-sm font-medium mb-1 text-gray-800 leading-4">Descripción de alteraciones encontradas:</p>
        <div class="font-light mb-4">
            <textarea
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-64"
                v-model="formDataAptitud.alteracionesSalud" :placeholder="textoBase || 'Cargando datos...'" required>
            </textarea>
        </div>
<!--         <div>
            <p class="font-medium mb-1 text-gray-800 leading-5">Texto base sugerido: </p>
            <p v-if="!nearestExploracionFisica || !nearestHistoriaClinica"
                class="text-sm font-light italic text-gray-700">
                Cargando texto base...
            </p>
            <p v-else class="text-sm font-light mb-4 italic text-gray-700 hover:text-emerald-700 cursor-pointer leading-5 text-justify"
               @click="copiarTexto(textoBase)">
                {{ textoBase }}
            </p>
        </div> -->
    </div>
</template>
