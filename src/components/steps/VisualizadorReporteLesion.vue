<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useEmpresasStore } from '@/stores/empresas';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import { useFormDataStore } from '@/stores/formDataStore';
import { useStepsStore } from '@/stores/steps';
import { useProveedorSaludStore } from '@/stores/proveedorSalud';
import { calcularEdad, calcularAntiguedad, formatDateDDMMYYYY } from '@/helpers/dates';
import { formatNombreCompleto } from '@/helpers/formatNombreCompleto';
import EstadoDocumentoBadgeAlt from '../badges/EstadoDocumentoBadgeAlt.vue';
import CatalogsAPI from '@/api/CatalogsAPI';
import { CatalogType } from '@/interfaces/catalogos.interface';

const empresas = useEmpresasStore();
const trabajadores = useTrabajadoresStore();
const formData = useFormDataStore();
const steps = useStepsStore();
const proveedorSaludStore = useProveedorSaludStore();
const isMX = computed(() => proveedorSaludStore.isMX);

// Catálogos y geo para resolver códigos a etiquetas (Step2 + Step3)
const sitioOpts = ref([]);
const tipoVialidadOpts = ref([]);
const tipoAsentamientoOpts = ref([]);
const agenteLesionOpts = ref([]);
const estados = ref([]);
const municipios = ref([]);
const localidades = ref([]);

// Step5 catálogos
const areaAnatomicaOpts = ref([]);
const consecuenciaOpts = ref([]);

// Mapeos estáticos Step3
const INTENCIONALIDAD_MAP = { 1: 'ACCIDENTAL', 2: 'VIOLENCIA FAMILIAR', 3: 'VIOLENCIA NO FAMILIAR', 4: 'AUTOINFLIGIDO', 11: 'TRATA DE PERSONAS' };
const EVENTO_REPETIDO_MAP = { 1: 'ÚNICA VEZ', 2: 'REPETIDO' };
const TIPO_VIOLENCIA_MAP = { 6: 'VIOLENCIA FÍSICA', 7: 'VIOLENCIA SEXUAL', 8: 'VIOLENCIA PSICOLÓGICA', 9: 'VIOLENCIA ECONÓMICA/PATRIMONIAL', 10: 'ABANDONO Y/O NEGLIGENCIA' };
const NUMERO_AGRESORES_MAP = { 1: 'ÚNICO', 2: 'MÁS DE UNO', 3: 'NO ESPECIFICADO' };
const PARENTESCO_MAP = { 0: 'NO ESPECIFICADO', 1: 'PADRE', 2: 'MADRE', 3: 'CÓNYUGE/PAREJA/NOVIO', 4: 'OTRO PARIENTE', 5: 'PADRASTRO', 6: 'MADRASTRA', 7: 'CONOCIDO SIN PARENTESCO', 8: 'DESCONOCIDO', 9: 'HIJA/HIJO', 10: 'OTRO', 99: 'SE IGNORA' };
const SEXO_AGRESOR_MAP = { 0: 'NO ESPECIFICADO', 1: 'HOMBRE', 2: 'MUJER', 3: 'INTERSEXUAL', 9: 'SE IGNORA' };
const LESIONADO_VEHICULO_MAP = { 1: 'CONDUCTOR', 2: 'OCUPANTE', 3: 'PEATÓN', 4: 'SE IGNORA' };
const USO_EQUIPO_MAP = { 1: 'SI', 2: 'NO', 9: 'SE IGNORA' };
const EQUIPO_UTILIZADO_MAP = { 1: 'CINTURÓN', 2: 'CASCO', 3: 'SILLA INFANTIL', 4: 'OTRO' };
const ATENCION_PREHOSP_MAP = { 1: 'SI', 2: 'NO' };
const DIA_FESTIVO_MAP = { 1: 'SI', 2: 'NO' };
const BAJO_EFECTOS_MAP = { 1: 'ALCOHOL', 2: 'DROGA POR INDICACIÓN MÉDICA', 3: 'DROGAS ILEGALES', 4: 'SE IGNORA', 5: 'NINGUNA' };

