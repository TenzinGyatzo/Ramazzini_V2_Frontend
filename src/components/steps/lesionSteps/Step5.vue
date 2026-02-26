<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useDocumentosStore } from '@/stores/documentos';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import CatalogsAPI from '@/api/CatalogsAPI';
import CIE10Autocomplete from '@/components/selectors/CIE10Autocomplete.vue';
import { CatalogType } from '@/interfaces/catalogos.interface';
import { extractCIE10Code } from '@/helpers/cie10';

const { formDataLesion } = useFormDataStore();
const documentos = useDocumentosStore();
const trabajadores = useTrabajadoresStore();

const areaAnatomicaOpts = ref([]);
const consecuenciaOpts = ref([]);

const areaAnatomica = ref(null);
const especifiqueArea = ref('');
const consecuenciaGravedad = ref(null);
const especifiqueConsecuencia = ref('');
const codigoCIEAfeccionPrincipal = ref('');
const descripcionAfeccionPrincipal = ref('');
const codigoCIECausaExterna = ref('');
const causaExterna = ref('');
const afeccionPrincipalReseleccionada = ref('');
const afeccionesTratadas = ref([]);

const parseAfeccionItem = (str) => {
  if (!str || typeof str !== 'string') return { num: 1, desc: '', cie: '' };
  const parts = str.split('#');
  return {
    num: parseInt(parts[0], 10) || 1,
    desc: (parts[1] || '').trim(),
    cie: (parts[2] || '').trim(),
  };
};

const syncToFormData = () => {
  formDataLesion.areaAnatomica = areaAnatomica.value;
  formDataLesion.especifiqueArea = areaAnatomica.value === 16 ? (especifiqueArea.value?.trim() || undefined) : undefined;
  formDataLesion.consecuenciaGravedad = consecuenciaGravedad.value;
  formDataLesion.especifiqueConsecuencia = consecuenciaGravedad.value === 22 ? (especifiqueConsecuencia.value?.trim() || undefined) : undefined;

  const cieAfeccion = extractCIE10Code(codigoCIEAfeccionPrincipal.value);
  formDataLesion.codigoCIEAfeccionPrincipal = cieAfeccion || undefined;
  formDataLesion.descripcionAfeccionPrincipal = descripcionAfeccionPrincipal.value?.trim() || undefined;

  const cieCausa = extractCIE10Code(codigoCIECausaExterna.value);
  formDataLesion.codigoCIECausaExterna = cieCausa || undefined;
  formDataLesion.causaExterna = causaExterna.value?.trim() || undefined;

  const cieReseleccionada = extractCIE10Code(afeccionPrincipalReseleccionada.value);
  formDataLesion.afeccionPrincipalReseleccionada = cieReseleccionada || undefined;

  formDataLesion.afeccionesTratadas = afeccionesTratadas.value
    .filter((item) => item.desc || item.cie)
    .map((item) => {
      const cieCode = extractCIE10Code(item.cie) || '';
      return `${item.num}#${(item.desc || '').toUpperCase()}#${cieCode}`;
    })
    .filter((s) => s !== '#');
};

const loadCatalogs = async () => {
  try {
    const [areaRes, consRes] = await Promise.all([
      CatalogsAPI.listCatalog(CatalogType.AREA_ANATOMICA),
      CatalogsAPI.listCatalog(CatalogType.CONSECUENCIA),
    ]);

    areaAnatomicaOpts.value = (areaRes.data || []).map((e) => ({
      value: Number(e.code),
      label: `${e.code} - ${(e.description || '').trim().toUpperCase()}`,
    }));

    consecuenciaOpts.value = (consRes.data || []).map((e) => ({
      value: Number(e.code),
      label: `${e.code} - ${(e.description || '').trim().toUpperCase()}`,
    }));
  } catch (err) {
    console.error('Error al cargar catálogos Step5:', err);
  }
};

watch(areaAnatomica, (val) => {
  if (val !== 16) especifiqueArea.value = '';
});

watch(consecuenciaGravedad, (val) => {
  if (val !== 22) especifiqueConsecuencia.value = '';
});

watch(
  [
    areaAnatomica,
    especifiqueArea,
    consecuenciaGravedad,
    especifiqueConsecuencia,
    codigoCIEAfeccionPrincipal,
    descripcionAfeccionPrincipal,
    codigoCIECausaExterna,
    causaExterna,
    afeccionPrincipalReseleccionada,
    afeccionesTratadas,
  ],
  () => syncToFormData(),
  { deep: true }
);

