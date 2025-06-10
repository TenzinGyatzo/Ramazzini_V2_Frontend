<script setup lang="ts">
declare const pdfMake: typeof import('pdfmake/build/pdfmake');
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'; 

const props = defineProps<{
  refsGraficas: Record<string, any>;
  nombreEmpresa?: string;
  logoBase64?: string;
}>();

// const obtenerBase64 = (refEl: any): string | undefined => {
//   const canvas = refEl?.$el?.querySelector('canvas');
//   return canvas?.toDataURL();
// };
const obtenerBase64 = (refEl: any): string | undefined => {
  const el = refEl?.$el || refEl;

  // Si el elemento ES un canvas directamente
  if (el instanceof HTMLCanvasElement) {
    return el.toDataURL();
  }

  // Si es un contenedor que tiene un canvas adentro
  const canvas = el?.querySelector?.('canvas');
  return canvas?.toDataURL?.();
};

const generarDocDefinition = (): TDocumentDefinitions => {
    const encabezado: Content[] = [];

    // Logo
    if (props.logoBase64) {
        encabezado.push({
            image: props.logoBase64,
            width: 80,
            alignment: 'left',
            margin: [0, 0, 0, 10],
        });
    }

    // Nombre empresa
    if (props.nombreEmpresa) {
        encabezado.push({
            text: props.nombreEmpresa,
            style: 'titulo',
            margin: [0, 0, 0, 10],
        });
    }

    // Fecha
    encabezado.push({
        text: `Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`,
        style: 'fecha',
        margin: [0, 0, 0, 30],
    });

  const imagenes = {
    imc: obtenerBase64(props.refsGraficas.imc),
    aptitud: obtenerBase64(props.refsGraficas.aptitud),
    lentes: obtenerBase64(props.refsGraficas.lentes),
    corregida: obtenerBase64(props.refsGraficas.corregida),
    daltonismo: obtenerBase64(props.refsGraficas.daltonismo),
    agentes: obtenerBase64(props.refsGraficas.agentes),
    grupos: obtenerBase64(props.refsGraficas.grupos),
    cintura: obtenerBase64(props.refsGraficas.cintura),
  };

  const contenido: Content[] = [];
  contenido.push({ text: 'Informe de Salud Laboral', style: 'titulo' });
  if (imagenes.imc) contenido.push({ text: 'IMC', style: 'seccion' }, { image: imagenes.imc, width: 450, margin: [0, 10, 0, 20] });
  if (imagenes.aptitud) contenido.push({ text: 'Aptitud', style: 'seccion' }, { image: imagenes.aptitud, width: 450, margin: [0, 10, 0, 20] });
  if (imagenes.lentes) contenido.push({ text: 'Lentes', style: 'seccion' }, { image: imagenes.lentes, width: 100, alignment: 'center', margin: [0, 10, 0, 20] });
  if (imagenes.corregida) contenido.push({ text: 'Vista corregida', style: 'seccion' }, { image: imagenes.corregida, width: 100, alignment: 'center', margin: [0, 10, 0, 20] });
  if (imagenes.daltonismo) contenido.push({ text: 'Daltonismo', style: 'seccion' }, { image: imagenes.daltonismo, width: 100, alignment: 'center', margin: [0, 10, 0, 20] });
  if (imagenes.agentes) contenido.push({ text: 'Factores de Riesgo', style: 'seccion' }, { image: imagenes.agentes, width: 450, margin: [0, 10, 0, 20] });
  if (imagenes.grupos) contenido.push({ text: 'Grupos Etarios', style: 'seccion' }, { image: imagenes.grupos, width: 450, margin: [0, 10, 0, 20] });
  if (imagenes.cintura) contenido.push({ text: 'Riesgo por Cintura', style: 'seccion' }, { image: imagenes.cintura, width: 100, alignment: 'center', margin: [0, 10, 0, 20] });

    return {
    content: [...encabezado, ...contenido],
    styles: {
        titulo: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        seccion: { fontSize: 14, bold: true, color: '#374151', margin: [0, 10, 0, 5] },
        fecha: { fontSize: 10, color: 'gray', alignment: 'right' }
    },
    pageMargins: [40, 60, 40, 60],
    };
};

const generarPDF = () => {
  const docDefinition = generarDocDefinition(); // extraemos lógica común

  pdfMake.createPdf(docDefinition).open();
};

const descargarPDF = () => {
  const docDefinition = generarDocDefinition(); // extraemos lógica común

  pdfMake.createPdf(docDefinition).download(`InformeSalud-${new Date().toISOString().split('T')[0]}.pdf`);
};

</script>

<template>
    <div class="flex gap-4 mt-6 justify-end">
    <button
        @click="generarPDF"
        class="px-4 py-2 bg-emerald-600 text-white font-semibold rounded shadow hover:bg-emerald-700 transition"
    >
        Ver informe
    </button>

    <button
        @click="descargarPDF"
        class="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700 transition"
    >
        Descargar PDF
    </button>
    </div>
</template>