// Mapeos estáticos Step4
const SERVICIO_ATENCION_MAP = { 1: 'CONSULTA EXTERNA', 2: 'HOSPITALIZACION', 3: 'URGENCIAS', 4: 'SERVICIO ESPECIALIZADO DE ATENCION A LA VIOLENCIA', 5: 'OTRO SERVICIO' };
const TIPO_ATENCION_MAP = { 1: 'TRATAMIENTO MÉDICO', 2: 'TRATAMIENTO PSICOLÓGICO', 3: 'TRATAMIENTO QUIRÚRGICO', 4: 'TRATAMIENTO PSIQUIÁTRICO', 5: 'CONSEJERÍA', 6: 'OTRO', 7: 'PÍLDORA ANTICONCEPTIVA DE EMERGENCIA', 8: 'PROFILAXIS VIH', 9: 'PROFILAXIS OTRAS ITS' };

// Mapeos estáticos Step6
const DESPUES_ATENCION_MAP = {
  1: 'DOMICILIO',
  2: 'TRASLADO A OTRA UNIDAD MÉDICA',
  3: 'SERVICIO ESPECIALIZADO ATENCION A LA VIOLENCIA',
  4: 'CONSULTA EXTERNA',
  5: 'DEFUNCION',
  6: 'REFUGIO O ALBERGUE',
  7: 'DIF',
  8: 'HOSPITALIZACION',
  9: 'MINISTERIO PUBLICO',
  10: 'GRUPO DE AYUDA MUTUA',
  11: 'OTRO',
};
const MINISTERIO_PUBLICO_MAP = { 1: 'SI', 2: 'NO' };

const goToStep = (stepNumber) => {
  steps.goToStep(stepNumber);
};

// Etiquetas resueltas para Step2
const sitioLabel = computed(() => {
  const code = formData.formDataLesion?.sitioOcurrencia;
  if (code == null) return '';
  const opt = sitioOpts.value.find((e) => Number(e.code) === Number(code));
  return opt ? (opt.description || '').trim() : String(code);
});

const tipoVialidadLabel = computed(() => {
  const code = formData.formDataLesion?.tipoVialidad;
  if (code == null) return '';
  const opt = tipoVialidadOpts.value.find((e) => Number(e.code) === Number(code));
  return opt ? (opt.description || '').trim() : String(code);
});

const tipoAsentamientoLabel = computed(() => {
  const code = formData.formDataLesion?.tipoAsentamiento;
  if (code == null) return '';
  const opt = tipoAsentamientoOpts.value.find((e) => Number(e.code) === Number(code));
  return opt ? (opt.description || '').trim() : String(code);
});

const entidadLabel = computed(() => {
  const code = formData.formDataLesion?.entidadOcurrencia;
  if (!code) return '';
  const e = estados.value.find((x) => x.code === String(code).padStart(2, '0'));
  return e ? (e.description || '').trim() : code;
});

const municipioLabel = computed(() => {
  const code = formData.formDataLesion?.municipioOcurrencia;
  if (!code) return '';
  const m = municipios.value.find((x) => x.code === code || x.code === String(code));
  return m ? (m.description || '').trim() : code;
});

const localidadLabel = computed(() => {
  const code = formData.formDataLesion?.localidadOcurrencia;
  if (!code) return '';
  const l = localidades.value.find((x) => x.code === code || x.code === String(code));
  return l ? (l.description || '').trim() : code;
});

// Etiquetas Step1
const horaEventoLabel = computed(() => {
  const v = formData.formDataLesion?.horaEvento;
  return v === '99:99' ? 'SE DESCONOCE' : (v || '');
});
const diaFestivoLabel = computed(() => {
  const code = formData.formDataLesion?.diaFestivo;
  return code != null ? (DIA_FESTIVO_MAP[code] ?? String(code)) : '';
});

