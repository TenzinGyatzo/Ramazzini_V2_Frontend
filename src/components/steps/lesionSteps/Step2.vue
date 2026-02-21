<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';

/** GIIS: Núm. exterior solo 0-9, A-Z, Ñ (máx 15). Sin acentos ni caracteres especiales. */
const formatNumeroExteriorInput = (val) => {
  if (!val || typeof val !== 'string') return '';
  let s = val.toUpperCase().replace(/[ñÑ]/g, 'Ñ');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s.split('').filter((c) => /[0-9A-ZÑ]/.test(c)).join('').slice(0, 15);
};
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import CatalogsAPI from '@/api/CatalogsAPI';
import CPAutocomplete from '@/components/selectors/CPAutocomplete.vue';
import { CatalogType } from '@/interfaces/catalogos.interface';

const formDataStore = useFormDataStore();
const documentos = useDocumentosStore();

// Catálogos GIIS (cargados dinámicamente)
const sitioOcurrenciaOpts = ref([]);
const tipoVialidadOpts = ref([]);
const tipoAsentamientoOpts = ref([]);

// Refs locales
const sitioOcurrencia = ref(null);
const entidadOcurrencia = ref('');
const municipioOcurrencia = ref('');
const localidadOcurrencia = ref('');
const otraLocalidad = ref('');
const codigoPostal = ref('');
const tipoVialidad = ref(null);
const nombreVialidad = ref('');
const numeroExterior = ref('');
const tipoAsentamiento = ref(null);
const nombreAsentamiento = ref('');

// Geo cascade
const estados = ref([]);
const municipios = ref([]);
const localidades = ref([]);
const loadingGeo = ref({ estados: false, municipios: false, localidades: false });

// Evitar que los watchers de cascada limpien valores durante la restauración inicial
const isHydrating = ref(false);

const loadEstados = async () => {
  loadingGeo.value.estados = true;
  try {
    const { data } = await CatalogsAPI.getEstados();
    estados.value = data || [];
  } catch (err) {
    console.error('Error al cargar estados:', err);
    estados.value = [];
  } finally {
    loadingGeo.value.estados = false;
  }
};

const loadMunicipios = async (estadoCode) => {
  if (!estadoCode) {
    municipios.value = [];
    return;
  }
  loadingGeo.value.municipios = true;
  try {
    const { data } = await CatalogsAPI.getMunicipios(estadoCode);
    municipios.value = data || [];
  } catch (err) {
    console.error('Error al cargar municipios:', err);
    municipios.value = [];
  } finally {
    loadingGeo.value.municipios = false;
  }
};

const loadLocalidades = async (estadoCode, munCode) => {
  if (!estadoCode || !munCode) {
    localidades.value = [];
    return;
  }
  // Municipio code puede ser "09-001" (estado-mun) o solo "001"
  const municipioCode = String(munCode).includes('-') ? String(munCode).split('-')[1] : munCode;
  loadingGeo.value.localidades = true;
  try {
    const { data } = await CatalogsAPI.getLocalidades(estadoCode, municipioCode);
    localidades.value = data || [];
  } catch (err) {
    console.error('Error al cargar localidades:', err);
    localidades.value = [];
  } finally {
    loadingGeo.value.localidades = false;
  }
};

// Normalizar texto para comparación (sin acentos, minúsculas)
const normalizeForMatch = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const handleCPSelect = async (data) => {
  if (!data) return;
  const cEstado = data.cEstado ? String(data.cEstado).padStart(2, '0') : null;
  const cMunicipio = data.cMunicipio ? String(data.cMunicipio).padStart(3, '0') : null;

  // 1. Asignar solo entidad - dispara el watcher que limpia municipio/localidad y carga municipios
  if (cEstado) {
    entidadOcurrencia.value = cEstado;
  }

  // 2. Esperar a que el watcher ejecute (limpie y cargue municipios)
  await nextTick();
  if (cEstado) await loadMunicipios(cEstado);

  // 3. Asignar municipio - dispara el watcher que carga localidades
  if (cEstado && cMunicipio) {
    municipioOcurrencia.value = `${cEstado}-${cMunicipio}`;
  }

  // 4. Esperar a que el watcher de municipio cargue localidades
  await nextTick();
  if (cEstado && cMunicipio) await loadLocalidades(cEstado, municipioOcurrencia.value);

  // 5. Buscar localidad por ciudad (solo si hay match claro)
  if (data.ciudad && localidades.value.length > 0) {
    const ciudadNorm = normalizeForMatch(data.ciudad);
    const match = localidades.value.find(
      (l) => normalizeForMatch(l.description) === ciudadNorm
    );
    if (match) {
      localidadOcurrencia.value = match.code;
    }
  }

  // 6. Buscar tipoAsentamiento por descripción (solo si hay match en catálogo GIIS)
  if (data.tipoAsentamiento && tipoAsentamientoOpts.value.length > 0) {
    const tipoNorm = normalizeForMatch(data.tipoAsentamiento);
    const match = tipoAsentamientoOpts.value.find(
      (entry) => normalizeForMatch(entry.description) === tipoNorm
    );
    if (match) {
      const codeNum = Number(match.code);
      tipoAsentamiento.value = !Number.isNaN(codeNum) ? codeNum : match.code;
    }
  }

  // 7. nombreAsentamiento siempre (cada fila CP tiene un único asentamiento)
  if (data.asentamiento) {
    nombreAsentamiento.value = (data.asentamiento || '').toUpperCase();
  }
};

