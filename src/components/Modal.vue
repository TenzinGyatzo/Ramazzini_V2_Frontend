<script setup>

</script>

<template>
<div class="mx-auto max-w-full bg-white rounded-md shadow-lg drop-shadow-md">
  <div class="px-4 py-3 flex justify-between">
    <div>
      <h2 class="font-bold" style="font-size: 32px">Registra una empresa</h2>
      <p class="text-gray-500" style="font-size: 15px">Es rápido y sencillo.</p>
    </div>
    <div style="cursor: pointer" class="text-gray-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </div>
  </div>
  <hr class="bg-gray-600" />
  <div class="flex flex-col md:flex-row gap-2">
    <div class="form-section w-full">
        <div class="p-4 space-y-3 rounded-lg w-full">
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
                        help="Png sin fondo"
                        multiple="false"
                        name="logotipo"
                        validation="required"
                        :validation-messages="{ required: 'Este campo es obligatorio'}"
                    />

                    <FormKit type="submit">Guardar Empresa</FormKit>

                </FormKit>
                </div>

        </div>

  <div class="logo-section">
    <div class="logo-section-body">
        <p class="logo-section-title">Carga el logotipo de la empresa</p>
        <p class="logo-section-description">Preferir archivos tipo png sin fondo</p>
        <button class="upload-area">
        <span class="upload-area-icon">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="35"
            height="35"
            viewBox="0 0 340.531 419.116"
            >
            <g id="files-new" clip-path="url(#clip-files-new)">
                <path
                id="Union_2"
                data-name="Union 2"
                d="M-2904.708-8.885A39.292,39.292,0,0,1-2944-48.177V-388.708A39.292,39.292,0,0,1-2904.708-428h209.558a13.1,13.1,0,0,1,9.3,3.8l78.584,78.584a13.1,13.1,0,0,1,3.8,9.3V-48.177a39.292,39.292,0,0,1-39.292,39.292Zm-13.1-379.823V-48.177a13.1,13.1,0,0,0,13.1,13.1h261.947a13.1,13.1,0,0,0,13.1-13.1V-323.221h-52.39a26.2,26.2,0,0,1-26.194-26.195v-52.39h-196.46A13.1,13.1,0,0,0-2917.805-388.708Zm146.5,241.621a14.269,14.269,0,0,1-7.883-12.758v-19.113h-68.841c-7.869,0-7.87-47.619,0-47.619h68.842v-18.8a14.271,14.271,0,0,1,7.882-12.758,14.239,14.239,0,0,1,14.925,1.354l57.019,42.764c.242.185.328.485.555.671a13.9,13.9,0,0,1,2.751,3.292,14.57,14.57,0,0,1,.984,1.454,14.114,14.114,0,0,1,1.411,5.987,14.006,14.006,0,0,1-1.411,5.973,14.653,14.653,0,0,1-.984,1.468,13.9,13.9,0,0,1-2.751,3.293c-.228.2-.313.485-.555.671l-57.019,42.764a14.26,14.26,0,0,1-8.558,2.847A14.326,14.326,0,0,1-2771.3-147.087Z"
                transform="translate(2944 428)"
                fill="var(--c-action-primary)"
                ></path>
            </g>
            </svg>
        </span>
        <span class="upload-area-title">Arrastra el logo aquí para cargarlo.</span>
        <span class="upload-area-description">
            Alternativamente, puedes cargarlo haciendo <br /><strong
            >click aquí</strong
            >
        </span>
        </button>
    </div>
    </div>
</div>
    <div class="logo-section-footer">
        <button class="btn-secondary">Cancel</button>
        <button class="btn-primary">Upload File</button>
    </div>
</div>







</template>

<style scoped>
.logo-section {
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 0.5rem;

}

.logo-section-header {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: start;
  -ms-flex-align: start;
  align-items: flex-start;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
}

.logo-circle {
  width: 3.5rem;
  height: 3.5rem;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border-radius: 50%;
  background-color: #e9e5ff;
  fill: #1cc972;
}

.btn-close {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.25rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.btn-close:hover,
.btn-close:focus {
  background-color: #e9e5ff;
}

.logo-section-body {
  padding: 1rem ;
}

.logo-section-title {
  font-weight: 700;
}

.logo-section-description {
  color: #6a6b76;
}

.upload-area {
  margin-top: 1.25rem;
  background-color: transparent;
  padding: 3rem;
  width: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: 1px dashed #6a6b76;
}

.upload-area:hover,
.upload-area:focus {
  cursor: pointer;
  border: 1px solid #6a6b76;
}

.upload-area:hover .upload-area-icon,
.upload-area:focus .upload-area-icon {
  -webkit-transform: scale(1.3);
  -ms-transform: scale(1.3);
  transform: scale(1.3);
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}

.upload-area-icon {
  display: block;
  width: 2.25rem;
  height: 2.25rem;
  fill: #1cc972;
}

.upload-area-title {
  margin-top: 1rem;
  display: block;
  font-weight: 700;
  color: #0d0f21;
}

.upload-area-description {
  display: block;
  color: #6a6b76;
}

.upload-area-description strong {
  color: #1cc972;
  font-weight: 700;
}

.logo-section-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: end;
  -ms-flex-pack: end;
  justify-content: flex-end;
}

.logo-section-footer [class*="btn-"] {
  margin-left: 0.75rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.5rem 1rem;
  font-weight: 500;
  border: 2px solid #e5e5e5;
  border-radius: 0.25rem;
  background-color: transparent;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background-color: #1cc972;
  border-color: #1cc972;
  cursor: pointer;
}

</style>