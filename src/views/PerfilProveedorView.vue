<script setup>
import { ref, inject, computed, watchEffect } from "vue";
import { useProveedorSaludStore } from "@/stores/proveedorSalud";
import { useRouter } from "vue-router";
import CountryPhoneInput from "@/components/CountryPhoneInput.vue";
import CountrySelect from "@/components/CountrySelect.vue";

const proveedorSalud = useProveedorSaludStore();
const router = useRouter();

const logotipoPreview = ref(null);
const logotipoArchivo = ref(null);
const isDragOver = ref(false);  // Para el estado de drag and drop
const toast = inject("toast");

const colorInforme = ref("#343A40");
const semaforizacionActivada = ref(false);

// Objeto reactivo para el formulario
const formulario = ref({
  nombre: "",
  direccion: "",
  municipio: "",
  estado: "",
  telefono: "",
  sitioWeb: "",
  pais: "",
  correoElectronico: "",
  perfilProveedorSalud: "", 
  codigoPostal: ""          
});

// Cargar los valores iniciales del proveedor en el formulario
watchEffect(() => {
  if (proveedorSalud.proveedorSalud) {
    Object.assign(formulario.value, {
      nombre: proveedorSalud.proveedorSalud.nombre ?? "",
      direccion: proveedorSalud.proveedorSalud.direccion ?? "",
      municipio: proveedorSalud.proveedorSalud.municipio ?? "",
      estado: proveedorSalud.proveedorSalud.estado ?? "",
      telefono: proveedorSalud.proveedorSalud.telefono ?? "",
      sitioWeb: proveedorSalud.proveedorSalud.sitioWeb ?? "",
      pais: proveedorSalud.proveedorSalud.pais ?? "",
      correoElectronico: proveedorSalud.proveedorSalud.correoElectronico ?? "",
      perfilProveedorSalud: proveedorSalud.proveedorSalud.perfilProveedorSalud ?? "", 
      codigoPostal: proveedorSalud.proveedorSalud.codigoPostal ?? ""                 
    });

    colorInforme.value = proveedorSalud.proveedorSalud.colorInforme || "#343A40";
    semaforizacionActivada.value = proveedorSalud.proveedorSalud.semaforizacionActivada ?? false;
  }
});

// Función para validar archivo
const validateFile = (file) => {
  const validExtensions = ['.png', '.jpg', '.jpeg'];
  const maxSizeMB = 1;
  
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!validExtensions.includes(extension)) {
    return { valid: false, message: 'Solo se permiten archivos: PNG, JPG, JPEG' };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, message: `El archivo es muy grande. Límite: ${maxSizeMB}MB` };
  }
  return { valid: true };
};

// Computed Reactivo para el Pie de Página del Informe
const piePaginaInforme = computed(() => ({
  nombre: formulario.value.nombre || "",
  direccion: formulario.value.direccion || "",
  municipio: formulario.value.municipio || "",
  estado: formulario.value.estado || "",
  telefono: formatearTelefono(formulario.value.telefono),
  sitioWeb: formulario.value.sitioWeb || "",
  RFC: formulario.value.RFC || "",
  correoElectronico: formulario.value.correoElectronico || ""
}));

// Función para formatear el teléfono internacional
function formatearTelefono(telefono) {
  if (!telefono) {
    return ''; 
  }
  
  // Si el teléfono ya tiene formato internacional (+52XXXXXXXXXX)
  if (telefono.startsWith('+')) {
    // Buscar el país correspondiente para obtener el código
    const countries = [
      { code: 'MX', dialCode: '+52' },
      { code: 'AR', dialCode: '+54' },
      { code: 'BR', dialCode: '+55' },
      { code: 'CL', dialCode: '+56' },
      { code: 'CO', dialCode: '+57' },
      { code: 'PE', dialCode: '+51' },
      { code: 'VE', dialCode: '+58' },
      { code: 'UY', dialCode: '+598' },
      { code: 'PY', dialCode: '+595' },
      { code: 'BO', dialCode: '+591' },
      { code: 'EC', dialCode: '+593' },
      { code: 'GT', dialCode: '+502' },
      { code: 'CR', dialCode: '+506' },
      { code: 'PA', dialCode: '+507' },
      { code: 'HN', dialCode: '+504' },
      { code: 'NI', dialCode: '+505' },
      { code: 'SV', dialCode: '+503' },
      { code: 'CU', dialCode: '+53' },
      { code: 'DO', dialCode: '+1' },
      { code: 'PR', dialCode: '+1' }
    ];
    
    // Encontrar el país por código de marcación
    const country = countries.find(c => telefono.startsWith(c.dialCode));
    if (country) {
      const numeroLocal = telefono.replace(country.dialCode, '');
      return `(${country.dialCode}) ${numeroLocal}`;
    }
  }
  
  // Si es un número local de 10 dígitos (México)
  if (telefono.length === 10 && /^\d{10}$/.test(telefono)) {
    return `(+52) ${telefono}`;
  }
  
  // Si es un número local de otros países (8-11 dígitos)
  if (telefono.length >= 8 && telefono.length <= 11 && /^\d+$/.test(telefono)) {
    return `(+XX) ${telefono}`;
  }
  
  // Si no coincide con ningún formato conocido, devolver tal como está
  return telefono;
}

