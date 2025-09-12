<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import { useTrabajadoresStore } from '@/stores/trabajadores';
import DocumentosAPI from '@/api/DocumentosAPI';
import { findNearestDocument } from '@/helpers/findNearestDocuments';
import { useDocumentosStore } from '@/stores/documentos';

const trabajadores = useTrabajadoresStore();
const { formDataAudiometria } = useFormDataStore();
const documentos = useDocumentosStore();

// Valor local para diagnosticoAudiometria
const diagnosticoAudiometria = ref(formDataAudiometria.diagnosticoAudiometria || '');

onMounted(() => {
  if (documentos.currentDocument?.diagnosticoAudiometria) {
    diagnosticoAudiometria.value = documentos.currentDocument.diagnosticoAudiometria;
  }
});

watch(diagnosticoAudiometria, (newValue) => {
  formDataAudiometria.diagnosticoAudiometria = newValue ?? '';
});

// Generar el texto dinámico basado en la información
const diagnosticoAutomatico = computed(() => {
  const {
    oidoDerecho125, oidoDerecho250, oidoDerecho500, oidoDerecho1000, oidoDerecho2000, oidoDerecho3000, oidoDerecho4000, oidoDerecho6000, oidoDerecho8000,
    oidoIzquierdo125, oidoIzquierdo250, oidoIzquierdo500, oidoIzquierdo1000, oidoIzquierdo2000, oidoIzquierdo3000, oidoIzquierdo4000, oidoIzquierdo6000, oidoIzquierdo8000,
    hipoacusiaBilateralCombinada
  } = formDataAudiometria;

  // --- helper: a número, o NaN si viene vacío ---
  const n = (v) => (v === "" || v === null || v === undefined) ? NaN : Number(v);

  // --- Definición de oídos (vía aérea) ---
  const airR = {
    125: n(oidoDerecho125), 250: n(oidoDerecho250), 500: n(oidoDerecho500), 1000: n(oidoDerecho1000),
    2000: n(oidoDerecho2000), 3000: n(oidoDerecho3000), 4000: n(oidoDerecho4000), 6000: n(oidoDerecho6000), 8000: n(oidoDerecho8000)
  };
  const airL = {
    125: n(oidoIzquierdo125), 250: n(oidoIzquierdo250), 500: n(oidoIzquierdo500), 1000: n(oidoIzquierdo1000),
    2000: n(oidoIzquierdo2000), 3000: n(oidoIzquierdo3000), 4000: n(oidoIzquierdo4000), 6000: n(oidoIzquierdo6000), 8000: n(oidoIzquierdo8000)
  };

  // --- Utilidades locales ---
  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
  const available = (ear, list) => list.filter(f => Number.isFinite(ear[f]));
  const bandProm = (ear, freqs) => {
    const vals = freqs.map(f => ear[f]).filter(Number.isFinite);
    return vals.length ? mean(vals) : null;
  };

  // PTA estándar: 500-1000-2000 (+3000 si existe)
  const computePTAStd = (ear) => {
    const base = [500, 1000, 2000].filter(f => Number.isFinite(ear[f]));
    if (base.length < 3) return null;
    const vals = [ear[500], ear[1000], ear[2000]];
    if (Number.isFinite(ear[3000])) vals.push(ear[3000]);
    return Math.round(mean(vals));
  };

  // PTA Low-Frequency (LF): 125-250-500
  const computePTALF = (ear) => {
    const base = [125, 250, 500].filter(f => Number.isFinite(ear[f]));
    if (base.length < 3) return null;
    return Math.round(mean([ear[125], ear[250], ear[500]]));
  };

  // Detecta graves elevados: al menos 2 de 125/250/500 ≥ 25 dB
  const hasHighLF = (ear) => [125, 250, 500].filter(f => Number.isFinite(ear[f]) && ear[f] >= 25).length >= 2;

  // Clasificación OMS del grado por PTA
  const gradoOMS = (pta) => {
    if (pta === null) return "no valorable";
    if (pta <= 20) return "dentro de límites normales";
    if (pta <= 34) return "leve";
    if (pta <= 49) return "moderada";
    if (pta <= 64) return "moderada-severa";
    if (pta <= 79) return "severa";
    return "profunda";
  };

  // --- Extracción de rasgos SOLO con vía aérea ---
  const featuresFromAir = (ear) => {
    const lf = bandProm(ear, [125, 250, 500]);
    const mf = bandProm(ear, [1000, 2000, 3000]);
    const hf = bandProm(ear, [3000, 4000, 6000, 8000]);

    const all = Object.values(ear).filter(Number.isFinite);
    const maxHL = all.length ? Math.max(...all) : null;
    const minHL = all.length ? Math.min(...all) : null;
    const rangeHL = (maxHL != null && minHL != null) ? (maxHL - minHL) : null;
    const nFreq = all.length;

    const difLF_HF = (lf != null && hf != null) ? (lf - hf) : null; // + = graves peor
    const difHF_LF = (hf != null && lf != null) ? (hf - lf) : null; // + = agudos peor

    const hfVals = [ear[3000], ear[4000], ear[6000], ear[8000]].filter(Number.isFinite);
    const maxHF = hfVals.length ? Math.max(...hfVals) : null;

    return { lf, mf, hf, maxHL, minHL, rangeHL, nFreq, difLF_HF, difHF_LF, maxHF };
  };


  // --- Inferencia de TIPO sugerente con SOLO vía aérea ---
  const determinarTipoSoloAerea = (ear) => {
    const { lf, hf, maxHL, minHL, rangeHL, nFreq, difLF_HF, difHF_LF, maxHF } = featuresFromAir(ear);
    if (nFreq < 3 || maxHL == null) return { tipo: "", razones: ["frecuencias insuficientes"] };

    const razones = [];
    let tipo = "";

    // Reglas base (bandas)
    const patronConductivo = (difLF_HF != null && difLF_HF >= 15) && (maxHL <= 60);
    const patronNeuro = (difHF_LF != null && difHF_LF >= 15) || (hf != null && hf >= 55) || (maxHF != null && maxHF >= 60);

    // Regla PLANA: rango total pequeño
    const esPlana = (rangeHL != null && rangeHL <= 10); // 10–15 dB es aceptable; puede subir a 15 si lo prefiere

    if (esPlana) {
      if (maxHL > 20) {
        tipo = "mixta";
        razones.push("audiograma plano con niveles >60 dB HL");
      } 
    }

    // Mixta: requiere patrón conductivo + evidencia en agudos
    const patronMixto = patronConductivo && ((difHF_LF != null && difHF_LF >= 15) || (hf != null && hf >= 55) || (maxHF != null && maxHF >= 60));

    // Si no se decidió por "plana", evalúe las otras reglas
    if (!tipo) {
      if (patronMixto) {
        tipo = "mixta";
        razones.push("graves peor ≥15 dB + evidencia coclear en agudos");
      } else if (patronConductivo && !patronNeuro) {
        tipo = "conductiva";
        razones.push("graves peor que agudos ≥15 dB, máximos ≤60 dB HL");
      } else if (patronNeuro && !patronConductivo) {
        tipo = "neurosensorial";
        if (difHF_LF != null && difHF_LF >= 15) razones.push("agudos peor que graves ≥15 dB");
        if (hf != null && hf >= 55) razones.push("promedio de agudos ≥55 dB HL");
        if (maxHF != null && maxHF >= 60) razones.push("pico en agudos ≥60 dB HL");
      } else if (patronConductivo && patronNeuro) {
        tipo = "mixta";
        razones.push("señales combinadas de componente conductivo y coclear");
      } else {
        return { tipo: "", razones: ["patrón no concluyente con vía aérea"] };
      }
    }

    return { tipo, razones };
  };


  // Redacción por oído (nueva)
  const redactarOido = (label, air) => {
    const PTAstd = computePTAStd(air);
    const PTAlf  = computePTALF(air);
    const lado = label === "OD" ? "derecha" : "izquierda";

    if (PTAstd === null) {
      return `SIN CLASIFICACIÓN ${lado.toUpperCase()} VALORABLE (FRECUENCIAS INCOMPLETAS).`;
    }

    // Override: si PTA “normal” pero graves altos, no declarar normal
    if (PTAstd <= 20 && hasHighLF(air) && PTAlf !== null) {
      const { tipo } = determinarTipoSoloAerea(air);
      return `HIPOACUSIA ${tipo.toUpperCase()} ${lado.toUpperCase()} ${gradoOMS(PTAlf).toUpperCase()}.`;
    }

    if (PTAstd <= 20) {
      return `AUDICIÓN ${lado.toUpperCase()} DENTRO DE LÍMITES NORMALES.`;
    }

    const { tipo } = determinarTipoSoloAerea(air);
    if (!tipo) {
      return `HIPOACUSIA ${lado.toUpperCase()} ${gradoOMS(PTAstd).toUpperCase()}, PATRÓN NO CONCLUYENTE PARA TIPO (SOLO VÍA AÉREA).`;
    }
    return `HIPOACUSIA ${tipo.toUpperCase()} ${lado.toUpperCase()} ${gradoOMS(PTAstd).toUpperCase()}.`;
  };

  // Textos por oído
  const odTexto = redactarOido("OD", airR);
  const oiTexto = redactarOido("OI", airL);

  // Intento de unificación bilateral cuando ambos lados comparten el mismo núcleo
  const normalizarParaComparar = (t) =>
    t.replace("DERECHA", "LADO")
     .replace("IZQUIERDA", "LADO")
     .replace(/AUDICIÓN LADO DENTRO DE LÍMITES NORMALES\./, "AUDICIÓN LADO DENTRO DE LÍMITES NORMALES.")
     .replace(/HIPOACUSIA LADO /, "HIPOACUSIA LADO ");

  const textosCoinciden = normalizarParaComparar(odTexto) === normalizarParaComparar(oiTexto);

  let textoOidos;
  if (textosCoinciden) {
    // Convertir a bilateral
    textoOidos = odTexto
      .replace("DERECHA", "BILATERAL")
      .replace("AUDICIÓN BILATERAL", "AUDICIÓN BILATERAL") // mantiene si era normal
      .replace("HIPOACUSIA BILATERAL", "HIPOACUSIA BILATERAL");
  } else {
    textoOidos = [odTexto, oiTexto].filter(Boolean).join(" ");
  }

  // Línea de HBC/Hipoacusia Bilateral Combinada (si se proporciona)
  const lineaPBC = Number.isFinite(hipoacusiaBilateralCombinada)
    ? `HBC DE ${hipoacusiaBilateralCombinada}%.`
    : "";

  // Ensamblado final
  const texto = [textoOidos, lineaPBC].filter(Boolean).join(" ");

  return texto;
});

const insertarDiagnostico = (texto) => {
  // Inserta reemplazando el contenido actual
  diagnosticoAudiometria.value = texto;
};

</script>



<template>
    <h1 class="font-bold mb-4 text-gray-800 leading-5">Audiometría</h1>
    
    <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2 text-gray-800">DIAGNÓSTICO</h2>

        <!-- Textarea (source of truth local) -->
        <div class="font-light mb-4">
            <textarea
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-48"
                v-model="diagnosticoAudiometria"
                required
            ></textarea>
        </div>

        <!-- === Diagnóstico Automático === -->
        <div class="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-emerald-800">Diagnóstico Automático</h3>
                <button
                    class="px-3 py-1 rounded-md text-sm text-emerald-700 border border-emerald-600 hover:bg-emerald-100"
                    @click="insertarDiagnostico(diagnosticoAutomatico)"
                    title="Usar diagnóstico automático"
                >
                    Usar este diagnóstico
                </button>
            </div>
            <p class="text-sm text-emerald-700 italic">{{ diagnosticoAutomatico }}</p>
        </div>
    </div>
</template>
