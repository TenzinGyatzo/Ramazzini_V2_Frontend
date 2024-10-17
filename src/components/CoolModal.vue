<script setup>

    defineEmits(['closeModal'])
    const handleSubmit = async (data) => {
        console.log(data)
    }
</script>

<template>
    <div class="modal fixed top-0 left-0 z-10 px-8 pt-4 pb-28 h-screen w-full grid place-items-center" >
        <div class="absolute top-0 left-0 w-full h-full bg-emerald-900 bg-opacity-50 backdrop-blur-sm" @click="$emit('closeModal')"></div>
        <Transition appear name="fade">
            <div class="modal-inner bg-white text-gray-900 relative w-full sm:w-4/5 md:w-3/5 xl:w-2/5 p-10 rounded-lg shadow-md shadow-slate-900 transition-all duration-300 ease-out">
                <div 
                    class="modal-close absolute h-14 w-14 flex justify-center items-center top-0 right-0 text-5xl text-gray-400 hover:text-gray-500 cursor-pointer" @click="$emit('closeModal')"
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
                        label="Nombre Comercial"
                        name="nombreComercial"
                        placeholder="Nombre comercial de la empresa"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="text"
                        label="Razón Social"
                        name="razonSocial"
                        placeholder="Razón social de la empresa"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="text"
                        label="RFC"
                        name="RFC"
                        placeholder="RFC"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="text"
                        label="Giro de la empresa"
                        name="giroEmpresa"
                        placeholder="Giro de la Empresa"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <FormKit 
                        type="file"
                        label="Logotipo"
                        name="logotipo"
                        accept=".png, .jpg, .jpeg, .svg"
                        multiple="false"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />
                    <hr class="my-3">
                    <FormKit type="submit" @click="handleSubmit">Guardar Empresa</FormKit>
                </FormKit>
                <button 
                    class="border-2 border-emerald-500 hover:bg-emerald-100 rounded-lg text-gray-800 font-semibold w-full p-3 mt-4"
                    @click="$emit('closeModal')"
                >
                    Cerrar
                </button>
            </div>
        </Transition>
    </div>
</template>

<style scoped>


</style>