onMounted(async () => {
  await loadCatalogs();
  const doc = documentos.currentDocument || formDataLesion;

  if (doc?.areaAnatomica != null) areaAnatomica.value = doc.areaAnatomica;
  if (doc?.especifiqueArea) especifiqueArea.value = (doc.especifiqueArea || '').toUpperCase();
  if (doc?.consecuenciaGravedad != null) consecuenciaGravedad.value = doc.consecuenciaGravedad;
  if (doc?.especifiqueConsecuencia) especifiqueConsecuencia.value = (doc.especifiqueConsecuencia || '').toUpperCase();
  if (doc?.codigoCIEAfeccionPrincipal) codigoCIEAfeccionPrincipal.value = doc.codigoCIEAfeccionPrincipal;
  if (doc?.descripcionAfeccionPrincipal) descripcionAfeccionPrincipal.value = (doc.descripcionAfeccionPrincipal || '').toUpperCase();
  if (doc?.codigoCIECausaExterna) codigoCIECausaExterna.value = doc.codigoCIECausaExterna;
  if (doc?.causaExterna) causaExterna.value = (doc.causaExterna || '').toUpperCase();
  if (doc?.afeccionPrincipalReseleccionada) afeccionPrincipalReseleccionada.value = doc.afeccionPrincipalReseleccionada;

  if (Array.isArray(doc?.afeccionesTratadas) && doc.afeccionesTratadas.length > 0) {
    afeccionesTratadas.value = doc.afeccionesTratadas.map(parseAfeccionItem);
  }

  syncToFormData();
});

onUnmounted(() => {
  syncToFormData();
});

const addAfeccionTratada = () => {
  if (afeccionesTratadas.value.length >= 6) return;
  const nextNum = afeccionesTratadas.value.length + 1;
  afeccionesTratadas.value.push({ num: nextNum, desc: '', cie: '' });
};

const removeAfeccionTratada = (index) => {
  afeccionesTratadas.value.splice(index, 1);
  afeccionesTratadas.value.forEach((item, i) => {
    item.num = i + 1;
  });
};

const transitionClasses = {
  enter: 'transition-all duration-300 ease-out',
  enterFrom: 'opacity-0 transform -translate-y-2',
  enterTo: 'opacity-100 transform translate-y-0',
  leave: 'transition-all duration-200 ease-in',
  leaveFrom: 'opacity-100 transform translate-y-0',
  leaveTo: 'opacity-0 transform -translate-y-2',
};

const inputClass = 'w-full py-1.5 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const selectClass = 'w-full py-1 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';
const labelClass = 'block text-xs font-medium text-gray-700 mb-1';

const validarDescripcionLES = (v) => {
  if (!v || typeof v !== 'string') return { ok: true };
  const t = v.trim();
  if (t.length === 0) return { ok: true };
  if (t.length < 2) return { ok: false, msg: 'La descripción debe tener al menos 2 caracteres.' };
  if (t.length > 250) return { ok: false, msg: 'La descripción no puede exceder 250 caracteres.' };
  if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ]/.test(t)) return { ok: false, msg: 'La descripción debe empezar con una letra.' };
  return { ok: true };
};
const descripcionAfeccionError = computed(() => {
  const r = validarDescripcionLES(descripcionAfeccionPrincipal.value);
  return r.ok ? '' : r.msg;
});
const causaExternaError = computed(() => {
  const r = validarDescripcionLES(causaExterna.value);
  return r.ok ? '' : r.msg;
});
</script>

