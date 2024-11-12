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
        class="ring-1 ring-gray-600 border-t-0 bg-gray-50 hover:bg-gray-200 flex justify-between px-2 items-center hover:cursor-pointer transition-all duration-300 ease-in-out hover:translate-x-0.5">
        <div class="flex items-center">
            <div class="mx-2">
                <input class="my-1 transform scale-150" type="checkbox" name="" id="">
            </div>
            <div v-if="typeof antidoping === 'object'" class="my-1 mx-1 flex gap-5">
                <div>
                    <p class="leading-5 text-lg px-1 font-medium">Antidoping</p>
                    <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(antidoping.fechaAntidoping) }}</p>
                </div>
                <div>
                    <p class="leading-5 px-1">Resultados:</p>
                    <p v-if="antidoping.marihuana === 'Positivo' || antidoping.cocaina === 'Positivo' || antidoping.anfetaminas === 'Positivo' || antidoping.metanfetaminas === 'Positivo' || antidoping.opiaceos === 'Positivo'" class="leading-5 px-1">Positivo</p>
                    <p v-else class="leading-5 px-1"> Negativo a cinco parámetros</p>
                </div>
            </div>
            <div v-if="typeof aptitud === 'object'" class="my-1 mx-1">
                <p class="leading-5 text-lg px-1 font-medium">Aptitud al Puesto</p>
                <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(aptitud.fechaAptitudPuesto) }}</p>
            </div>
            <div v-if="typeof certificado === 'object'" class="my-1 mx-1">
                <p class="leading-5 text-lg px-1 font-medium">Certificado</p>
                <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(certificado.fechaCertificado) }}</p>
            </div>
            <div v-if="typeof documentoExterno === 'object'" class="my-1 mx-1">
                <p class="leading-5 text-lg px-1 font-medium">{{ documentoExterno.tipoDocumento }}</p>
                <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(documentoExterno.fechaDocumento) }}</p>
            </div>
            <div v-if="typeof examenVista === 'object'" class="my-1 mx-1">
                <p class="leading-5 text-lg px-1 font-medium">Examen de la Vista</p>
                <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(examenVista.fechaExamenVista) }}</p>
            </div>
            <div v-if="typeof exploracionFisica === 'object'" class="my-1 mx-1">
                <p class="leading-5 text-lg px-1 font-medium">Exploración Física</p>
                <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(exploracionFisica.fechaExploracionFisica) }}</p>
            </div>
            <div v-if="typeof historiaClinica === 'object'" class="my-1 mx-1">
                <p class="leading-5 text-lg px-1 font-medium">Historia Clínica</p>
                <p class="leading-5 px-1">{{ convertirFechaISOaDDMMYYYY(historiaClinica.fechaHistoriaClinica) }}</p>
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