// Etiquetas Step3
const intencionalidadLabel = computed(() => {
  const code = formData.formDataLesion?.intencionalidad;
  return code != null ? (INTENCIONALIDAD_MAP[code] || String(code)) : '';
});
const eventoRepetidoLabel = computed(() => {
  const code = formData.formDataLesion?.eventoRepetido;
  return code != null ? (EVENTO_REPETIDO_MAP[code] || String(code)) : '';
});
const agenteLesionLabel = computed(() => {
  const code = formData.formDataLesion?.agenteLesion;
  if (code == null || code === -1) return '';
  const opt = agenteLesionOpts.value.find((e) => Number(e.code) === Number(code));
  return opt ? (opt.description || '').trim() : String(code);
});
const tipoViolenciaLabels = computed(() => {
  const arr = formData.formDataLesion?.tipoViolencia;
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.map((c) => TIPO_VIOLENCIA_MAP[c] || c).join(', ');
});
const numeroAgresoresLabel = computed(() => {
  const code = formData.formDataLesion?.numeroAgresores;
  return code != null && code !== -1 ? (NUMERO_AGRESORES_MAP[code] || String(code)) : '';
});
const parentescoLabel = computed(() => {
  const code = formData.formDataLesion?.parentescoAfectado;
  return code != null && code !== -1 ? (PARENTESCO_MAP[code] || String(code)) : '';
});
const sexoAgresorLabel = computed(() => {
  const code = formData.formDataLesion?.sexoAgresor;
  return code != null && code !== -1 ? (SEXO_AGRESOR_MAP[code] || String(code)) : '';
});
const lesionadoVehiculoLabel = computed(() => {
  const code = formData.formDataLesion?.lesionadoVehiculoMotor;
  return code != null && code !== -1 ? (LESIONADO_VEHICULO_MAP[code] || String(code)) : '';
});
const usoEquipoLabel = computed(() => {
  const code = formData.formDataLesion?.usoEquipoSeguridad;
  return code != null && code !== -1 ? (USO_EQUIPO_MAP[code] || String(code)) : '';
});
const equipoUtilizadoLabel = computed(() => {
  const code = formData.formDataLesion?.equipoUtilizado;
  return code != null && code !== -1 ? (EQUIPO_UTILIZADO_MAP[code] || String(code)) : '';
});
const atencionPrehospLabel = computed(() => {
  const code = formData.formDataLesion?.atencionPreHospitalaria;
  return code != null ? (ATENCION_PREHOSP_MAP[code] || String(code)) : '';
});
const bajoEfectosToLabels = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.split('&').map((c) => BAJO_EFECTOS_MAP[Number(c)] || c).join(', ');
};
const agresorBajoEfectosLabel = computed(() => bajoEfectosToLabels(formData.formDataLesion?.agresorBajoEfectos));
const sospechaBajoEfectosLabel = computed(() => bajoEfectosToLabels(formData.formDataLesion?.sospechaBajoEfectosDe));

// Etiquetas Step4
const servicioAtencionLabel = computed(() => {
  const code = formData.formDataLesion?.servicioAtencion;
  return code != null ? (SERVICIO_ATENCION_MAP[code] || String(code)) : '';
});
const tipoAtencionLabels = computed(() => {
  const arr = formData.formDataLesion?.tipoAtencion;
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.map((c) => TIPO_ATENCION_MAP[c] || c).join(', ');
});
const horaAtencionLabel = computed(() => {
  const v = formData.formDataLesion?.horaAtencion;
  return v === '99:99' ? 'SE DESCONOCE' : (v || '');
});

// Etiquetas Step5
const areaAnatomicaLabel = computed(() => {
  const code = formData.formDataLesion?.areaAnatomica;
  if (code == null) return '';
  const opt = areaAnatomicaOpts.value.find((e) => Number(e.code) === Number(code));
  return opt ? (opt.description || '').trim().toUpperCase() : String(code);
});
const consecuenciaGravedadLabel = computed(() => {
  const code = formData.formDataLesion?.consecuenciaGravedad;
  if (code == null) return '';
  const opt = consecuenciaOpts.value.find((e) => Number(e.code) === Number(code));
  return opt ? (opt.description || '').trim().toUpperCase() : String(code);
});
const afeccionesTratadasLabel = computed(() => {
  const arr = formData.formDataLesion?.afeccionesTratadas;
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.map((s) => {
    const p = (s || '').split('#');
    return p.length >= 2 ? `${p[0]}. ${p[1]}${p[2] ? ` (${p[2]})` : ''}` : s;
  }).join('; ');
});