const syncToFormData = () => {
  const fd = formDataStore.formDataLesion;
  fd.sitioOcurrencia = sitioOcurrencia.value;
  fd.entidadOcurrencia = entidadOcurrencia.value || undefined;
  fd.municipioOcurrencia = municipioOcurrencia.value || undefined;
  fd.localidadOcurrencia = localidadOcurrencia.value || undefined;
  fd.otraLocalidad = otraLocalidad.value?.trim() || undefined;
  fd.codigoPostal = codigoPostal.value?.trim() || undefined;
  fd.tipoVialidad = tipoVialidad.value;
  fd.nombreVialidad = nombreVialidad.value?.trim() || undefined;
  fd.numeroExterior = numeroExterior.value?.trim() || undefined;
  fd.tipoAsentamiento = tipoAsentamiento.value;
  fd.nombreAsentamiento = nombreAsentamiento.value?.trim() || undefined;
};

const loadGIISCatalogs = async () => {
  try {
    const [sitioRes, vialidadRes, asentamientoRes] = await Promise.all([
      CatalogsAPI.listCatalog(CatalogType.SITIO_OCURRENCIA),
      CatalogsAPI.listCatalog(CatalogType.TIPO_VIALIDAD),
      CatalogsAPI.listCatalog(CatalogType.TIPO_ASENTAMIENTO),
    ]);
    sitioOcurrenciaOpts.value = (sitioRes.data || []).map((e) => ({
      value: Number(e.code),
      label: `${e.code} - ${(e.description || '').trim()}`,
    }));
    tipoVialidadOpts.value = (vialidadRes.data || []).map((e) => ({
      value: Number(e.code),
      label: `${e.code} - ${(e.description || '').trim()}`,
    }));
    tipoAsentamientoOpts.value = (asentamientoRes.data || []).map((e) => {
      const desc = (e.description || '').trim();
      const num = Number(e.code);
      return {
        value: !Number.isNaN(num) ? num : e.code,
        label: `${e.code} - ${desc}`,
        code: String(e.code),
        description: desc,
      };
    });
  } catch (err) {
    console.error('Error al cargar catálogos GIIS:', err);
  }
};

onMounted(async () => {
  isHydrating.value = true;
  await Promise.all([loadEstados(), loadGIISCatalogs()]);
  // Preferir formDataLesion cuando tiene datos locales (navegación entre steps); si no, usar documento cargado
  const fd = formDataStore.formDataLesion;
  const hasLocalData = fd.sitioOcurrencia != null || fd.entidadOcurrencia || fd.municipioOcurrencia || fd.codigoPostal;
  const doc = hasLocalData ? fd : (documentos.currentDocument || fd);
  if (doc?.sitioOcurrencia != null) sitioOcurrencia.value = doc.sitioOcurrencia;
  if (doc?.entidadOcurrencia) {
    entidadOcurrencia.value = doc.entidadOcurrencia;
    await loadMunicipios(doc.entidadOcurrencia);
  }
  if (doc?.municipioOcurrencia) {
    municipioOcurrencia.value = doc.municipioOcurrencia;
    if (doc.entidadOcurrencia)
      await loadLocalidades(doc.entidadOcurrencia, doc.municipioOcurrencia);
  }
  if (doc?.localidadOcurrencia) localidadOcurrencia.value = doc.localidadOcurrencia;
  if (doc?.otraLocalidad) otraLocalidad.value = (doc.otraLocalidad || '').toUpperCase();
  if (doc?.codigoPostal) codigoPostal.value = doc.codigoPostal;
  if (doc?.tipoVialidad != null) tipoVialidad.value = doc.tipoVialidad;
  if (doc?.nombreVialidad) nombreVialidad.value = (doc.nombreVialidad || '').toUpperCase();
  if (doc?.numeroExterior) numeroExterior.value = formatNumeroExteriorInput(doc.numeroExterior);
  if (doc?.tipoAsentamiento != null) tipoAsentamiento.value = doc.tipoAsentamiento;
  if (doc?.nombreAsentamiento) nombreAsentamiento.value = (doc.nombreAsentamiento || '').toUpperCase();
  syncToFormData();
  await nextTick();
  await nextTick();
  // Retrasar para que todos los watchers terminen antes de desproteger
  setTimeout(() => { isHydrating.value = false; }, 50);
});

onUnmounted(() => {
  syncToFormData();
});

watch(
  [
    sitioOcurrencia,
    entidadOcurrencia,
    municipioOcurrencia,
    localidadOcurrencia,
    otraLocalidad,
    codigoPostal,
    tipoVialidad,
    nombreVialidad,
    numeroExterior,
    tipoAsentamiento,
    nombreAsentamiento,
  ],
  () => {
    if (!isHydrating.value) syncToFormData();
  },
  { deep: true }
);

