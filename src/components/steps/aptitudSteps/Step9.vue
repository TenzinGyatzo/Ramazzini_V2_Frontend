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

// Valor local para alteracionesSalud
const alteracionesSalud = ref('');

// Documentos más cercanos
const historiasClinicas = ref([]);
const nearestHistoriaClinica = ref(null);

const exploracionesFisicas = ref([]);
const nearestExploracionFisica = ref(null);

const examenesVista = ref([]);
const nearestExamenVista = ref(null);

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

    let texto = `${sexo === 'Femenino' ? 'La trabajadora' : 'El trabajador'} presenta ${categoriaIMCMap[categoriaIMC] || categoriaIMC} con un índice de masa corporal (IMC) de ${indiceMasaCorporal}. Tiene una circunferencia de cintura de ${circunferenciaCintura} cm por lo que tiene ${riesgoCintura} Presenta ${tensionArterialTexto}`;

    if (nearestExamenVista.value) {
        texto += ` Tiene una ${sinCorreccionLejanaInterpretacion.toLowerCase()}${porcentajeIshihara < 80 ? ' y padece daltonismo' : ' y tiene una visión cromática normal'}.`;
    }

    texto += ` ${nearestHistoriaClinica.value?.resumenHistoriaClinica || ''}. ${nearestExploracionFisica.value?.resumenExploracionFisica || ''}.`;

    return texto;
});

// Actualizar siempre alteracionesSalud al cambiar los documentos más cercanos
const actualizarAlteracionesSalud = () => {
    formDataAptitud.alteracionesSalud = textoBase.value;
    alteracionesSalud.value = textoBase.value;
};

onMounted(async () => {
    try {
        const responseHistorias = await DocumentosAPI.getHistoriasClinicas(trabajadores.currentTrabajadorId);
        historiasClinicas.value = responseHistorias.data;
        nearestHistoriaClinica.value = findNearestDocument(historiasClinicas.value, formDataAptitud.fechaAptitudPuesto, 'fechaHistoriaClinica');

        const responseExploraciones = await DocumentosAPI.getExploracionesFisicas(trabajadores.currentTrabajadorId);
        exploracionesFisicas.value = responseExploraciones.data;
        nearestExploracionFisica.value = findNearestDocument(exploracionesFisicas.value, formDataAptitud.fechaAptitudPuesto, 'fechaExploracionFisica');

        const responseExamenes = await DocumentosAPI.getExamenesVista(trabajadores.currentTrabajadorId);
        examenesVista.value = responseExamenes.data;
        nearestExamenVista.value = findNearestDocument(examenesVista.value, formDataAptitud.fechaAptitudPuesto, 'fechaExamenVista');

        actualizarAlteracionesSalud();
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
    }
});

// Monitorear cambios en nearestHistoriaClinica y nearestExploracionFisica
watch([nearestHistoriaClinica, nearestExploracionFisica], actualizarAlteracionesSalud);
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
    </div>
</template>
