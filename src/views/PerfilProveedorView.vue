<script setup>
import { ref, inject } from 'vue';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useRouter } from 'vue-router';

const proveedorSalud = useProveedorSaludStore();
const router = useRouter();

const logotipoPreview = ref(null);
const logotipoArchivo = ref(null);

const toast = inject('toast');

const handleFileChange = (event) => {
    const file = event?.target?.files?.[0];
    if (file && file instanceof File) {
        logotipoArchivo.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            logotipoPreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        logotipoPreview.value = null;
        logotipoArchivo.value = null;
    }
};

const handleSubmit = async (data) => {
    const formData = new FormData();

    formData.append('nombreComercial', data.nombreComercial);
    formData.append('razonSocial', data.razonSocial);
    formData.append('RFC', data.RFC);
    formData.append('direccion', data.direccion);
    formData.append('ciudad', data.ciudad);
    formData.append('municipio', data.municipio);
    formData.append('estado', data.estado);
    formData.append('codigoPostal', data.codigoPostal);
    formData.append('telefono', data.telefono);
    formData.append('correoElectronico', data.correoElectronico);
    formData.append('sitioWeb', data.sitioWeb);

    if (logotipoArchivo.value) {
        formData.append('logotipoEmpresa', logotipoArchivo.value);
    }

    // Depuramos el contenido de FormData
    // for (let [key, value] of formData.entries()) {
    //     console.log(`${key}:`, value);
    // }

    try {
        let response;

        if (proveedorSalud.proveedorSalud._id) {
            // Actualizar proveedor existente
            response = await proveedorSalud.updateProveedorById(proveedorSalud.proveedorSalud._id, formData);
        } else {
            // Crear nuevo proveedor
            response = await proveedorSalud.createProveedor(formData);
        }

        toast.open({
            message: response.message,
        });

        // Usar el ID devuelto por el backend para recargar los datos
        const idProveedor = response.data._id || proveedorSalud.proveedorSalud._id;
        if (idProveedor) {
            await proveedorSalud.loadProveedorSalud(idProveedor);
        }

    } catch (error) {
        console.error('Error al crear o actualizar el proveedor:', error);
        alert('Hubo un error al crear o actualizar el proveedor, por favor intente nuevamente.');
    }
};

const volver = () => {
    router.push({ name: 'inicio' });
};

</script>

<template>
    <Transition appear name="fade-slow">
        <div
            class="relative bg-white text-gray-900 w-full max-w-5xl p-10 rounded-lg shadow-slate-900 max-h-[82vh] overflow-y-auto mx-auto">

            <Transition appear name="fade-slow">
                <div v-if="proveedorSalud.loading">
                    <!-- <h1 class="text-3xl text-center">Cargando proveedor...</h1> -->
                </div>
                <div v-else>
                    <h1 class="text-3xl">Proveedor de Servicios de Salud</h1>
                    <hr class="mt-2 mb-3">

                    <FormKit type="form" :actions="false"
                        incomplete-message="Por favor, valide que los datos sean correctos*" @submit="handleSubmit">
                        <FormKit type="text" label="Nombre Comercial*" name="nombreComercial"
                            placeholder="Nombre comercial del proveedor" validation="required"
                            :validation-messages="{ required: 'Este campo es obligatorio' }"
                            :value="proveedorSalud.proveedorSalud.nombreComercial" />
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <FormKit type="text" label="Razón Social" name="razonSocial"
                                placeholder="Razón social del proveedor"
                                :value="proveedorSalud.proveedorSalud?.razonSocial" />
                            <FormKit type="text" label="RFC" name="RFC" placeholder="RFC del proveedor"
                                validation="rfcValidation"
                                :validation-messages="{ rfcValidation: 'El RFC ingresado no es válido.' }"
                                :value="proveedorSalud.proveedorSalud?.RFC" />
                            <FormKit type="text" label="Dirección (Calle y número)" name="direccion"
                                placeholder="Dirección del proveedor"
                                :value="proveedorSalud.proveedorSalud?.direccion" />
                            <FormKit type="text" label="Ciudad" name="ciudad" placeholder="Ciudad del proveedor"
                                :value="proveedorSalud.proveedorSalud?.ciudad" />
                            <FormKit type="text" label="Municipio" name="municipio"
                                placeholder="Municipio del proveedor"
                                :value="proveedorSalud.proveedorSalud?.municipio" />
                            <FormKit type="text" label="Estado" name="estado" placeholder="Estado del proveedor"
                                :value="proveedorSalud.proveedorSalud?.estado" />
                            <FormKit type="text" label="Código Postal" name="codigoPostal"
                                placeholder="Código postal del proveedor" validation="postalCodeValidation"
                                :value="proveedorSalud.proveedorSalud?.codigoPostal"
                                :validation-messages="{ postalCodeValidation: 'El código postal debe tener 5 dígitos.' }" />
                            <FormKit type="text" label="Teléfono" name="telefono" placeholder="Teléfono del proveedor"
                                validation="phoneValidation" :value="proveedorSalud.proveedorSalud?.telefono"
                                :validation-messages="{ phoneValidation: 'El número de teléfono debe tener 10 dígitos.' }" />
                            <FormKit type="text" label="Correo Electrónico" name="correoElectronico"
                                placeholder="Correo electrónico del proveedor" validation="mailValidation"
                                :value="proveedorSalud.proveedorSalud?.correoElectronico"
                                :validation-messages="{ mailValidation: 'El correo electrónico ingresado no es válido.' }" />
                            <FormKit type="text" label="Sitio Web" name="sitioWeb" placeholder="Sitio web del proveedor"
                                validation="urlValidation" :value="proveedorSalud.proveedorSalud?.sitioWeb"
                                :validation-messages="{ urlValidation: 'El sitio web ingresado no es válido.' }" />
                        </div>

                        <FormKit type="file" label="Logotipo" name="logotipoEmpresa" accept=".png, .jpg, .jpeg, .svg"
                            multiple="false" @change="handleFileChange" />

                        <!-- Mostrar la vista previa del logotipo -->
                        <div class="flex flex-row justify-center items-center gap-4">
                            <div v-if="proveedorSalud.proveedorSalud?.logotipoEmpresa?.data"
                                class="w-1/2 flex flex-col items-center">
                                <p class="font-medium text-lg text-gray-700">Logotipo actual:</p>
                                <img :src="'/uploads/providers-logos/' + proveedorSalud.proveedorSalud.logotipoEmpresa?.data + '?t=' + Date.now()"
                                    :alt="'Logo de ' + proveedorSalud.proveedorSalud.nombreComercial"
                                    class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                            </div>

                            <Transition appear name="fade-slow">
                                <div v-if="logotipoPreview" class="w-1/2 flex flex-col items-center">
                                    <p v-if="proveedorSalud.proveedorSalud?.logotipoEmpresa?.data"
                                        class="font-medium text-lg text-gray-700">
                                        Logotipo nuevo:</p>
                                    <p v-else class="font-medium text-lg text-gray-700">Logotipo:</p>
                                    <img :src="logotipoPreview" alt="Vista previa del logotipo"
                                        class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                                </div>
                            </Transition>
                        </div>
                        <hr class="my-3">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <!-- Botón de Volver -->
                            <button
                                type="button"
                                class="text-lg w-full sm:w-1/2 rounded-lg bg-white font-medium text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg mb-1"
                                @click="volver">
                                Volver
                            </button>
                            <!-- Botón de Actualizar -->
                            <div class="w-full sm:w-1/2 pr-2">
                                <FormKit type="submit">
                                    <span v-if="proveedorSalud.loading">Guardando...</span>
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