watch(entidadOcurrencia, async (code) => {
  if (isHydrating.value) {
    if (code) await loadMunicipios(code);
    return;
  }
  municipioOcurrencia.value = '';
  localidadOcurrencia.value = '';
  localidades.value = [];
  if (code) await loadMunicipios(code);
  else municipios.value = [];
}, { flush: 'sync' });

watch(municipioOcurrencia, async (code) => {
  if (isHydrating.value) {
    if (code && entidadOcurrencia.value) await loadLocalidades(entidadOcurrencia.value, code);
    return;
  }
  localidadOcurrencia.value = '';
  if (code && entidadOcurrencia.value) await loadLocalidades(entidadOcurrencia.value, code);
  else localidades.value = [];
}, { flush: 'sync' });

const inputClass = 'w-full py-1.5 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const selectClass = 'w-full py-1 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const labelClass = 'block text-xs font-medium text-gray-700 mb-1';
</script>

<template>
  <div class="space-y-2">
    <h1 class="text-base font-semibold text-gray-900 mb-2">¿Dónde ocurrió el evento?</h1>

    <!-- Fila 1: Sitio ocurrencia -->
    <div class="mb-2">
      <label :class="labelClass">Sitio de ocurrencia *</label>
      <select
        v-model="sitioOcurrencia"
        :class="selectClass"
        required
      >
        <option :value="null">Seleccione...</option>
        <option v-for="opt in sitioOcurrenciaOpts" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Fila 2: Entidad, Municipio, Localidad -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
      <div>
        <CPAutocomplete
          v-model="codigoPostal"
          label="C.P."
          placeholder="Buscar por CP o colonia..."
          compact
          @select="handleCPSelect"
        />
      </div>
      <div>
        <label :class="labelClass">Entidad</label>
        <select
          v-model="entidadOcurrencia"
          :class="selectClass"
          :disabled="loadingGeo.estados"
        >
          <option value="">Seleccione...</option>
          <option v-for="e in estados" :key="e.code" :value="e.code">
            {{ e.description }}
          </option>
        </select>
      </div>
      <div>
        <label :class="labelClass">Municipio</label>
        <select
          v-model="municipioOcurrencia"
          :class="selectClass"
          :disabled="loadingGeo.municipios || !entidadOcurrencia"
        >
          <option value="">Seleccione...</option>
          <option v-for="m in municipios" :key="m.code" :value="m.code">
            {{ m.description }}
          </option>
        </select>
      </div>
      <div>
        <label :class="labelClass">Localidad</label>
        <select
          v-model="localidadOcurrencia"
          :class="selectClass"
          :disabled="loadingGeo.localidades || !municipioOcurrencia"
        >
          <option value="">Seleccione...</option>
          <option v-for="l in localidades" :key="l.code" :value="l.code">
            {{ l.description }}
          </option>
        </select>
      </div>
    </div>

    <!-- Fila 3: Otra localidad -->
    <div class="mb-2">
      <label :class="labelClass">Otra localidad (especifique)</label>
      <input
        :value="otraLocalidad"
        type="text"
        :class="inputClass"
        placeholder="Texto libre"
        @input="otraLocalidad = ($event.target?.value || '').toUpperCase()"
      />
    </div>

    <!-- Fila 4: Tipo vialidad (más ancho), Nombre vialidad (más ancho), Núm. exterior (más angosto) -->
    <div class="grid grid-cols-1 sm:grid-cols-[1.2fr_1.5fr_0.6fr] gap-2 mb-2">
      <div>
        <label :class="labelClass">Tipo vialidad</label>
        <select v-model="tipoVialidad" :class="selectClass">
          <option :value="null">Seleccione...</option>
          <option v-for="opt in tipoVialidadOpts" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div>
        <label :class="labelClass">Nombre vialidad</label>
        <input
          :value="nombreVialidad"
          type="text"
          :class="inputClass"
          placeholder="Nombre"
          @input="nombreVialidad = ($event.target?.value || '').toUpperCase()"
        />
      </div>
      <div>
        <label :class="labelClass">Núm. ext.</label>
        <input
          :value="numeroExterior"
          type="text"
          :class="inputClass"
          placeholder="0"
          maxlength="15"
          @input="numeroExterior = formatNumeroExteriorInput($event.target?.value || '')"
        />
        <!-- <p class="mt-0.5 text-xs text-gray-500">Si se desconoce: 0</p> -->
      </div>
    </div>

    <!-- Fila 5: Tipo asentamiento, Nombre asentamiento -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>
        <label :class="labelClass">Tipo asentamiento</label>
        <select v-model="tipoAsentamiento" :class="selectClass">
          <option :value="null">Seleccione...</option>
          <option v-for="opt in tipoAsentamientoOpts" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div>
        <label :class="labelClass">Nombre asentamiento</label>
        <input
          :value="nombreAsentamiento"
          type="text"
          :class="inputClass"
          placeholder="NO ESPECIFICADO"
          @input="nombreAsentamiento = ($event.target?.value || '').toUpperCase()"
        />
      </div>
    </div>
  </div>
</template>
