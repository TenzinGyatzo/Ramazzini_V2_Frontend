<script setup>
import { ref, inject } from "vue";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { useRouter } from "vue-router";

const proveedorSalud = useProveedorSaludStore();
const router = useRouter();

const logotipoPreview = ref(null);
const logotipoArchivo = ref(null);

const toast = inject("toast");

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

  // Agregar solo los campos con valores definidos
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  // Asegurar que solo se agrega un archivo válido
  if (logotipoArchivo.value instanceof File) {
    formData.append("logotipoEmpresa", logotipoArchivo.value);
  }

  // 🚀 Eliminar logotipoEmpresa si sigue en FormData como un string vacío
  if (formData.get("logotipoEmpresa") === "") {
    formData.delete("logotipoEmpresa");
  }

  // Depuramos el contenido de FormData
  for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
  }

  try {
    let response;

    if (proveedorSalud.proveedorSalud._id) {
      // Actualizar proveedor existente
      response = await proveedorSalud.updateProveedorById(
        proveedorSalud.proveedorSalud._id,
        formData
      );
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
    console.error("Error al crear o actualizar el proveedor:", error);
    alert(
      "Hubo un error al crear o actualizar el proveedor, por favor intente nuevamente."
    );
  }
};

const volver = () => {
  router.push({ name: "inicio" });
};

const perfiles = [
  "Médico único de empresa",
  "Médico independiente que brinda servicios a empresas",
  "Empresa de salud ocupacional",
  "Equipo Médico Interno de la Empresa",
  "Otro",
];

const estadosDeMexico = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Coahuila",
  "Colima",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Estado de México",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];
</script>

<template>
    <!-- <Transition appear name="fade-slow"> -->
    <Transition appear mode="out-in" name="slide-up">
    <div
      class="relative bg-white text-gray-800 w-full max-w-5xl p-10 mt-2 rounded-lg max-h-[82vh] shadow-lg overflow-y-auto mx-auto">
      <Transition appear name="fade-slow">
        <div v-if="proveedorSalud.loading">
          <!-- <h1 class="text-3xl text-center">Cargando proveedor...</h1> -->
        </div>
        <div v-else>
          <h1 class="text-3xl">Perfil de Proveedor de Servicios de Salud Ocupacional</h1>
          <hr class="mt-2 mb-3" />

          <FormKit type="form" :actions="false" incomplete-message="Por favor, valide que los datos sean correctos*"
            @submit="handleSubmit">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormKit type="text" label="Razón Social, nombre o denominación*" name="nombre"
                placeholder="¿Cual es tu nombre, denominación o razón social?" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="proveedorSalud.proveedorSalud.nombre" />

              <FormKit type="text" label="RFC" name="RFC" placeholder="RFC del proveedor"
                validation="required|rfcValidation" :validation-messages="{
                  required: 'Este campo es obligatorio',
                  rfcValidation: 'El RFC ingresado no es válido.',
                }" :value="proveedorSalud.proveedorSalud?.RFC" />

              <FormKit type="select" label="Perfil de proveedor*" name="perfilProveedorSalud"
                placeholder="Selecciona el que te describa mejor:" :options="perfiles" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="proveedorSalud.proveedorSalud.perfilProveedorSalud" />

              <FormKit type="select" label="Estado" name="estado" placeholder="Seleccione su estado"
                :options="estadosDeMexico" :value="proveedorSalud.proveedorSalud?.estado || ''" />

              <FormKit type="text" label="Municipio" name="municipio" placeholder="Municipio del proveedor"
                :value="proveedorSalud.proveedorSalud?.municipio" />

              <FormKit type="text" label="Código Postal" name="codigoPostal" placeholder="Ej. 44100"
                validation="postalCodeValidation" :value="proveedorSalud.proveedorSalud?.codigoPostal"
                :validation-messages="{
                  postalCodeValidation:
                    'El código postal debe tener 5 dígitos.',
                }" />

              <FormKit type="text" label="Dirección (Calle, número y colonia)" name="direccion"
                placeholder="Ej. Calle Madero #123, Colonia Centro" :value="proveedorSalud.proveedorSalud?.direccion" />

              <FormKit type="text" label="Teléfono" name="telefono" placeholder="10 dígitos"
                validation="phoneValidation" :value="proveedorSalud.proveedorSalud?.telefono" :validation-messages="{
                  phoneValidation:
                    'El número de teléfono debe tener 10 dígitos.',
                }" />

              <FormKit type="text" label="Correo Electrónico" name="correoElectronico"
                placeholder="Correo electrónico del proveedor" validation="mailValidation"
                :value="proveedorSalud.proveedorSalud?.correoElectronico" :validation-messages="{
                  mailValidation:
                    'El correo electrónico ingresado no es válido.',
                }" />

              <FormKit type="text" label="Sitio Web" name="sitioWeb" placeholder="Sitio web del proveedor"
                validation="urlValidation" :value="proveedorSalud.proveedorSalud?.sitioWeb" :validation-messages="{
                  urlValidation: 'El sitio web ingresado no es válido.',
                }" />
            </div>

            <FormKit type="file" label="Logotipo (Asegura que sea .png sin fondo, cuadrada, de al menos 500 x 500px, con el menor espacio posible entre el logo y el borde de la imagen)" name="logotipoEmpresa" accept=".png, .jpg, .jpeg, .svg"
              multiple="false" @change="handleFileChange" />

            <!-- Mostrar la vista previa del logotipo -->
            <div class="flex flex-row justify-center items-center gap-4">
              <div v-if="proveedorSalud.proveedorSalud?.logotipoEmpresa?.data" class="w-1/2 flex flex-col items-center">
                <p class="font-medium text-lg text-gray-700">
                  Logotipo actual:
                </p>
                <img :src="'http://localhost:3000/assets/providers-logos/' +
                  proveedorSalud.proveedorSalud.logotipoEmpresa?.data +
                  '?t=' +
                  Date.now()
                  " :alt="'Logo de ' + proveedorSalud.proveedorSalud.nombreComercial
                    " class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
              </div>

              <Transition appear name="fade-slow">
                <div v-if="logotipoPreview" class="w-1/2 flex flex-col items-center">
                  <p v-if="proveedorSalud.proveedorSalud?.logotipoEmpresa?.data"
                    class="font-medium text-lg text-gray-700">
                    Logotipo nuevo:
                  </p>
                  <p v-else class="font-medium text-lg text-gray-700">
                    Logotipo:
                  </p>
                  <img :src="logotipoPreview" alt="Vista previa del logotipo"
                    class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                </div>
              </Transition>
            </div>
            <hr class="my-3" />
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