// Etiquetas Step6
const despuesAtencionLabel = computed(() => {
  const code = formData.formDataLesion?.despuesAtencion;
  return code != null ? (DESPUES_ATENCION_MAP[code] || String(code)) : '';
});
const ministerioPublicoLabel = computed(() => {
  const code = formData.formDataLesion?.ministerioPublico;
  return code != null ? (MINISTERIO_PUBLICO_MAP[code] || String(code)) : '';
});

const cargarCatalogosYGeo = async () => {
  const lesion = formData.formDataLesion;
  try {
    const [sitioRes, vialidadRes, asentamientoRes, estadosRes, agenteRes, areaRes, consRes] = await Promise.all([
      CatalogsAPI.listCatalog(CatalogType.SITIO_OCURRENCIA),
      CatalogsAPI.listCatalog(CatalogType.TIPO_VIALIDAD),
      CatalogsAPI.listCatalog(CatalogType.TIPO_ASENTAMIENTO),
      CatalogsAPI.getEstados(),
      CatalogsAPI.listCatalog(CatalogType.AGENTE_LESION),
      CatalogsAPI.listCatalog(CatalogType.AREA_ANATOMICA),
      CatalogsAPI.listCatalog(CatalogType.CONSECUENCIA),
    ]);
    sitioOpts.value = sitioRes.data || [];
    tipoVialidadOpts.value = vialidadRes.data || [];
    tipoAsentamientoOpts.value = asentamientoRes.data || [];
    estados.value = estadosRes.data || [];
    agenteLesionOpts.value = agenteRes.data || [];
    areaAnatomicaOpts.value = areaRes.data || [];
    consecuenciaOpts.value = consRes.data || [];
  } catch (err) {
    console.error('Error al cargar catálogos:', err);
  }

  const entidadCode = lesion?.entidadOcurrencia;
  if (entidadCode) {
    try {
      const { data } = await CatalogsAPI.getMunicipios(entidadCode);
      municipios.value = data || [];
    } catch {
      municipios.value = [];
    }
  } else {
    municipios.value = [];
  }

  const munCode = lesion?.municipioOcurrencia;
  if (entidadCode && munCode) {
    const munOnly = String(munCode).includes('-') ? String(munCode).split('-')[1] : munCode;
    try {
      const { data } = await CatalogsAPI.getLocalidades(entidadCode, munOnly);
      localidades.value = data || [];
    } catch {
      localidades.value = [];
    }
  } else {
    localidades.value = [];
  }
};

watch(
  () => [
    formData.formDataLesion?.entidadOcurrencia,
    formData.formDataLesion?.municipioOcurrencia,
  ],
  () => cargarCatalogosYGeo(),
  { immediate: true }
);

onMounted(() => {
  cargarCatalogosYGeo();
});

</script>

