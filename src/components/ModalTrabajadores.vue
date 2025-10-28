<script setup>
import { inject, ref } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { useCurrentUser } from '@/composables/useCurrentUser';
import { convertirFechaISOaYYYYMMDD, calcularEdad, calcularAntiguedad } from '@/helpers/dates';
import { formatNombreCompleto } from '@/helpers/formatNombreCompleto';
import TrabajadoresAPI from '@/api/TrabajadoresAPI';

// Método para formatear la dirección (igual que en CentroTrabajoItem.vue)
const formatDireccion = (centro) => {
    const parts = [];
    if (centro.direccionCentro) parts.push(centro.direccionCentro);
    if (centro.codigoPostal) parts.push(centro.codigoPostal);
    if (centro.municipio) parts.push(centro.municipio);
    if (centro.estado) parts.push(centro.estado);
    return parts.join(', ');
};

const toast = inject('toast');

const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();
const trabajadores = useTrabajadoresStore();
const proveedorSaludStore = useProveedorSaludStore();
const { ensureUserLoaded } = useCurrentUser();

const emit = defineEmits(['closeModal', 'openSubscriptionModal'])

const periodoDePruebaFinalizado = proveedorSaludStore.proveedorSalud?.periodoDePruebaFinalizado;
const estadoSuscripcion = proveedorSaludStore.proveedorSalud?.estadoSuscripcion;
const finDeSuscripcion = proveedorSaludStore.proveedorSalud?.finDeSuscripcion ? new Date(proveedorSaludStore.proveedorSalud.finDeSuscripcion) : null;

const nivelesEscolaridad = [
  "Primaria", "Secundaria", "Preparatoria",
  "Licenciatura", "Maestría", "Doctorado",
  "Nula",
];

const estadosCiviles = [
  "Soltero/a", "Casado/a", "Unión libre",
  "Separado/a", "Divorciado/a", "Viudo/a",
];

// Variables reactivas para el modal de transferencia
const mostrarModalTransferencia = ref(false);
const centrosDisponibles = ref([]);
const centroSeleccionado = ref(null);
const transferenciaEnProceso = ref(false);

// Variables para contar trabajadores por centro
const trabajadoresPorCentro = ref({});
const loadingTrabajadores = ref(false);

