<script setup>
    import { useEmpresasStore } from '@/stores/empresas';

    const empresas = useEmpresasStore();
    const emit = defineEmits(['closeModal'])

    const handleSubmit = async (data) => {
        console.log('Formulario Enviado:',data)

        // Crear instancia de FormData
        const formData = new FormData();

        // Añadir los datos del formulario al FormData 
        formData.append('nombreComercial', data.nombreComercial);
        formData.append('razonSocial', data.razonSocial);
        formData.append('RFC', data.RFC);
        formData.append('giroDeEmpresa', data.giroDeEmpresa);
        formData.append('baseOperaciones', 'Pruebas');
        formData.append('createdBy', '6650f38308ac3beedf5ac41b');
        formData.append('updatedBy', '6650f38308ac3beedf5ac41b');

        // Acceder al archivo dentro del objeto logotipoEmpresa[0]
        const archivoLogotipo = data.logotipoEmpresa[0]?.file;

        if (archivoLogotipo && archivoLogotipo instanceof File) {
            formData.append('logotipoEmpresa', archivoLogotipo);
        } else {
            console.error('El archivo no es una instancia de File:', archivoLogotipo);
        }

        // Llamar al método del store para crear la empresa
        try {
            await empresas.createEmpresa(formData);
            // TODO: Agregar un TOAST de exito
            emit('closeModal');
            empresas.fetchEmpresas();
        } catch (error) {
            console.error('Error al crear la empresa:', error);
            alert('Hubo un error al crear la empresa, por favor intente nuevamente.');
        }
    }
</script>

<template>
    <div class="modal fixed top-0 left-0 z-10 px-8 pt-4 pb-28 h-screen w-full grid place-items-center" >
        <div class="absolute top-0 left-0 w-full h-full bg-emerald-900 bg-opacity-50 backdrop-blur-sm" @click="$emit('closeModal')"></div>
        <Transition appear name="fade">
            <div class="modal-inner bg-white text-gray-900 relative w-full sm:w-4/5 md:w-3/5 xl:w-2/5 p-10 rounded-lg shadow-md shadow-slate-900 transition-all duration-300 ease-out">
                <div 
                    class="modal-close absolute h-14 w-14 flex justify-center items-center top-0 right-0 text-5xl text-gray-400 hover:text-gray-500 cursor-pointer hover:scale-110 transition-transform transform" @click="$emit('closeModal')"
                >
                    &times;
                </div>
                <h1 class="text-3xl">Registrar Empresa</h1>
                <hr class="mt-2 mb-3">
                <FormKit
                    type="form"
                    :actions="false"
                    incomplete-message="Por favor complete todos los campos"
                    @submit="handleSubmit"
                >
                    <FormKit 
                        type="text"
                        label="Nombre Comercial*"
                        name="nombreComercial"
                        placeholder="Nombre comercial de la empresa"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="text"
                        label="Razón Social*"
                        name="razonSocial"
                        placeholder="Razón social de la empresa"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="text"
                        label="RFC*"
                        name="RFC"
                        placeholder="RFC"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="text"
                        label="Giro de la empresa*"
                        name="giroDeEmpresa"
                        placeholder="Giro de la Empresa"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="file"
                        label="Logotipo*"
                        name="logotipoEmpresa"
                        accept=".png, .jpg, .jpeg, .svg"
                        multiple="false"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <hr class="my-3">
                    <FormKit 
                        type="submit"
                        :disabled="empresas.loading" 
                    >
                        <span v-if="empresas.loading">Guardando...</span>
                        <span v-else>Guardar Empresa</span>
                    </FormKit>
                </FormKit>
                    <button 
                        class="text-xl mt-2 w-full border-2 border-gray-500 hover:bg-gray-200 rounded-lg text-gray-800 font-semibold p-3 transition-transform duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex-1"
                        @click="$emit('closeModal')"
                    >
                        Cerrar
                    </button>
            </div>
        </Transition>
    </div>
</template>
