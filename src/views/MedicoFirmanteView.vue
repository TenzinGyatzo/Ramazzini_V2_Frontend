<script setup>
import { ref, inject, watch, watchEffect, computed } from 'vue';
import { useMedicoFirmanteStore } from '@/stores/medicoFirmante';
import { useRouter } from 'vue-router';

const medicoFirmante = useMedicoFirmanteStore();
const router = useRouter();

const firmaPreview = ref(null);
const firmaArchivo = ref(null);

// Objeto reactivo para el formulario del médico firmante
const formularioMedicoFirmante = ref({
  nombre: "",
  tituloProfesional: "",
  numeroCedulaProfesional: "",
  especialistaSaludTrabajo: "No",
  numeroCedulaEspecialista: "",
  nombreCredencialAdicional: "",
  numeroCredencialAdicional: ""
});

// Cargar los valores iniciales del médico firmante en el formulario
watchEffect(() => {
  if (medicoFirmante.medicoFirmante) {
    Object.assign(formularioMedicoFirmante.value, {
      nombre: medicoFirmante.medicoFirmante.nombre || "",
      tituloProfesional: medicoFirmante.medicoFirmante.tituloProfesional || "",
      numeroCedulaProfesional: medicoFirmante.medicoFirmante.numeroCedulaProfesional || "",
      especialistaSaludTrabajo: medicoFirmante.medicoFirmante.especialistaSaludTrabajo || "No",
      numeroCedulaEspecialista: medicoFirmante.medicoFirmante.numeroCedulaEspecialista || "",
      nombreCredencialAdicional: medicoFirmante.medicoFirmante.nombreCredencialAdicional || "",
      numeroCredencialAdicional: medicoFirmante.medicoFirmante.numeroCredencialAdicional || ""
    });
  }
});

// Computed Reactivo para el Pie de Página del Médico Firmante
const piePaginaFirmante = computed(() => ({
  nombre: formularioMedicoFirmante.value.nombre || "",
  tituloProfesional: formularioMedicoFirmante.value.tituloProfesional || "",
  numeroCedulaProfesional: formularioMedicoFirmante.value.numeroCedulaProfesional || "",
  especialistaSaludTrabajo: formularioMedicoFirmante.value.especialistaSaludTrabajo === "Si" ? "Especialista en Medicina del Trabajo" : "",
  numeroCedulaEspecialista: formularioMedicoFirmante.value.numeroCedulaEspecialista || "",
  nombreCredencialAdicional: formularioMedicoFirmante.value.nombreCredencialAdicional || "",
  numeroCredencialAdicional: formularioMedicoFirmante.value.numeroCredencialAdicional || ""
}));

const toast = inject('toast');

