<script setup>

</script>

<template>
    <div class="modal fixed top-0 left-0 z-10 px-8 pt-4 pb-28 h-screen w-full grid place-items-center">
        <div class="absolute top-0 left-0 w-full h-full bg-emerald-700 bg-opacity-60 backdrop-blur-sm"></div>
        <div class="modal-inner bg-white text-gray-900 relative w-full md:w-3/5 p-10 rounded-lg shadow-md shadow-slate-900">
            <div class="modal-close absolute h-14 w-14 flex justify-center items-center top-0 right-0 text-5xl text-gray-200 cursor-pointer">
                &times;
            </div>
            <h1>Registrar Empresa</h1>
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
                    accept=".png, .jpg, .jpeg, .svg"
                    multiple="false"
                    name="logotipo"
                    validation="required"
                    :validation-messages="{ required: 'Este campo es obligatorio'}"
                />
                <FormKit type="submit">Guardar Empresa</FormKit>
            </FormKit>
            <button class="border border-emerald-500 hover:bg-emerald-500 rounded-lg text-gray-800 font-semibold w-full p-3 mt-4">
                Cerrar
            </button>
        </div>
    </div>
</template>

<style scoped>


</style>