<template>
  <div
    class="flex flex-wrap justify-start gap-4 border-shadow w-full text-left rounded-lg p-5 transition-all duration-300 ease-in-out transform shadow-md bg-white max-w-6xl mx-auto max-h-[66vh] sm:max-h-[68vh] md:max-h-[67vh] lg:max-h-[67vh] xl:max-h-[81vh] overflow-y-auto">

    <!-- Empresa y Fecha -->
    <div class="flex flex-wrap md:flex-nowrap w-full gap-4 items-center">
      <EstadoDocumentoBadgeAlt 
        v-if="isMX"
        :estado="formData.formDataLesion.estado" 
        :fechaFinalizacion="formData.formDataLesion.fechaFinalizacion" 
        :finalizadoPor="formData.formDataLesion.finalizadoPor"
        :fechaAnulacion="formData.formDataLesion.fechaAnulacion"
        :anuladoPor="formData.formDataLesion.anuladoPor"
        :razonAnulacion="formData.formDataLesion.razonAnulacion"
        class="mt-1 flex-shrink-0"
      />
      <!-- Empresa -->
      <div class="w-full md:w-auto md:flex-1 text-center">
        <p class="text-center text-base sm:text-lg">
          {{ empresas.currentEmpresa.nombreComercial }}
        </p>
      </div>

      <!-- Fecha -->
      <div 
        class="w-full md:w-auto md:flex-1 flex flex-wrap gap-2 justify-start md:justify-end text-sm sm:text-base cursor-pointer"
        :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md': steps.currentStep === 1 }"
        @click="goToStep(1)">
        <p class="w-full md:w-auto text-right">Fecha: <span class="font-medium">{{
          formatDateDDMMYYYY(formData.formDataLesion.fechaReporteLesion) }}</span></p>
      </div>
    </div>

    <!-- Trabajador -->
    <div class="w-full">
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NOMBRE
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formatNombreCompleto(trabajadores.currentTrabajador) }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ calcularEdad(trabajadores.currentTrabajador.fechaNacimiento) }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PUESTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.puesto }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SEXO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.sexo }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESCOLARIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ trabajadores.currentTrabajador.escolaridad }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ANTIGUEDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ calcularAntiguedad(trabajadores.currentTrabajador.fechaIngreso) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ¿Cuándo ocurrió el evento? (Step1) -->
    <div
      class="w-full cursor-pointer"
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md p-1': steps.currentStep === 1 }"
      @click="goToStep(1)"
    >
      <p class="text-xs sm:text-sm font-medium text-gray-700 mb-1">¿Cuándo ocurrió el evento?</p>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">FECHA REPORTE</td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">{{ formatDateDDMMYYYY(formData.formDataLesion?.fechaReporteLesion) || '—' }}</td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">FECHA EVENTO</td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">{{ formatDateDDMMYYYY(formData.formDataLesion?.fechaEvento) || '—' }}</td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">HORA EVENTO</td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">{{ horaEventoLabel || '—' }}</td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">DÍA FESTIVO</td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">{{ diaFestivoLabel || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ¿Dónde ocurrió el evento? (Step2) -->
    <div
      class="w-full cursor-pointer"
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md p-1': steps.currentStep === 2 }"
      @click="goToStep(2)"
    >
      <p class="text-xs sm:text-sm font-medium text-gray-700 mb-1">¿Dónde ocurrió el evento?</p>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SITIO OCURRENCIA
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ sitioLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              C.P.
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.codigoPostal || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ENTIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ entidadLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              MUNICIPIO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ municipioLabel || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              LOCALIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ localidadLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              OTRA LOCALIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.otraLocalidad || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              TIPO VIALIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ tipoVialidadLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NOMBRE VIALIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.nombreVialidad || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NÚM. EXT.
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.numeroExterior || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              TIPO ASENTAMIENTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ tipoAsentamientoLabel || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NOMBRE ASENTAMIENTO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.nombreAsentamiento || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ¿Cómo ocurrió? (Step3) -->
    <div
      class="w-full cursor-pointer"
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md p-1': steps.currentStep === 3 }"
      @click="goToStep(3)"
    >
      <p class="text-xs sm:text-sm font-medium text-gray-700 mb-1">¿Cómo ocurrió el evento?</p>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              INTENCIONALIDAD
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ intencionalidadLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EVENTO REPETIDO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ eventoRepetidoLabel || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              AGENTE LESION
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ agenteLesionLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.agenteLesion === 25" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESPECIFIQUE
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.especifique || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.intencionalidad === 2 || formData.formDataLesion?.intencionalidad === 3" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              TIPO VIOLENCIA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ tipoViolenciaLabels || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              NÚM. AGRESORES
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ numeroAgresoresLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.numeroAgresores === 1" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              PARENTESCO CON EL AFECTADO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ parentescoLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SEXO AGRESOR
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ sexoAgresorLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.numeroAgresores === 1" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EDAD AGRESOR
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.edadAgresor != null ? formData.formDataLesion.edadAgresor : '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              AGRESOR BAJO EFECTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ agresorBajoEfectosLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.agenteLesion === 20" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              LESIONADO VEHÍCULO MOTOR
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ lesionadoVehiculoLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              USO EQUIPO SEGURIDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ usoEquipoLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.usoEquipoSeguridad === 1" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              EQUIPO UTILIZADO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ equipoUtilizadoLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESPECIFIQUE EQUIPO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.especifiqueEquipo || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SOSPECHA BAJO EFECTOS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ sospechaBajoEfectosLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ATENCIÓN PREHOSPITALARIA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ atencionPrehospLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.atencionPreHospitalaria === 1" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              TIEMPO TRASLADO UH
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.tiempoTrasladoUH === '99:99' ? 'SE DESCONOCE' : (formData.formDataLesion?.tiempoTrasladoUH || '—') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Atención recibida (Step4) -->
    <div
      class="w-full cursor-pointer"
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md p-1': steps.currentStep === 4 }"
      @click="goToStep(4)"
    >
      <p class="text-xs sm:text-sm font-medium text-gray-700 mb-1">Atención recibida</p>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FECHA ATENCIÓN
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formatDateDDMMYYYY(formData.formDataLesion?.fechaAtencion) || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              HORA ATENCIÓN
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ horaAtencionLabel || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              SERVICIO ATENCIÓN
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ servicioAtencionLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              TIPO ATENCIÓN
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ tipoAtencionLabels || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.servicioAtencion === 5" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESPECIFIQUE SERVICIO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.especifiqueServicio || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Evaluación clínica / Diagnóstico (Step5) -->
    <div
      class="w-full cursor-pointer"
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md p-1': steps.currentStep === 5 }"
      @click="goToStep(5)"
    >
      <p class="text-xs sm:text-sm font-medium text-gray-700 mb-1">Evaluación clínica / Diagnóstico</p>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ÁREA ANATÓMICA
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ areaAnatomicaLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CONSECUENCIA GRAVEDAD
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ consecuenciaGravedadLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.areaAnatomica === 16" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESPECIFIQUE ÁREA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.especifiqueArea || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.consecuenciaGravedad === 22" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESPECIFIQUE CONSECUENCIA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.especifiqueConsecuencia || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CÓDIGO CIE AFECCIÓN PRINCIPAL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.codigoCIEAfeccionPrincipal || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CÓDIGO CIE CAUSA EXTERNA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ formData.formDataLesion?.codigoCIECausaExterna || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DESCRIPCIÓN AFECCIÓN PRINCIPAL
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.descripcionAfeccionPrincipal || '—' }}
            </td>
          </tr>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              CAUSA EXTERNA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.causaExterna || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.afeccionPrincipalReseleccionada" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              AFECCIÓN PRINCIPAL RESELEccIONADA
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.afeccionPrincipalReseleccionada || '—' }}
            </td>
          </tr>
          <tr v-if="afeccionesTratadasLabel" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              AFECCIONES TRATADAS
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ afeccionesTratadasLabel }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Destino y seguimiento (Step6) -->
    <div
      class="w-full cursor-pointer"
      :class="{ 'outline outline-2 outline-offset-2 outline-yellow-500 rounded-md p-1': steps.currentStep === 6 }"
      @click="goToStep(6)"
    >
      <p class="text-xs sm:text-sm font-medium text-gray-700 mb-1">Destino y seguimiento</p>
      <table class="table-auto w-full border-collapse border border-gray-200">
        <tbody>
          <tr class="odd:bg-white even:bg-gray-50">
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              DESPUÉS ATENCIÓN
            </td>
            <td class="w-1/4 text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ despuesAtencionLabel || '—' }}
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              MINISTERIO PÚBLICO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium">
              {{ ministerioPublicoLabel || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.despuesAtencion === 11" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              ESPECIFIQUE DESTINO
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.especifiqueDestino || '—' }}
            </td>
          </tr>
          <tr v-if="formData.formDataLesion?.despuesAtencion === 5 && formData.formDataLesion?.ministerioPublico === 2" class="odd:bg-white even:bg-gray-50">
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-light">
              FOLIO CERTIFICADO DEFUNCIÓN
            </td>
            <td class="text-xs sm:text-sm px-2 py-0 border border-gray-300 font-medium" colspan="3">
              {{ formData.formDataLesion?.folioCertificadoDefuncion || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f0f0f0;
  /* Cambia el color según tu diseño */
}
</style>
