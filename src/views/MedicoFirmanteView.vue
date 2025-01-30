<script setup>
import { ref, inject } from 'vue';
import { useMedicoFirmanteStore } from '@/stores/medicoFirmante';
import { useRouter } from 'vue-router';

const medicoFirmante = useMedicoFirmanteStore();
const router = useRouter();

const firmaPreview = ref(null);
const firmaArchivo = ref(null);

const toast = inject('toast');

const handleFileChange = (event) => {
    const file = event?.target?.files?.[0];
    if (file && file instanceof File) {
        firmaArchivo.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            firmaPreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        firmaPreview.value = null;
        firmaArchivo.value = null;
    }
};

const user = ref(
    JSON.parse(localStorage.getItem('user')) || null // Recuperar usuario guardado o establecer null si no existe
);

const handleSubmit = async (data) => {

    const formData = new FormData();

    // Agregar solo los campos con valores definidos
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
        }
    });
    formData.append('idUser', user.value._id);

    /* formData.append('nombre', data.nombre);
    formData.append('tituloProfesional', data.tituloProfesional);
    formData.append('numeroCedulaProfesional', data.numeroCedulaProfesional);
    formData.append('especialistaSaludTrabajo', data.especialistaSaludTrabajo);
    formData.append('numeroCedulaEspecialista', data.numeroCedulaEspecialista);
    formData.append('nombreCredencialAdicional', data.nombreCredencialAdicional);
    formData.append('numeroCredencialAdicional', data.numeroCredencialAdicional);
    formData.append('idUser', user.value._id); */

    if (firmaArchivo.value) {
        formData.append('firma', firmaArchivo.value);
    }

    // Depuramos el contenido de FormData
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
        let response;
        if (medicoFirmante.medicoFirmante._id) {
            console.log("Actualizando");
            console.log('medicoFirmante._id', medicoFirmante.medicoFirmante._id);
            response = await medicoFirmante.updateMedicoFirmanteById(medicoFirmante.medicoFirmante._id, formData);
        } else {
            console.log("Creando");
            console.log('medicoFirmante._id', medicoFirmante.medicoFirmante._id);
            response = await medicoFirmante.createMedicoFirmante(formData);
        }

        // Mostrar mensaje de éxito en el toast
        toast.open({
            message: response.message,
        });

        // Usar el ID devuelto por el backend para recargar los datos
        const idMedicoFirmante = response.data._id || medicoFirmante.medicoFirmante._id;

        if (idMedicoFirmante) {
            await medicoFirmante.loadMedicoFirmanteById(idMedicoFirmante);
        } else {
            console.warn("No se pudo obtener el ID del médico firmante. No se cargaron nuevos datos.");
        }

    } catch (error) {
        console.error("Error al crear o actualizar el médico firmante:", error);
    }
};


const volver = () => {
    router.push({ name: 'inicio' });
};

const titulos = ['Dr.', 'Dra.'];
const siONo = ['Si', 'No'];

</script>

