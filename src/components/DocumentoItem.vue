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
        class="ring-1 ring-gray-200 border-t-0 bg-white hover:bg-gray-50 shadow-lg flex justify-between items-center p-2 transition-transform duration-300 ease-in-out cursor-pointer">
        <div class="flex items-center">
            <div class="mx-2">
                <input class="transform scale-125 mr-3 cursor-pointer accent-emerald-600 transition duration-200 ease-in-out hover:scale-150" type="checkbox" name="" id="">
            </div>
            <div v-if="typeof antidoping === 'object'" class="my-1 mx-1 flex gap-5">
                <div class="min-w-40">
                    <p class="leading-5 text-lg font-semibold text-gray-800">Antidoping</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping) }}</p>
                </div>
                <div class="flex gap-5">
                    <div>
                        <p class="leading-5 text-sm px-1">Resultados:</p>
                        <p  v-if="antidoping.marihuana === 'Positivo' || antidoping.cocaina === 'Positivo' || antidoping.anfetaminas === 'Positivo' || antidoping.metanfetaminas === 'Positivo' || antidoping.opiaceos === 'Positivo'" class="leading-5 font-semibold text-red-500 px-1">Positivo</p>
                        <p v-else class="leading-5 font-semibold text-gray-800 px-1"> Negativo a cinco parámetros</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof aptitud === 'object'" class="my-1 mx-1 flex gap-5">
                <div class="min-w-40">
                    <p class="leading-5 text-lg font-semibold text-gray-800">Aptitud al Puesto</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto) }}</p>
                </div>
                <div class="flex gap-5">
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Resultado:</p>
                        <p 
                            class="leading-5 font-semibold text-gray-800 px-1"
                            :class="aptitud.aptitudPuesto === 'No Apto' ? 'text-red-500' : 'text-gray-800'"
                        >{{ aptitud.aptitudPuesto }}</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof certificado === 'object'" class="my-1 mx-1 flex gap-5">
                <div class="min-w-40">
                    <p class="leading-5 text-lg font-medium">Certificado</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(certificado.fechaCertificado) }}</p>
                </div>
                <div class="flex gap-5">
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Notas:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">Sin impedimentos físicos</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof documentoExterno === 'object'" class="my-1 mx-1 flex gap-5">
                <div class="min-w-40">
                    <p class="leading-5 text-lg font-medium">{{ documentoExterno.nombreDocumento }}</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(documentoExterno.fechaDocumento) }}</p>
                </div>
                <div class="flex gap-5">
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Notas:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ documentoExterno.notasDocumento }}</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof examenVista === 'object'" class="my-1 mx-1 flex gap-5">
                <div class="min-w-40">
                    <p class="leading-5 text-lg font-medium">Examen de la Vista</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista) }}</p>
                </div>
                <div v-if="!examenVista.ojoIzquierdoLejanaConCorreccion && !examenVista.ojoDerechoLejanaConCorreccion" class=" flex gap-5">
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Resultados:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ examenVista.sinCorreccionLejanaInterpretacion }}</p>
                    </div>
                </div>
                <div v-else class="flex gap-5">
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Resultados:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ examenVista.conCorreccionLejanaInterpretacion }} corregida</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof exploracionFisica === 'object'" class="my-1 mx-1 flex gap-5">
                <div class="min-w-40">
                    <p class="leading-5 text-lg font-medium">Exploración Física</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica) }}</p>
                </div>
                <div class="flex gap-5">
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Categoría IMC:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ exploracionFisica.indiceMasaCorporal }} - {{ exploracionFisica.categoriaIMC }}</p>
                    </div>
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Tension Arterial:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ exploracionFisica.categoriaTensionArterial }}</p>
                    </div>
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Resumen:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ exploracionFisica.resumenExploracionFisica }}</p>
                    </div>
                </div>
            </div>

            <div v-if="typeof historiaClinica === 'object'" class="my-1 mx-1 flex gap-5">
                <div class="min-w-40">
                    <p class="leading-5 text-lg font-medium">Historia Clínica</p>
                    <p class="leading-5 text-sm text-gray-500">{{ convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica) }}</p>
                </div>
                <div class="flex gap-5">
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Evaluacion:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ historiaClinica.motivoExamen }}</p>
                    </div>
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Accidente Laboral:</p>
                        <p 
                            class="leading-5 font-semibold text-gray-800 px-1"
                            :class="historiaClinica.accidenteLaboral !== 'Niega haber sufrido algún accidente' ? 'text-red-500' : 'text-gray-800'"
                        >{{ historiaClinica.accidenteLaboralEspecificar }}</p>
                    </div>
                    <div class="min-w-56">
                        <p class="leading-5 text-sm px-1">Resumen:</p>
                        <p class="leading-5 font-semibold text-gray-800 px-1">{{ historiaClinica.resumenHistoriaClinica }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex gap-3 md:gap-4 lg:gap-5 mx-2">
           <button type="button" class="p-2 px-2.5 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm">
                <i class="fa-solid fa-download fa-lg"></i>
            </button>
            <button type="button" class="p-2 px-2.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm">
                <i class="fa-regular fa-pen-to-square fa-lg"></i>
            </button>
            <button type="button" class="p-2 px-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-transform duration-200 ease-in-out transform hover:scale-110 shadow-sm">
                <i class="fa-solid fa-trash-can fa-lg"></i>
            </button>
        </div>
    </div>
</template>