<template>
  <div class="space-y-2">
    <h1 class="text-base font-semibold text-gray-900 mb-2">Evaluación clínica / Diagnóstico</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
      <div>
        <label :class="labelClass">Área anatómica de mayor gravedad <span class="text-red-500">*</span></label>
        <select v-model="areaAnatomica" :class="selectClass" required>
          <option :value="null">Seleccione...</option>
          <option v-for="opt in areaAnatomicaOpts" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div>
        <label :class="labelClass">Consecuencia resultante de mayor gravedad <span class="text-red-500">*</span></label>
        <select v-model="consecuenciaGravedad" :class="selectClass" required>
          <option :value="null">Seleccione...</option>
          <option v-for="opt in consecuenciaOpts" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <transition
      :enter-active-class="transitionClasses.enter"
      :enter-from-class="transitionClasses.enterFrom"
      :enter-to-class="transitionClasses.enterTo"
      :leave-active-class="transitionClasses.leave"
      :leave-from-class="transitionClasses.leaveFrom"
      :leave-to-class="transitionClasses.leaveTo"
    >
      <div v-if="areaAnatomica === 16" class="mt-2 mb-2">
        <label :class="labelClass">Especifique área anatómica</label>
        <input
          :value="especifiqueArea"
          type="text"
          :class="inputClass"
          placeholder="Nombre del área..."
          @input="especifiqueArea = ($event.target?.value || '').toUpperCase()"
        />
      </div>
    </transition>

    <transition
      :enter-active-class="transitionClasses.enter"
      :enter-from-class="transitionClasses.enterFrom"
      :enter-to-class="transitionClasses.enterTo"
      :leave-active-class="transitionClasses.leave"
      :leave-from-class="transitionClasses.leaveFrom"
      :leave-to-class="transitionClasses.leaveTo"
    >
      <div v-if="consecuenciaGravedad === 22" class="mt-2 mb-2">
        <label :class="labelClass">Especifique consecuencia</label>
        <input
          :value="especifiqueConsecuencia"
          type="text"
          :class="inputClass"
          placeholder="Otra consecuencia..."
          @input="especifiqueConsecuencia = ($event.target?.value || '').toUpperCase()"
        />
      </div>
    </transition>

    <div class="mb-2">
      <CIE10Autocomplete
        v-model="codigoCIEAfeccionPrincipal"
        catalog-variant="giis"
        :solo4Caracteres="true"
        filter-variant="afeccion"
        label="Código CIE-10 afección principal (Cap V: F00-F99, CapXIX: S00-T98 y O04-O07, O20, O267, O429, O468-O469, O68, O710-O719)"
        placeholder="Buscar por código o descripción..."
        :required="true"
        :trabajadorId="trabajadores.currentTrabajadorId"
        :fechaConsulta="formDataLesion?.fechaAtencion"
      />
    </div>

    <div class="mb-2">
      <label :class="labelClass">Descripción afección principal</label>
      <textarea
        :value="descripcionAfeccionPrincipal"
        :class="inputClass"
        rows="2"
        maxlength="250"
        placeholder="Descripción de la afección..."
        @input="descripcionAfeccionPrincipal = ($event.target?.value || '').toUpperCase()"
      />
      <div v-if="descripcionAfeccionError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
        <i class="fas fa-exclamation-triangle mt-0.5"></i>
        <span>{{ descripcionAfeccionError }}</span>
      </div>
    </div>

    <div class="mb-2">
      <CIE10Autocomplete
        v-model="codigoCIECausaExterna"
        catalog-variant="giis"
        filter-variant="causaExterna"
        label="Código CIE-10 causa externa (Cap XX, V01-Y98)"
        placeholder="Buscar causa externa..."
        :required="true"
        :trabajadorId="trabajadores.currentTrabajadorId"
        :fechaConsulta="formDataLesion?.fechaAtencion"
      />
    </div>

    <div class="mb-2">
      <label :class="labelClass">Descripción causa externa</label>
      <input
        :value="causaExterna"
        type="text"
        :class="inputClass"
        placeholder="Acontecimientos que causaron la lesión..."
        @input="causaExterna = ($event.target?.value || '').toUpperCase()"
      />
      <div v-if="causaExternaError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 mt-2">
        <i class="fas fa-exclamation-triangle mt-0.5"></i>
        <span>{{ causaExternaError }}</span>
      </div>
    </div>

    <div class="mb-2">
      <label :class="labelClass">Afección principal reseleccionada (si difiere)</label>
      <CIE10Autocomplete
        v-model="afeccionPrincipalReseleccionada"
        catalog-variant="giis"
        :solo4Caracteres="true"
        filter-variant="afeccion"
        label=""
        placeholder="Opcional: código si difiere del principal..."
        :trabajadorId="trabajadores.currentTrabajadorId"
        :fechaConsulta="formDataLesion?.fechaAtencion"
      />
    </div>

    <div class="mt-4">
      <div class="flex items-center justify-between mb-2">
        <div>
          <label :class="labelClass">Afecciones tratadas (opcional, máx 6)</label>
          <p class="text-xs text-gray-500 mt-0.5">
            Número, descripción y código CIE por cada afección. Si no registra ninguna, se usará la afección principal.
          </p>
        </div>
        <button
          v-if="afeccionesTratadas.length < 6"
          type="button"
          class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          @click="addAfeccionTratada"
        >
          + Añadir afección
        </button>
      </div>

      <div v-for="(item, index) in afeccionesTratadas" :key="index" class="grid grid-cols-1 sm:grid-cols-[auto_1fr_minmax(12rem,1fr)_auto] gap-2 mb-2 items-end">
        <div class="w-12">
          <label :class="labelClass">Nº</label>
          <input
            v-model.number="item.num"
            type="number"
            min="1"
            max="6"
            :class="inputClass"
          />
        </div>
        <div>
          <label :class="labelClass">Descripción</label>
          <input
            :value="item.desc"
            type="text"
            :class="inputClass"
            placeholder="Descripción..."
            @input="item.desc = ($event.target?.value || '').toUpperCase()"
          />
        </div>
        <div>
          <label :class="labelClass">Código CIE</label>
          <CIE10Autocomplete
            v-model="item.cie"
            catalog-variant="giis"
            :solo4Caracteres="true"
            filter-variant="afeccion"
            label=""
            placeholder="S00.0"
            :trabajadorId="trabajadores.currentTrabajadorId"
            :fechaConsulta="formDataLesion?.fechaAtencion"
          />
        </div>
        <button
          type="button"
          class="text-rose-600 hover:text-rose-700 p-2"
          aria-label="Eliminar"
          @click="removeAfeccionTratada(index)"
        >
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>

      <button
        v-if="afeccionesTratadas.length === 0"
        type="button"
        class="text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2"
        @click="addAfeccionTratada"
      >
        + Añadir afección tratada
      </button>
    </div>
  </div>
</template>