<template>
    <Transition appear name="fade-slow">
        <div
            class="relative bg-white text-gray-900 w-full max-w-5xl p-10 rounded-lg shadow-slate-900 max-h-[82vh] overflow-y-auto mx-auto">
            <Transition appear name="fade-slow">
                <div v-if="medicoFirmante.loading">
                    <!-- <h1 class="text-3xl text-center">Cargando medico...</h1> -->
                </div>
                <div v-else>
                    <h1 class="text-3xl">Datos del médico firmante</h1>
                    <hr class="mt-2 mb-3">

                    <FormKit type="form" :actions="false"
                        incomplete-message="Por favor, valide que los datos sean correctos*" @submit="handleSubmit">

                        <FormKit type="text" label="Nombre Completo" name="nombre"
                            placeholder="Ej. Juan Alfonso Perez Galeana" validation="required"
                            :validation-messages="{ required: 'Este campo es obligatorio' }"
                            :value="medicoFirmante.medicoFirmante?.nombre" />

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">

                            <FormKit type="select" label="Título Profesional" name="tituloProfesional"
                                placeholder='Selecciona "Dr." o "Dra."' :options="titulos"
                                :value="medicoFirmante.medicoFirmante?.tituloProfesional" />

                            <FormKit type="text" label="Número de Cédula Profesional" name="numeroCedulaProfesional"
                                placeholder="Ej. 142988" validation="cedulaProfesionalValidation" :value="medicoFirmante.medicoFirmante?.numeroCedulaProfesional"
                                :validation-messages="{ cedulaProfesionalValidation: 'El número de cédula profesional debe tener entre 6 y 8 dígitos.' }" />

                            <FormKit type="select" label="Especialista en Medicina del Trabajo"
                                name="especialistaSaludTrabajo" placeholder="¿Es especialista en Medicina del Trabajo"
                                :options="siONo" :value="medicoFirmante.medicoFirmante?.especialistaSaludTrabajo" />

                            <FormKit type="text" label="Cédula de Especialidad en Medicina del Trabajo"
                                name="numeroCedulaEspecialista" placeholder="Ej. 3425572" validation="cedulaEspecialistaValidation"
                                :value="medicoFirmante.medicoFirmante?.numeroCedulaEspecialista"
                                :validation-messages="{ cedulaEspecialistaValidation: 'El número de cédula de especialidad debe tener entre 7 y 8 dígitos.' }" />

                            <FormKit type="text" label="Credencial Adicional" name="nombreCredencialAdicional"
                                placeholder="Ej. Certificado ante el Consejo Mexicano de Medicina del Trabajo"
                                :value="medicoFirmante.medicoFirmante?.nombreCredencialAdicional" />

                            <FormKit type="text" label="Número de Credencial Adicional" name="numeroCredencialAdicional"
                                placeholder="Ej. 924"
                                :value="medicoFirmante.medicoFirmante?.numeroCredencialAdicional" />
                        </div>

                        <FormKit type="file" label="Firma (.png sin fondo)" name="firma" accept=".png, .jpg, .jpeg, .svg"
                            multiple="false" @change="handleFileChange" />

                        <!-- Mostrar la vista previa de la firma -->
                        <div class="flex flex-row justify-center items-center gap-4">
                            <div v-if="medicoFirmante.medicoFirmante?.firma?.data"
                                class="w-1/2 flex flex-col items-center">
                                <p class="font-medium text-lg text-gray-700">Firma actual:</p>
                                <img :src="'http://localhost:3000/assets/signatories/' + medicoFirmante.medicoFirmante.firma?.data + '?t=' + Date.now()"
                                    :alt="'Logo de ' + medicoFirmante.medicoFirmante.nombre"
                                    class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                            </div>

                            <Transition appear name="fade-slow">
                                <div v-if="firmaPreview" class="w-1/2 flex flex-col items-center">
                                    <p v-if="medicoFirmante.medicoFirmante?.firma?.data"
                                        class="font-medium text-lg text-gray-700">
                                        Firma Nueva:</p>
                                    <p v-else class="font-medium text-lg text-gray-700">Firma:</p>
                                    <img :src="firmaPreview" alt="Vista previa de la firma"
                                        class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                                </div>
                            </Transition>
                        </div>
                        <hr class="my-3">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <!-- Botón de Volver -->
                            <button type="button"
                                class="text-lg w-full sm:w-1/2 rounded-lg bg-white font-medium text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg mb-1"
                                @click="volver">
                                Volver
                            </button>
                            <!-- Botón de Actualizar -->
                            <div class="w-full sm:w-1/2 pr-2">
                                <FormKit type="submit">
                                    <span v-if="medicoFirmante.loading">Guardando...</span>
                                    <span v-else>Actualizar Datos</span>
                                </FormKit>
                            </div>
                        </div>
                    </FormKit>
                </div>
            </Transition>
        </div>
    </Transition>
</template>

<style scoped>
.fade-slow-enter-from,
.fade-slow-leave-to {
    opacity: 0;
}

.fade-slow-enter-active,
.fade-slow-leave-active {
    transition: all 500ms ease-out;
}

.fade-slow-leave-active {
    transition-delay: 250ms;
}
</style>
