<script setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useUserPermissions } from '@/composables/useUserPermissions';
import { usePermissionRestrictions } from '@/composables/usePermissionRestrictions';

const toast = inject('toast');

const emit = defineEmits(['closeModal']);
const router = useRouter();
const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const { canCreateDocument, getRestrictionMessage } = useUserPermissions();
const { executeIfCanManageCuestionariosAdicionales } = usePermissionRestrictions();

const closeModal = () => {
  emit('closeModal');
};

// Función para manejar la selección de cuestionarios
const handleQuestionnaireSelect = (questionnaireType) => {
  // Validar permisos para cuestionarios adicionales
  executeIfCanManageCuestionariosAdicionales(() => {
    // Solo permitir cuestionarios habilitados
    if (questionnaireType === 'control-prenatal') {
      
      // Validar que el trabajador sea de sexo femenino
      if (trabajadores.currentTrabajador?.sexo === 'Masculino') {
        toast.open({
          message: `No puedes hacer control prenatal al sexo masculino.`,
          type: 'error',
        });
        return; // No avanzar si es masculino
      }
      
      // Si es femenino, navegar a la vista crear-documento con el tipo controlPrenatal
      router.push({
        name: 'crear-documento',
        params: {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'controlPrenatal'
        }
      });
      
      // Cerrar el modal después de navegar
      closeModal();
    } else if (questionnaireType === 'constancia-aptitud') {
      router.push({
        name: 'crear-documento',
        params: {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'constanciaAptitud'
        }
      });
      closeModal();
    } else if (questionnaireType === 'receta') {
      router.push({
        name: 'crear-documento',
        params: {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'receta'
        }
      });
      closeModal();
    } else if (questionnaireType === 'certificado-expedito') {
      router.push({
        name: 'crear-documento',
        params: {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'certificadoExpedito'
        }
      });
    } else if (questionnaireType === 'historia-otologica') {
      router.push({
        name: 'crear-documento',
        params: {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'historiaOtologica'
        }
      });
    } else if (questionnaireType === 'previo-espirometria') {
      router.push({
        name: 'crear-documento',
        params: {
          idEmpresa: empresas.currentEmpresaId,
          idTrabajador: trabajadores.currentTrabajadorId,
          tipoDocumento: 'previoEspirometria'
        }
      });
    }
  }, 'acceder a cuestionarios adicionales');
};
</script>