// Lista de opciones de colores predefinidos
const colorOptions = [
  { name: "Gris Oscuro", hex: "#343A40" },
  { name: "Gris", hex: "#6C757D" },
  // { name: "Gris Claro", hex: "#F8F9FA" },
  { name: "Azul Oscuro", hex: "#004085" },
  { name: "Azul Profesional", hex: "#007BFF" },
  { name: "Turquesa Oscuro", hex: "#138496" },
  { name: "Turquesa", hex: "#17A2B8" },
  { name: "Azul Claro", hex: "#2BB9D9" },
  { name: "Verde Oscuro", hex: "#1E7E34" },
  { name: "Verde Médico", hex: "#28A745" },
  { name: "Rojo Oscuro", hex: "#C82333" },
  { name: "Rojo Médico", hex: "#DC3545" },
  { name: "Naranja", hex: "#E67E22" },
  { name: "Oro", hex: "#E0A800" },
];

const handleFileChange = (event) => {
  const file = event?.target?.files?.[0];
  if (file && file instanceof File) {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.open({ message: validation.message, type: 'error' });
      return;
    }
    
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

// Eventos de drag and drop
const handleDragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();
  // Solo cambiar a false si salimos del área de drop
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = false;
  
  const files = Array.from(event.dataTransfer.files);
  if (files.length > 0) {
    const file = files[0]; // Solo tomamos el primer archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.open({ message: validation.message, type: 'error' });
      return;
    }
    
    logotipoArchivo.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      logotipoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async (data) => {
  const formData = new FormData();

  // Agregar solo los campos con valores definidos
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  // Agregar personalización de informes
  formData.append("colorInforme", colorInforme.value);
  formData.append("semaforizacionActivada", semaforizacionActivada.value);
  
  // Agregar teléfono del formulario (CountryPhoneInput no es FormKit)
  if (formulario.value.telefono) {
    formData.append("telefono", formulario.value.telefono);
  }

  // Agregar país del formulario (CountrySelect no es FormKit)
  if (formulario.value.pais) {
    formData.append("pais", formulario.value.pais);
  }

  // Asegurar que solo se agrega un archivo válido
  if (logotipoArchivo.value instanceof File) {
    formData.append("logotipoEmpresa", logotipoArchivo.value);
  }

  // 🚀 Eliminar logotipoEmpresa si sigue en FormData como un string vacío
  if (formData.get("logotipoEmpresa") === "") {
    formData.delete("logotipoEmpresa");
  }

  // Depuramos el contenido de FormData
  // for (let [key, value] of formData.entries()) {
  //     console.log(`${key}:`, value);
  // }

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

const baseURL = import.meta.env.VITE_API_URL || 'https://ramazzini.app';
// console.log('baseURL:', baseURL);

const logoSrc = computed(() => {
  return `${baseURL}/assets/providers-logos/${proveedorSalud.proveedorSalud.logotipoEmpresa?.data}?t=${Date.now()}`;
});
// console.log('logoSrc:', logoSrc.value);

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

          <!-- <div class="bg-amber-100 text-amber-800 p-3 rounded-md mb-4 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M3 3l18 18M9 13h6m-3 0v6m0 0l3-3m-3 3l-3-3" />
            </svg>
            <p class="font-medium">
              Los datos capturados en este formulario aparecerán automáticamente en el pie de página de sus informes.
            </p>
          </div> -->

          <FormKit type="form" :actions="false" incomplete-message="Por favor, valide que los datos sean correctos*"
            @submit="handleSubmit">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mb-4">
              <FormKit type="text" name="nombre"
                placeholder="¿Cual es tu nombre, denominación o razón social?" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                v-model="formulario.nombre">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Razón Social, nombre o denominación<span class="text-red-500">*</span></span>
                </template>
              </FormKit>

              <CountrySelect
                label="País"
                placeholder="Selecciona tu país"
                v-model="formulario.pais"
                validation="required"
              />

              <FormKit type="select" name="perfilProveedorSalud"
                placeholder="Selecciona el que te describa mejor:" :options="perfiles" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                v-model="formulario.perfilProveedorSalud">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Perfil de proveedor<span class="text-red-500">*</span></span>
                </template>
              </FormKit>

              <FormKit type="text" label="Región/Provincia/Estado" name="estado" placeholder="Ej. Estado de México, Buenos Aires, São Paulo"
                v-model="formulario.estado" />

              <FormKit type="text" label="Ciudad/Municipio" name="municipio" placeholder="Ej. Ciudad de México, Bogotá, Lima"
                v-model="formulario.municipio" />

              <FormKit type="text" label="Código Postal" name="codigoPostal" placeholder="Ej. 44100, 1000, 01000"
                validation="postalCodeValidation" v-model="formulario.codigoPostal"
                :validation-messages="{
                  postalCodeValidation:
                    'El código postal debe tener entre 4 y 10 dígitos.',
                }" />

              <FormKit type="text" label="Dirección (Calle, número y colonia)" name="direccion"
                placeholder="Ej. Calle Madero #123, Colonia Centro" v-model="formulario.direccion" />

              <CountryPhoneInput
                label="Teléfono"
                placeholder="Número local"
                v-model="formulario.telefono"
                :initial-country="formulario.pais"
              />

              <FormKit type="text" label="Correo Electrónico" name="correoElectronico"
                placeholder="Correo electrónico del proveedor" validation="mailValidation"
                v-model="formulario.correoElectronico" :validation-messages="{
                  mailValidation:
                    'El correo electrónico ingresado no es válido.',
                }" />

              <FormKit type="text" label="Sitio Web" name="sitioWeb" placeholder="Sitio web del proveedor"
                validation="urlValidation" v-model="formulario.sitioWeb" :validation-messages="{
                  urlValidation: 'El sitio web ingresado no es válido.',
                }" />

              <!-- Selector de Color -->
              <div>
                <label class="block mt-4 font-medium text-lg text-gray-700">Color del informe</label>
                <div class="flex flex-wrap gap-2">
                  <button
                  v-for="color in colorOptions"
                  :key="color.hex"
                  :style="{ backgroundColor: color.hex }"
                  class="w-10 h-10 rounded-full border-2 transition-all duration-200"
                  :class="colorInforme === color.hex ? 'border-black scale-110 shadow-lg' : 'border-gray-300'"
                  @click.prevent="colorInforme = color.hex"
                  :title="color.name"
                  >
                  <span v-if="colorInforme === color.hex" class="absolute text-white top-0.5 right-2.5 text-2xl">
                    ✓
                  </span>
                  </button>
                </div>
                <p class="mt-2 text-sm text-gray-600">Color seleccionado: <span class="font-semibold">{{ colorOptions.find(c => c.hex === colorInforme)?.name }}</span></p>
              </div>

              <!-- Switch para Activar Semaforización -->
              <div>
                <label class="block mt-4 font-medium text-lg text-gray-700">Activar Semaforización de Resultados🚦</label>
                
                <button
                  type="button"
                  @click="semaforizacionActivada = !semaforizacionActivada"
                  :class="semaforizacionActivada ? 'bg-emerald-500' : 'bg-gray-300'"
                  class="relative w-14 h-7 rounded-full transition-colors"
                >
                  <span 
                    class="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform"
                    :class="semaforizacionActivada ? 'translate-x-7' : ''">
                  </span>
                </button>
                <p class="mt-2 text-sm text-gray-600 hidden sm:block">La semaforización permite el uso de colores en los resultados de los informes (<span class="text-emerald-700">Apto sin restricciones</span>, <span class="text-amber-700">Apto con restricciones</span>, <span class="text-red-700">No apto</span>) haciéndolo más claro y fácil de entender.</p>
              </div>

            </div>

            <!-- Área de arrastrar y soltar para el logotipo -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Logotipo (Asegura que sea .png sin fondo, cuadrada, de al menos 500 x 500px, con el menor espacio posible entre el logo y el borde de la imagen)</label>
              <div 
                class="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer"
                :class="[
                  isDragOver 
                    ? 'border-emerald-500 bg-emerald-50 scale-105' 
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                ]"
                @dragenter="handleDragEnter"
                @dragleave="handleDragLeave"
                @dragover="handleDragOver"
                @drop="handleDrop"
                @click="$refs.logotipoInput.click()"
              >
                <input
                  ref="logotipoInput"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  @change="handleFileChange"
                  class="hidden"
                />
                
                <div class="text-gray-600">
                  <!-- Icono dinámico -->
                  <div class="mx-auto h-12 w-12 mb-4 transition-all duration-200" :class="isDragOver ? 'scale-110' : ''">
                    <div v-if="!isDragOver" class="flex items-center justify-center">
                      <svg class="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>

                    <div v-else class="flex items-center justify-center">
                      <svg class="h-12 w-12 text-emerald-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Texto dinámico -->
                  <p class="text-lg font-medium transition-colors duration-200" :class="isDragOver ? 'text-emerald-700' : ''">
                    {{ isDragOver ? '¡Suelta el logotipo aquí!' : 'Arrastra el logotipo aquí o haz clic para seleccionar' }}
                  </p>
                  <p class="text-sm text-gray-500 mt-2">PNG, JPG, JPEG (máximo 1MB)</p>
                  
                  <!-- Indicador visual cuando se arrastra -->
                  <div v-if="isDragOver" class="mt-3">
                    <div class="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Listo para soltar
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mostrar la vista previa del logotipo -->
            <div class="flex flex-row justify-center items-center gap-4">
              <div v-if="proveedorSalud.proveedorSalud?.logotipoEmpresa?.data" class="w-1/3 flex flex-col items-center">
                <p class="font-medium text-lg text-gray-700">
                  Logotipo actual:
                </p>
                <img
                  :src="logoSrc"
                  :alt="'Logo de ' + proveedorSalud.proveedorSalud.nombre"
                  class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg"
                />
              </div>

              <Transition appear name="fade-slow">
                <div v-if="logotipoPreview" class="w-1/3 flex flex-col items-center">
                  <p v-if="proveedorSalud.proveedorSalud?.logotipoEmpresa?.data" class="font-medium text-lg text-gray-700">
                    Logotipo nuevo:
                  </p>
                  <p v-else class="font-medium text-lg text-gray-700">
                    Logotipo:
                  </p>
                  <img :src="logotipoPreview" alt="Vista previa del logotipo"
                    class="w-48 h-48 object-contain mt-2 border-2 border-gray-300 rounded-lg" />
                </div>
              </Transition>
              
              <!-- Vista previa del Pie de Página del Informe -->
              <div v-if="piePaginaInforme.nombre" class="w-1/2 flex flex-col items-center">
                <p class="font-medium text-lg text-gray-700">
                  Pie de Página en Informes:
                </p>
                <div class="mt-6 p-4 border rounded-lg bg-gray-50 text-right">                  
                  <p class="text-sm text-gray-800 mt-2 italic">
                    <span v-if="piePaginaInforme.nombre" class="font-medium">{{ piePaginaInforme.nombre }}</span><br v-if="piePaginaInforme.nombre">
                    
                    <span v-if="piePaginaInforme.direccion" class="font-light">{{ piePaginaInforme.direccion }}</span><br v-if="piePaginaInforme.direccion">
                    
                    <span class="font-light" v-if="piePaginaInforme.municipio || piePaginaInforme.estado">
                      <span v-if="piePaginaInforme.municipio">{{ piePaginaInforme.municipio }}</span>
                      <span v-if="piePaginaInforme.municipio && piePaginaInforme.estado">, </span>
                      <span v-if="piePaginaInforme.estado">{{ piePaginaInforme.estado }}, </span>
                      <span v-if="piePaginaInforme.telefono">Tel. {{ piePaginaInforme.telefono }}</span>
                    </span><br v-if="piePaginaInforme.municipio || piePaginaInforme.estado || piePaginaInforme.telefono">
                    
                    <span v-if="piePaginaInforme.sitioWeb" class="font-light text-blue-700">{{ piePaginaInforme.sitioWeb }}</span>
                  </p>
                </div>
              </div>
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
