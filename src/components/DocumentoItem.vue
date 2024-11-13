<script setup>
import { convertirFechaISOaDDMMYYYY } from '@/helpers/dates';

defineProps({
    antidoping: [Object, String],
    aptitud: [Object, String],
    certificado: [Object, String],
    documentoExterno: [Object, String],
    examenVista: [Object, String],
    exploracionFisica: [Object, String],
    historiaClinica: [Object, String]
});
</script>

<template>
    <div
        class="ring-1 ring-gray-200 border-t-0 bg-white hover:bg-gray-50 shadow-lg flex justify-between items-center p-2 transition-transform duration-300 ease-in-out hover:translate-x-1">
        <div class="flex items-center">
            <div class="mx-2">
                <input class="transform scale-125 mr-3 cursor-pointer accent-blue-500 transition duration-200 ease-in-out hover:scale-150" type="checkbox" name="" id="">
            </div>
            <div v-if="typeof antidoping === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg font-semibold text-gray-800">Antidoping</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping) }}</p>
                </div>
                <div class="ml-10 flex gap-5">
                    <div>
                        <p class="leading-5 text-sm px-1">Resultados:</p>
                        <p  v-if="antidoping.marihuana === 'Positivo' || antidoping.cocaina === 'Positivo' || antidoping.anfetaminas === 'Positivo' || antidoping.metanfetaminas === 'Positivo' || antidoping.opiaceos === 'Positivo'" class="leading-5 font-semibold text-red-500 px-1">Positivo</p>
                        <p v-else class="leading-5 font-semibold text-gray-800 px-1"> Negativo a cinco parámetros</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof aptitud === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg font-semibold text-gray-800">Aptitud al Puesto</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto) }}</p>
                </div>
                <div class="ml-0 flex gap-5">
                    <div>
                        <p class="leading-5 text-sm px-1">Resultado:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ aptitud.aptitudPuesto }}</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof certificado === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg px-1 font-medium">Certificado</p>
                    <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(certificado.fechaCertificado) }}</p>
                </div>
                <div class="ml-10 flex gap-5">
                    <div>
                        <p class="leading-5 px-1">Notas:</p>
                        <p class="leading-5 px-1">Sin impedimentos físicos</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof documentoExterno === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg px-1 font-medium">{{ documentoExterno.tipoDocumento }}</p>
                    <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(documentoExterno.fechaDocumento) }}</p>
                </div>
                <div class="ml-10 flex gap-5">
                    <div>
                        <p class="leading-5 px-1">Notas:</p>
                        <p class="leading-5 px-1">{{ documentoExterno.notasDocumento }}</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof examenVista === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg px-1 font-medium">Examen de la Vista</p>
                    <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista) }}</p>
                </div>
                <div v-if="!examenVista.ojoIzquierdoLejanaConCorreccion && !examenVista.ojoDerechoLejanaConCorreccion" class="ml-10 flex gap-5">
                    <div>
                        <p class="leading-5 px-1">Resultados:</p>
                        <p class="leading-5 px-1">{{ examenVista.sinCorreccionLejanaInterpretacion }}</p>
                    </div>
                </div>
                <div v-else class="ml-10 flex gap-5">
                    <div>
                        <p class="leading-5 px-1">Resultados:</p>
                        <p class="leading-5 px-1">{{ examenVista.conCorreccionLejanaInterpretacion }} corregida</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof exploracionFisica === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg px-1 font-medium">Exploración Física</p>
                    <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica) }}</p>
                </div>
                <div class="ml-10 flex gap-5">
                    <div>
                        <p class="leading-5 px-1">Categoría IMC:</p>
                        <p class="leading-5 px-1">{{ exploracionFisica.indiceMasaCorporal }} - {{ exploracionFisica.categoriaIMC }}</p>
                    </div>
                    <div>
                        <p class="leading-5 px-1">Tension Arterial:</p>
                        <p class="leading-5 px-1">{{ exploracionFisica.categoriaTensionArterial }}</p>
                    </div>
                    <div>
                        <p class="leading-5 px-1">Resumen:</p>
                        <p class="leading-5 px-1">{{ exploracionFisica.resumenExploracionFisica }}</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof historiaClinica === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg px-1 font-medium">Historia Clínica</p>
                    <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica) }}</p>
                </div>
                <div class="ml-10 flex gap-5">
                    <div>
                        <p class="leading-5 px-1">Evaluacion:</p>
                        <p class="leading-5 px-1">{{ historiaClinica.motivoExamen }}</p>
                    </div>
                    <div>
                        <p class="leading-5 px-1">Accidente Laboral:</p>
                        <p class="leading-5 px-1">{{ historiaClinica.accidenteLaboralEspecificar }}</p>
                    </div>
                    <div>
                        <p class="leading-5 px-1">Resumen:</p>
                        <p class="leading-5 px-1">{{ historiaClinica.resumenHistoriaClinica }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex gap-3 md:gap-4 lg:gap-5 mx-2">
            <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                <i class="fa-solid fa-download fa-xl" style="color: #272727"></i>
            </button>
            <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                <i class="fa-regular fa-pen-to-square fa-xl" style="color: #696969"></i>
            </button>
            <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                <i class="fa-solid fa-trash-can fa-xl" style="color: #c43117"></i>
            </button>
        </div>
    </div>
</template>