<template>
  <div class="modal fixed top-0 left-0 z-10 p-8 h-screen w-full grid place-items-center">
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

        <h1 class="text-3xl mb-2">Cuestionarios de Vigilancia Médica</h1>
        <p class="text-gray-600 mb-4">Selecciona el cuestionario a aplicar</p>
        <hr class="mt-2 mb-6">

        <!-- Contenido del modal -->
        <div class="space-y-6">
          <!-- Trámites -->
          <div class="space-y-3">
            <div class="flex items-center text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              <i class="fas fa-file text-emerald-500 mr-3"></i>
              Otros informes
            </div>
            <div class="space-y-2">
              <button 
                @click="handleQuestionnaireSelect('constancia-aptitud')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300"
              >
                <i class="fas fa-file-alt text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Constancia de Aptitud
              </button>
              <button 
                @click="handleQuestionnaireSelect('receta')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300"
              >
                <i class="fas fa-prescription-bottle-medical text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Receta Médica
              </button>
              <button 
                @click="handleQuestionnaireSelect('certificado-expedito')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300"
              >
                <i class="fas fa-file-alt text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Certificado Expedito
              </button>
              <button 
                @click="handleQuestionnaireSelect('historia-otologica')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300"
              >
                <i class="fas fa-ear-deaf text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Historia Otológica (Previo a Audiometría)
              </button>
              <button 
                @click="handleQuestionnaireSelect('previo-espirometria')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300"
              >
                <i class="fas fa-lungs text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Cuestionario Previo a Espirometría
              </button>
            </div>
          </div>

          <!-- Vigilancia médica por condición personal -->
          <div class="space-y-3">
            <div class="flex items-center text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              <i class="fas fa-user-circle text-emerald-500 mr-3"></i>
              Condición Personal
            </div>
            <div class="space-y-2">
              <button 
                @click="handleQuestionnaireSelect('control-prenatal')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300"
              >
                <i class="fas fa-baby text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Control Prenatal (Embarazo y Lactancia)
              </button>
              <button 
                @click="handleQuestionnaireSelect('enfermedades-cronicas')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-heartbeat text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Enfermedades Crónicas
              </button>
              <button 
                @click="handleQuestionnaireSelect('condiciones-muscoesqueleticas')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-bone text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Condiciones muscoesqueléticas
              </button>
            </div>
          </div>

          <!-- Vigilancia médica por tipo de actividad o entorno laboral -->
          <!-- <div class="space-y-3">
            <div class="flex items-center text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              <i class="fas fa-hard-hat text-emerald-500 mr-3"></i>
              Actividad/Entorno Laboral
            </div>
            <div class="space-y-2">
              <button 
                @click="handleQuestionnaireSelect('trabajos-altura')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-warning text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Control de salud para POE a Trabajos en Altura
              </button>
              <button 
                @click="handleQuestionnaireSelect('espacios-confinados')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-box text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Control de salud para POE a Espacios Confinados
              </button>
              <button 
                @click="handleQuestionnaireSelect('temperaturas-extremas')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-thermometer-half text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Control de Salud para POE a Temperaturas Extremas
              </button>
              <button 
                @click="handleQuestionnaireSelect('sustancias-peligrosas')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-flask text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Control de salud para POE a Manipulación de Sustancias Peligrosas
              </button>
              <button 
                @click="handleQuestionnaireSelect('maquinaria-pesada')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-truck text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Control para POE a Conducción y Operación de Maquinaria Pesada
              </button>
            </div>
          </div> -->

          <!-- Vigilancia médica por riesgo específico -->
          <!-- <div class="space-y-3">
            <div class="flex items-center text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              <i class="fas fa-exclamation-triangle text-emerald-500 mr-3"></i>
              Riesgo Específico
            </div>
            <div class="space-y-2">
              <button 
                @click="handleQuestionnaireSelect('salud-auditiva')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-deaf text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Monitoreo de la Salud Auditiva
              </button>
              <button 
                @click="handleQuestionnaireSelect('salud-respiratoria')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-lungs text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Monitoreo de la Salud Respiratoria
              </button>
              <button 
                @click="handleQuestionnaireSelect('agentes-quimicos')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-atom text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Monitoreo por Exposición a Agentes Químicos
              </button>
              <button 
                @click="handleQuestionnaireSelect('agentes-biologicos')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-bacteria text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Seguimiento Médico por Contacto con Agentes Biológicos
              </button>
            </div>
          </div> -->

          <!-- Vigilancia médica por ergonomía y carga física -->
          <!-- <div class="space-y-3">
            <div class="flex items-center text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              <i class="fas fa-running text-emerald-500 mr-3"></i>
              Ergonomía y Carga Física
            </div>
            <div class="space-y-2">
              <button 
                @click="handleQuestionnaireSelect('riesgos-ergonomicos')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-user-injured text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Riesgos por Posturas Prolongadas y Movimientos Repetitivos
              </button>
              <button 
                @click="handleQuestionnaireSelect('manipulacion-cargas')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-dumbbell text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Riesgos por Manipulación Manual de Cargas
              </button>
            </div>
          </div> -->

          <!-- Vigilancia médica por factores psicosociales -->
          <!-- <div class="space-y-3">
            <div class="flex items-center text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
              <i class="fas fa-brain text-emerald-500 mr-3"></i>
              Factores Psicosociales
            </div>
            <div class="space-y-2">
              <button 
                @click="handleQuestionnaireSelect('riesgo-psicosocial')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-chart-line text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Evaluación de Factores de Riesgo Psicosocial
              </button>
              <button 
                @click="handleQuestionnaireSelect('estres-laboral')"
                class="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition-colors duration-150 flex items-center group border border-gray-200 hover:border-emerald-300 disabled"
                disabled
              >
                <i class="fas fa-tired text-emerald-500 mr-3 text-sm group-hover:text-emerald-600"></i>
                Seguimiento de Estrés Laboral y Fatiga Mental
              </button>
            </div>
          </div> -->
        </div>

        <!-- Botón de cerrar -->
        <div class="mt-8">
          <button
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            @click="closeModal">
            Cerrar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Efectos de hover mejorados para los botones */
button:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

/* Transiciones suaves */
button {
  transition: all 0.2s ease-in-out;
}

/* Efecto de escala en hover */
button:hover:not(.disabled) i {
  transform: scale(1.1);
}

button i {
  transition: transform 0.2s ease-in-out;
}

/* Estilos para botones deshabilitados */
button.disabled {
  opacity: 0.8;
  /* cursor: not-allowed; */
  background-color: #f3f4f6;
  color: #9ca3af;
  border-color: #d1d5db;
}

button.disabled:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  transform: none;
  box-shadow: none;
}

button.disabled i {
  color: #9ca3af;
}

button.disabled:hover i {
  transform: none;
  color: #9ca3af;
}
</style>