// Función para obtener el número de trabajadores de un centro sin afectar el estado global
const obtenerNumeroTrabajadores = async (centroId) => {
  if (!centroId) return 0;
  
  try {
    // Usar directamente la API sin pasar por el store para evitar modificar el estado
    const { data } = await TrabajadoresAPI.getTrabajadores(
      empresas.currentEmpresaId, 
      centroId
    );
    
    if (Array.isArray(data)) {
      return data.length;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('Error al obtener trabajadores del centro:', error);
    return 0;
  }
};

// Función para cargar el número de trabajadores para todos los centros
const cargarTrabajadoresPorCentro = async () => {
  if (!centrosDisponibles.value.length) return;
  
  loadingTrabajadores.value = true;
  try {
    const conteos = await Promise.all(
      centrosDisponibles.value.map(async (centro) => {
        const numero = await obtenerNumeroTrabajadores(centro._id);
        return { centroId: centro._id, numero };
      })
    );
    
    // Convertir a objeto para fácil acceso
    trabajadoresPorCentro.value = conteos.reduce((acc, { centroId, numero }) => {
      acc[centroId] = numero;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error al cargar trabajadores por centro:', error);
  } finally {
    loadingTrabajadores.value = false;
  }
};

// Función para manejar el envío del formulario
const handleSubmit = async (data) => {
  if (!proveedorSaludStore.proveedorSalud) return;

  // Obtener el ID del usuario actual
  const currentUserId = await ensureUserLoaded();
  
  if (!currentUserId) {
    toast.open({ message: 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.', type: 'error' });
    return;
  }

  if (periodoDePruebaFinalizado) {
    // Bloquear si el periodo de prueba ha finalizado y no tiene suscripción activa (Inactive aparece cuando el pago falla repetidamente)
    if (!estadoSuscripcion || estadoSuscripcion === 'inactive') {
      emit('openSubscriptionModal');
      return;
    }

    // Bloquear solo si canceló la suscripción y la fecha de fin de suscripción ya pasó
    if (estadoSuscripcion === 'cancelled' && finDeSuscripcion && new Date() > finDeSuscripcion) {
      emit('openSubscriptionModal');
      return;
    }
  }

  const trabajadorData = {
    primerApellido: data.primerApellido,
    segundoApellido: data.segundoApellido,
    nombre: data.nombre,
    fechaNacimiento: data.fechaNacimiento,
    sexo: data.sexo,
    escolaridad: data.escolaridad,
    puesto: data.puesto,
    telefono: data.telefono,
    estadoCivil: data.estadoCivil,
    numeroEmpleado: data.numeroEmpleado,
    nss: data.nss,
    idCentroTrabajo: data.idCentroTrabajo,
    createdBy: currentUserId,
    updatedBy: currentUserId
  };

  // Solo agregar fechaIngreso si tiene un valor válido
  if (data.fechaIngreso && data.fechaIngreso !== '') {
    trabajadorData.fechaIngreso = data.fechaIngreso;
  }

  // Agregar estadoLaboral solo si es un nuevo registro
  if (!trabajadores.currentTrabajador?._id) {
    trabajadorData.estadoLaboral = "Activo";
  }

  try {
    if (trabajadores.currentTrabajador?._id) {
      // Actualizar Trabajador
      await trabajadores.updateTrabajador(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, trabajadores.currentTrabajador._id, trabajadorData);
      toast.open({ message: 'Trabajador actualizado', type: 'success' });
    } else {
      // Registrar Trabajador
      await trabajadores.createTrabajador(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId, trabajadorData);
      
      toast.open({ message: 'Trabajador registrado exitosamente', type: 'success' });
    }
    emit('closeModal');
    trabajadores.fetchTrabajadoresConHistoria(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId);
  } catch (error) {
    console.error('Error al crear o actualizar al trabajador:', error);
    
    // Extraer el mensaje de error específico del backend
    let errorMessage = 'Hubo un error al crear o actualizar al trabajador, por favor intente nuevamente.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.open({ message: errorMessage, type: 'error' });
  }
};

// Limpiar la vista previa cuando se cierre el modal
const closeModal = () => {
  emit('closeModal');
};

// Función para transferir trabajador a otro centro de trabajo
const transferirTrabajador = async () => {
  try {
    // Obtener todos los centros de trabajo de la empresa
    await centrosTrabajo.fetchCentrosTrabajo(empresas.currentEmpresaId);
    
    // Filtrar centros de trabajo (excluir el actual)
    centrosDisponibles.value = centrosTrabajo.centrosTrabajo.filter(
      centro => centro._id !== centrosTrabajo.currentCentroTrabajoId
    );

    if (centrosDisponibles.value.length === 0) {
      toast.open({ 
        message: 'No hay otros centros de trabajo disponibles para transferir', 
        type: 'warning' 
      });
      return;
    }

    // Cargar el número de trabajadores para cada centro
    await cargarTrabajadoresPorCentro();

    // Mostrar modal de selección
    mostrarModalTransferencia.value = true;
  } catch (error) {
    console.error('Error al cargar centros de trabajo:', error);
    toast.open({ 
      message: 'Error al cargar los centros de trabajo disponibles', 
      type: 'error' 
    });
  }
};

// Función para confirmar la transferencia
const confirmarTransferencia = async () => {
  if (!centroSeleccionado.value) {
    toast.open({ 
      message: 'Por favor seleccione un centro de trabajo', 
      type: 'warning' 
    });
    return;
  }

  try {
    transferenciaEnProceso.value = true;
    
    await trabajadores.transferirTrabajador(
      empresas.currentEmpresaId,
      centrosTrabajo.currentCentroTrabajoId,
      trabajadores.currentTrabajador._id,
      centroSeleccionado.value._id
    );

    toast.open({ 
      message: `Trabajador transferido exitosamente a ${centroSeleccionado.value.nombreCentro}`, 
      type: 'success' 
    });

    // Cerrar modales y actualizar la lista
    mostrarModalTransferencia.value = false;
    emit('closeModal');
    trabajadores.fetchTrabajadoresConHistoria(empresas.currentEmpresaId, centrosTrabajo.currentCentroTrabajoId);
  } catch (error) {
    console.error('Error al transferir trabajador:', error);
    
    let errorMessage = 'Error al transferir el trabajador';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.open({ message: errorMessage, type: 'error' });
  } finally {
    transferenciaEnProceso.value = false;
  }
};

// Función para cancelar la transferencia
const cancelarTransferencia = () => {
  mostrarModalTransferencia.value = false;
  centroSeleccionado.value = null;
};
</script>

<template>
  <div class="modal fixed top-0 left-0 z-40 p-4 sm:p-8 h-screen w-full flex items-center justify-center">
    <!-- Fondo oscuro transparente -->
    <div class="absolute top-0 left-0 w-full h-full bg-emerald-900 bg-opacity-50 backdrop-blur-sm" @click="closeModal">
    </div>
    <Transition appear name="fade">
      <!-- Modal centrado con desplazamiento interno -->
      <div
        class="modal-inner relative bg-white text-gray-900 w-full sm:w-4/5 md:w-3/5 xl:w-2/5 2xl:w-1/3 p-10 rounded-lg shadow-md shadow-slate-900 max-h-[90vh] overflow-y-auto">
        <!-- Botón para cerrar el modal -->
        <div
          class="modal-close absolute h-16 w-16 flex justify-center items-center top-0 right-0 text-5xl text-gray-400 hover:text-gray-500 cursor-pointer"
          @click="closeModal">
          &times;
        </div>

        <div v-if="trabajadores.loadingModal">
          <h1 class="text-3xl text-center">Cargando trabajador...</h1>
        </div>
        <!-- Contenido del modal -->
        <div v-else>
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
            <h1 class="text-2xl sm:text-3xl text-center sm:text-left w-full sm:w-auto">
              {{ trabajadores.currentTrabajador._id ? 'Editar Trabajador' : 'Registrar Trabajador' }}
            </h1>
            <!-- Botón de transferir solo visible cuando se está editando -->
            <button
              v-if="trabajadores.currentTrabajador._id"
              class="mr-8 w-full sm:w-auto text-xs sm:text-sm md:text-base px-3 py-2 sm:py-1 text-emerald-600 hover:text-emerald-700 border border-emerald-300 hover:border-emerald-400 rounded-md transition-colors duration-200 hover:bg-emerald-50"
              @click="transferirTrabajador"
              title="Transferir a otro centro de trabajo">
              <span>Transferir</span>
              <span class="inline sm:hidden"> a otro centro de trabajo</span>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1 mb-3">Los campos con <span class="text-red-500 font-medium">*</span> son obligatorios</p>
          <hr class="mt-2 mb-3">

          <FormKit type="form" :actions="false" incomplete-message="Por favor complete todos los campos"
            @submit="handleSubmit">
            <div class="lg:grid gap-3 lg:grid-cols-2">
              <FormKit type="text" name="primerApellido" placeholder="Apellido paterno"
                  validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }"
                  :value="trabajadores.currentTrabajador?.primerApellido || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Primer Apellido<span class="text-red-500">*</span></span>
                </template>
              </FormKit>
              <FormKit type="text" label="Segundo Apellido" name="segundoApellido" placeholder="Apellido materno"
                  :value="trabajadores.currentTrabajador?.segundoApellido || ''" />
              <FormKit type="text" name="nombre" placeholder="Nombres del trabajador"
                  validation="required" :validation-messages="{ required: 'Este campo es obligatorio' }"
                  :value="trabajadores.currentTrabajador?.nombre || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Nombre(s)<span class="text-red-500">*</span></span>
                </template>
              </FormKit>
              <FormKit type="date" name="fechaNacimiento" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="convertirFechaISOaYYYYMMDD(trabajadores.currentTrabajador?.fechaNacimiento) || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Fecha de Nacimiento<span class="text-red-500">*</span></span>
                </template>
              </FormKit>
              <FormKit type="select" name="sexo" placeholder="-Seleccione un sexo-"
                :options="['Masculino', 'Femenino']" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.sexo || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Sexo<span class="text-red-500">*</span></span>
                </template>
              </FormKit>
              <FormKit type="select" name="escolaridad"
                placeholder="-Seleccione último concluido-" :options="nivelesEscolaridad" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.escolaridad || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Escolaridad<span class="text-red-500">*</span></span>
                </template>
              </FormKit>
              <FormKit type="text" name="puesto" placeholder="Puesto al que aspira o desempeña" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.puesto || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Puesto<span class="text-red-500">*</span></span>
                </template>
              </FormKit>
              <FormKit type="select" name="estadoCivil" placeholder="-Seleccione un estado civil-"
                :options="estadosCiviles" validation="required"
                :validation-messages="{ required: 'Este campo es obligatorio' }"
                :value="trabajadores.currentTrabajador?.estadoCivil || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Estado Civil<span class="text-red-500">*</span></span>
                </template>
              </FormKit>
              <FormKit type="text" label="Teléfono" name="telefono" placeholder="Número de teléfono"
                validation="optional|phoneValidation" 
                :validation-messages="{ phoneValidation: 'El número de teléfono debe tener entre 4 y 15 dígitos' }"
                :value="trabajadores.currentTrabajador?.telefono || ''" />
              <FormKit type="date" name="fechaIngreso" 
                :value="convertirFechaISOaYYYYMMDD(trabajadores.currentTrabajador?.fechaIngreso) || ''">
                <template #label>
                  <span class="font-medium text-lg text-gray-700">Fecha de Ingreso</span>
                </template>
              </FormKit>
              <FormKit type="text" label="Número de Empleado" name="numeroEmpleado" placeholder="Sólo números"
                validation="optional|matches:/^[0-9]*$/" 
                :validation-messages="{ 
                  matches: 'El número de empleado debe estar vacío o contener solo números entre 1 y 7 dígitos' 
                }"
                maxlength="7" :value="trabajadores.currentTrabajador?.numeroEmpleado || ''" />
              <FormKit type="text" label="NSS" name="nss" placeholder="Número de Seguro Social"
                validation="optional|matches:/^[A-Za-z0-9\s\-_.\/]{4,30}$/" 
                :validation-messages="{ 
                  matches: 'Debe tener 4-30 caracteres alfanuméricos y puede incluir - _ . / y espacios' 
                }"
                maxlength="30" :value="trabajadores.currentTrabajador?.nss || ''" />
            </div>

            <!-- Campos ocultos y botón de enviar -->
            <FormKit type="hidden" name="idCentroTrabajo" :value="centrosTrabajo.currentCentroTrabajoId" />

            <hr class="my-3">
            <FormKit type="submit" :disabled="trabajadores.loadingModal">
              <span v-if="trabajadores.loadingModal">Guardando...</span>
              <span v-else>{{ trabajadores.currentTrabajador._id ? 'Actualizar Trabajador' : 'Guardar Trabajador'
                }}</span>
            </FormKit>
          </FormKit>
        </div>

        <button
          class="text-xl mt-2 w-full rounded-lg bg-white font-semibold text-gray-800 shadow-sm ring-2 ring-inset ring-gray-300 hover:bg-gray-100 p-3 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg flex-1"
          @click="closeModal">
          Cerrar
        </button>
      </div>
    </Transition>

    <!-- Modal de transferencia -->
    <Transition appear name="fade">
      <div v-if="mostrarModalTransferencia" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="cancelarTransferencia">
        <div class="modal-inner bg-white text-gray-900 w-4/5 sm:w-3/5 md:w-1/2 lg:w-2/5 xl:w-1/3 2xl:w-1/4 p-8 rounded-lg shadow-md shadow-slate-900 max-h-[80vh] overflow-y-auto" @click.stop>
          <!-- Header del modal -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">Transferir Trabajador</h2>
            <button
              @click="cancelarTransferencia"
              class="text-gray-400 hover:text-gray-600 text-2xl"
              :disabled="transferenciaEnProceso">
              &times;
            </button>
          </div>

          <!-- Información del trabajador -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            
            <!-- Información principal -->
            <div class="mb-3 flex gap-3">
              <p class="text-xl font-semibold text-emerald-700">
                {{ formatNombreCompleto(trabajadores.currentTrabajador) }}
                <!-- Número de empleado -->
              </p>
              <div v-if="trabajadores.currentTrabajador?.numeroEmpleado" class="flex items-center gap-2 text-sm">
                <i class="fas fa-id-badge text-purple-500"></i>
                <span class="text-emerald-700">No. {{ trabajadores.currentTrabajador.numeroEmpleado }}</span>
              </div>
            </div>
            
            <!-- Información detallada -->
            <div class="flex flex-wrap gap-3 text-sm">
              <!-- Sexo -->
              <div v-if="trabajadores.currentTrabajador?.sexo" class="flex items-center gap-2">
                <i v-if="trabajadores.currentTrabajador?.sexo === 'Masculino'" class="fas fa-mars text-sky-600"></i>
                <i v-else class="fas fa-venus text-rose-600"></i>
                <span class="text-emerald-700">{{ trabajadores.currentTrabajador.sexo }}</span>
              </div>
              
              <!-- Edad -->
              <div v-if="trabajadores.currentTrabajador?.fechaNacimiento" class="flex items-center gap-2">
                <i class="fas fa-birthday-cake text-emerald-500"></i>
                <span class="text-emerald-700">{{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }} años</span>
              </div>
              
              <!-- Puesto -->
              <div v-if="trabajadores.currentTrabajador?.puesto" class="flex items-center gap-2">
                <i class="fas fa-briefcase text-blue-500"></i>
                <span class="text-emerald-700">{{ trabajadores.currentTrabajador.puesto }}</span>
              </div>
              
              <!-- Antigüedad -->
              <div v-if="trabajadores.currentTrabajador?.fechaIngreso" class="flex items-center gap-2">
                <i class="fas fa-clock text-cyan-500"></i>
                <span class="text-emerald-700">{{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}</span>
              </div>
              <p class="text-md text-emerald-600">Centro actual: <span class="text-lg font-medium text-emerald-700">{{ centrosTrabajo.currentCentroTrabajo?.nombreCentro }}</span></p>
            </div>
          </div>

          <!-- Selección de centro destino -->
          <div class="mb-6">
            <h3 class="font-medium text-gray-700 mb-3">Seleccione el centro de trabajo destino:</h3>
            <div class="space-y-3 max-h-60 overflow-y-auto p-2">
              <div v-for="centro in centrosDisponibles" :key="centro._id" class="group">
                <div class="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                     :class="[
                       centroSeleccionado?._id === centro._id
                         ? 'bg-emerald-50 border-emerald-500 shadow-lg ring-2 ring-emerald-300'
                         : ''
                     ]">
                  <!-- Contenido principal -->
                  <button type="button"
                      class="w-full text-left p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      :class="centroSeleccionado?._id === centro._id ? 'bg-emerald-50' : 'hover:bg-gray-100'"
                      @click="centroSeleccionado = centro"
                      :disabled="transferenciaEnProceso">
                      
                      <!-- Header con icono y título -->
                      <div class="flex items-start justify-between mb-4">
                          <div class="flex items-center gap-3">
                              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
                                  <i class="fas fa-building text-white text-lg"></i>
                              </div>
                              <div>
                                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ centro.nombreCentro }}</h3>
                                  <div class="flex items-center gap-2">
                                      <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                      <span v-if="loadingTrabajadores" class="text-sm text-gray-400">
                                          <i class="fas fa-spinner fa-spin mr-1"></i>
                                          Contando...
                                      </span>
                                      <span v-else class="text-sm text-gray-600">
                                          {{ trabajadoresPorCentro[centro._id] || 0 }} {{ (trabajadoresPorCentro[centro._id] || 0) === 1 ? 'trabajador' : 'trabajadores' }}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          
                          <!-- Indicador de selección -->
                          <div v-if="centroSeleccionado?._id === centro._id" 
                               class="opacity-100 transition-opacity duration-300 ml-2">
                              <i class="fas fa-check text-emerald-500 text-lg"></i>
                          </div>
                      </div>

                      <!-- Información de ubicación -->
                      <div class="space-y-2">
                          <div class="flex items-start gap-2">
                              <div class="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                                  <i class="fas fa-map-marker-alt text-gray-400 text-xs"></i>
                              </div>
                              <div class="flex-1">
                                  <p v-if="formatDireccion(centro)" class="text-gray-700 leading-relaxed text-sm">
                                      {{ formatDireccion(centro) }}
                                  </p>
                                  <p v-else class="text-gray-400 italic text-sm">
                                      Dirección no registrada
                                  </p>
                              </div>
                          </div>
                      </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              @click="cancelarTransferencia"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              :disabled="transferenciaEnProceso">
              Cancelar
            </button>
            <button
              @click="confirmarTransferencia"
              class="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!centroSeleccionado || transferenciaEnProceso">
              <span v-if="transferenciaEnProceso" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transferiendo...
              </span>
              <span v-else>
                Transferir
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
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