watch(
  () => formularioMedicoFirmante.value.especialistaSaludTrabajo,
  (newValue) => {
    if (newValue === "No") {
      formularioMedicoFirmante.value.numeroCedulaEspecialista = "";
    }
  }
);

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

    if (firmaArchivo.value) {
        formData.append('firma', firmaArchivo.value);
    }

    // Depuramos el contenido de FormData
    // for (let [key, value] of formData.entries()) {
    //     console.log(`${key}:`, value);
    // }

    try {
        let response;
        if (medicoFirmante.medicoFirmante._id) {
            response = await medicoFirmante.updateMedicoFirmanteById(medicoFirmante.medicoFirmante._id, formData);
        } else {
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

const baseURL = import.meta.env.VITE_API_URL || 'https://ramazzini.app';

const firmaSrc = computed(() => {
  return `${baseURL}/assets/signatories/${medicoFirmante.medicoFirmante.firma?.data}?t=${Date.now()}`;
});
</script>

<template>
    <!-- <Transition appear name="fade-slow"> -->
    <Transition appear mode="out-in" name="slide-up">
        <div
            class="relative bg-white text-gray-800 w-full max-w-5xl p-10 mt-2 rounded-lg max-h-[82vh] shadow-lg overflow-y-auto mx-auto">
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
                            v-model="formularioMedicoFirmante.nombre" />

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">

                            <FormKit type="select" label="Título Profesional" name="tituloProfesional"
                                placeholder='Selecciona "Dr." o "Dra."' :options="titulos"
                                v-model="formularioMedicoFirmante.tituloProfesional" />

                            <FormKit type="text" label="Número de Cédula Profesional" name="numeroCedulaProfesional"
                                placeholder="Ej. 142988" validation="cedulaProfesionalValidation" v-model="formularioMedicoFirmante.numeroCedulaProfesional"
                                :validation-messages="{ cedulaProfesionalValidation: 'El número de cédula profesional debe tener entre 6 y 8 dígitos.' }" />

                            <FormKit type="select" label="Especialista en Medicina del Trabajo"
                                name="especialistaSaludTrabajo" placeholder="¿Es especialista en Medicina del Trabajo"
                                :options="siONo" v-model="formularioMedicoFirmante.especialistaSaludTrabajo" />

                            <FormKit type="text" label="Cédula de Especialidad en Medicina del Trabajo"
                                name="numeroCedulaEspecialista" placeholder="Ej. 3425572" validation="cedulaEspecialistaValidation"
                                :disabled="formularioMedicoFirmante.especialistaSaludTrabajo !== 'Si'"
                                v-model="formularioMedicoFirmante.numeroCedulaEspecialista"
                                :validation-messages="{ cedulaEspecialistaValidation: 'El número de cédula de especialidad debe tener entre 7 y 8 dígitos.' }" />

                            <FormKit type="text" label="Credencial Adicional" name="nombreCredencialAdicional"
                                placeholder="Ej. Certificado ante el Consejo Mexicano de Medicina del Trabajo"
                                v-model="formularioMedicoFirmante.nombreCredencialAdicional" />

                            <FormKit type="text" label="Número de Credencial Adicional" name="numeroCredencialAdicional"
                                placeholder="Ej. 924"
                                v-model="formularioMedicoFirmante.numeroCredencialAdicional" />
                        </div>

                        <FormKit type="file" label="Firma (Asegura que sea .png sin fondo, cuadrada, de al menos 500 x 500px)" name="firma" accept=".png, .jpg, .jpeg, .svg"
                            multiple="false" @change="handleFileChange" />

                        <!-- Mostrar la vista previa del pie de página y firma del médico -->
                        <div class="flex flex-row justify-center items-center gap-4 mt-4">

                            <!-- Pie de Página del Médico Firmante (Izquierda) -->
                            <div v-if="piePaginaFirmante.nombre" class="w-1/2 flex flex-col items-start">
                                <p class="font-medium text-lg text-gray-700">Pie de Página del Médico Firmante:</p>
                                <div class="mt-6 p-4 border rounded-lg bg-gray-50 text-left">                  
                                    <p class="text-sm text-gray-800 mt-2">
                                        <span class="font-medium" v-if="piePaginaFirmante.nombre">
                                            {{ piePaginaFirmante.tituloProfesional }} {{ piePaginaFirmante.nombre }}
                                        </span><br v-if="piePaginaFirmante.nombre">
                                        
                                        <span v-if="piePaginaFirmante.numeroCedulaProfesional" class="font-light">
                                            Cédula Profesional Médico Cirujano No. {{ piePaginaFirmante.numeroCedulaProfesional }}
                                        </span><br v-if="piePaginaFirmante.numeroCedulaProfesional">
                                        
                                        <span v-if="piePaginaFirmante.especialistaSaludTrabajo && !piePaginaFirmante.numeroCedulaEspecialista" class="font-light">
                                            Especialista en Medicina del Trabajo
                                        </span>
                                        <span v-else-if="piePaginaFirmante.numeroCedulaEspecialista" class="font-light">
                                            Cédula Especialidad Med. del Trab. No. {{ piePaginaFirmante.numeroCedulaEspecialista }}
                                        </span><br v-if="piePaginaFirmante.especialistaSaludTrabajo">
                                        
                                        <span v-if="piePaginaFirmante.nombreCredencialAdicional" 
                                            class="font-light block truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[390px]">
                                            {{ piePaginaFirmante.nombreCredencialAdicional }} No. {{ piePaginaFirmante.numeroCredencialAdicional }}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <!-- Vista previa de las Firmas (Derecha) -->
                            <div class="flex flex-row justify-center items-center gap-4">
                                <div v-if="medicoFirmante.medicoFirmante?.firma?.data" class="w-full flex flex-col items-center">
                                    <p class="font-medium text-lg text-gray-700">Firma actual:</p>
                                    <img :src="firmaSrc" alt="'Firma de ' + medicoFirmante.medicoFirmante.nombre"
                                        class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg"/>
                                </div>

                                <!-- Firma Nueva -->
                                <Transition appear name="fade-slow">
                                    <div v-if="firmaPreview" class="w-full flex flex-col items-center">
                                        <p class="font-medium text-lg text-gray-700">Firma Nueva:</p>
                                        <img :src="firmaPreview" alt="Vista previa de la firma"
                                            class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                                    </div>
                                </Transition>
                            </div>

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
