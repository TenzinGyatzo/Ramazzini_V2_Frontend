<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-fixedcolumns-dt';
import $ from 'jquery';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad } from '@/helpers/dates';

const props = defineProps<{ rows: any[] }>();

const tablaRef = ref<HTMLElement | null>(null);
let dataTableInstance: any = null;

function guardarFiltroEnLocalStorage(id: string, valor: string) {
  localStorage.setItem(`filtro-${id}`, valor);
}

onMounted(() => {
  if (!dataTableInstance) {
    const determinarVistaCorregida = (
      requiereLentesUsoGeneral?: string | null,
      ojoIzquierdoLejanaConCorreccion?: number | null,
      ojoDerechoLejanaConCorreccion?: number | null
    ): string => {
      if (requiereLentesUsoGeneral === 'No') return 'No requiere';
      if (requiereLentesUsoGeneral === 'Si') {
        return ((ojoIzquierdoLejanaConCorreccion ?? 0) > 0 || (ojoDerechoLejanaConCorreccion ?? 0) > 0)
          ? 'Corregida' : 'Sin corregir';
      }
      return '-';
    };

    dataTableInstance = new DataTablesCore('#customTable', {
      data: props.rows,
      columns: [
        { data: null, title: '#', render: (data, type, row, meta) => meta.row + 1 },
        { data: 'nombre', title: 'Nombre' },
        { data: 'updatedAt', title: 'Última actualización', render: d => convertirFechaISOaDDMMYYYY(d) },
        { data: 'fechaNacimiento', title: 'Edad', render: d => calcularEdad(d) + ' años' },
        { data: 'sexo', title: 'Sexo' },
        { data: 'escolaridad', title: 'Escolaridad' },
        { data: 'puesto', title: 'Puesto' },
        { data: 'fechaIngreso', title: 'Antigüedad', render: d => calcularAntiguedad(d) },
        { data: 'telefono', title: 'Teléfono', defaultContent: '-' },
        { data: 'estadoCivil', title: 'Estado Civil' },
        { data: 'hijos', title: 'Hijos' },
        { data: 'exploracionFisicaResumen.categoriaIMC', title: 'IMC', defaultContent: '-' },
        { data: 'exploracionFisicaResumen.categoriaCircunferenciaCintura', title: 'Cintura', defaultContent: '-' },
        { data: 'aptitudResumen.aptitudPuesto', title: 'Aptitud', defaultContent: '-' },
        { data: 'examenVistaResumen.requiereLentesUsoGeneral', title: 'Req. Lentes', render: d => d === 'Si' ? 'Requiere lentes' : 'No requiere' },
        { data: null, title: 'Corrección', render: d => determinarVistaCorregida(d.examenVistaResumen?.requiereLentesUsoGeneral, Number(d.examenVistaResumen?.ojoIzquierdoLejanaConCorreccion), Number(d.examenVistaResumen?.ojoDerechoLejanaConCorreccion)) },
        { data: 'examenVistaResumen.sinCorreccionLejanaInterpretacion', title: 'Agudeza', defaultContent: '-' },
        { data: 'examenVistaResumen.interpretacionIshihara', title: 'Daltonismo', defaultContent: '-' },
        { data: 'historiaClinicaResumen.diabeticosPP', title: 'Dbt.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.hipertensivosPP', title: 'Hta.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.cardiopaticosPP', title: 'Card.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.epilepticosPP', title: 'Epil.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.alergicos', title: 'Aler.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.lumbalgias', title: 'Lumb.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.accidentes', title: 'Acc.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.quirurgicos', title: 'Ciru.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'historiaClinicaResumen.traumaticos', title: 'Traum.', render: d => d === 'Si' ? 'Si' : 'No' },
        { data: 'agentesRiesgoActuales', title: 'Agentes Riesgo', render: d => Array.isArray(d) ? d.join(', ') : '-' },
        { data: 'consultaResumen.fechaNotaMedica', title: 'Consultas', render: d => d ? 'Si' : 'No' },
        { data: 'estadoLaboral', title: 'Estado Laboral' },
        {
          data: null,
          title: 'Expediente',
          render: function (data, type, row) {
            return `<button class="btn-expediente text-white bg-emerald-600 rounded-full px-2 py-1 border-2 border-emerald-600"
                            data-id="${row._id}">
                      Expediente
                    </button>`;
          }
        },
        {
          data: null,
          title: 'Acciones',
          render: function () {
            return `
              <div style="display:flex; gap:4px; justify-content: center;">
                <button class="btn btn-sm btn-warning">Editar</button>
                <button class="btn btn-sm btn-danger">Eliminar</button>
              </div>
            `;
          }
        }
      ],
      deferRender: true,
      scrollX: true,
      select: true,
      order: [[0, 'desc']],
      language: {
        url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-ES.json'
      }
    });

    dataTableInstance.on('init', function () {
      aplicarTodosLosFiltrosDesdeLocalStorage();
    });
  }
});


// Fuera de la función principal
let filtroPeriodoReferencia: ((settings: any, data: any[]) => boolean) | null = null;

function aplicarTodosLosFiltrosDesdeLocalStorage() {
  const filtros = [
    { id: 'sexo', columna: 4 },
    { id: 'puesto', columna: 6 },
    { id: 'imc', columna: 11 },
    { id: 'cintura', columna: 12 },
    { id: 'aptitud', columna: 13 },
    { id: 'lentes', columna: 14 },
    { id: 'correccionVisual', columna: 15 },
    { id: 'agudeza', columna: 16 },
    { id: 'daltonismo', columna: 17 },
    { id: 'diabetico', columna: 18 },
    { id: 'hipertensivo', columna: 19 },
    { id: 'cardiopatico', columna: 20 },
    { id: 'epilepsia', columna: 21 },
    { id: 'alergia', columna: 22 },
    { id: 'lumbalgia', columna: 23 },
    { id: 'accidente', columna: 24 },
    { id: 'quirurgico', columna: 25 },
    { id: 'traumatico', columna: 26 },
    { id: 'exposicion', columna: 27 }, // <-- este tiene lógica especial
    { id: 'consultas', columna: 28 },
    { id: 'estadoLaboral', columna: 29 }
  ];

  // 1. Limpiar filtros anteriores
  dataTableInstance.columns().search('');
  if (filtroPeriodoReferencia) {
    $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(f => f !== filtroPeriodoReferencia);
    filtroPeriodoReferencia = null;
  }

  // 2. Aplicar filtros por columna
  filtros.forEach(({ id, columna }) => {
    const valor = localStorage.getItem(`filtro-${id}`) || '';

    if (id === 'exposicion') {
      // Aplicar como expresión regular simple, sin anclar (^$) para permitir coincidencias parciales
      const regex = valor === '' ? '' : valor === '-' ? '^-$' : valor;
      dataTableInstance.column(columna).search(regex, true, false);
    } else {
      const regex = valor === '' ? '' : valor === '-' ? '^-$' : `^${valor}$`;
      dataTableInstance.column(columna).search(regex, true, false);
    }
  });

  // 3. Aplicar filtro por fecha (periodo)
  const valorPeriodo = localStorage.getItem('filtro-periodo') || '';
  if (valorPeriodo && valorPeriodo !== 'Todo el tiempo') {
    const hoy = new Date();
    let fechaInicio: Date | null = null;

    switch (valorPeriodo) {
      case 'Este mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'Mes Anterior':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        break;
      case 'Últimos 3 meses':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 3);
        break;
      case 'Últimos 6 meses':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 6);
        break;
      case 'Último año':
        fechaInicio = new Date(hoy);
        fechaInicio.setFullYear(hoy.getFullYear() - 1);
        break;
    }

    if (fechaInicio) {
      const desde = fechaInicio.getTime();
      filtroPeriodoReferencia = function (settings, data) {
        const fechaTexto = data[2]; // columna "Fecha Registro"
        const partes = fechaTexto.split('-');
        if (partes.length !== 3) return true;
        const fecha = new Date(+partes[2], +partes[1] - 1, +partes[0]);
        return fecha.getTime() >= desde;
      };
      $.fn.dataTable.ext.search.push(filtroPeriodoReferencia);
    }
  }

  // 4. Redibujar tabla
  dataTableInstance.draw();
}

defineExpose({
  aplicarTodosLosFiltrosDesdeLocalStorage
});

</script>

<template>
  <div class="table-container overflow-x-auto">
    <table id="customTable" ref="tablaRef" class="display nowrap w-full"></table>
  </div>
</template>

<style scoped>
.table-container {
  overflow-x: auto;
  /* Permite scroll horizontal solo si es necesario */
}

#customTable {
  width: 100%;
  table-layout: auto;
  /* Mantén el comportamiento automático para el layout */
}

/* Forzar ancho fijo de la última columna sin importar el viewport */
table.dataTable th:last-child,
table.dataTable td:last-child {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
  white-space: nowrap;
}

</style>


<style>
@import 'datatables.net-dt';

table.dataTable th.dt-type-numeric,
table.dataTable th.dt-type-date,
table.dataTable td.dt-type-numeric,
table.dataTable td.dt-type-date {
  text-align: left;
}

table.dataTable>tbody>tr>th,
table.dataTable>tbody>tr>td {
  padding: 4px 6px;
}

table.dataTable>tbody>tr.selected>* {
  box-shadow: inset 0 0 0 9999px #10b981;
  color: rgb(255, 255, 255);
}

div.dt-container .dt-paging .dt-paging-button.current,
div.dt-container .dt-paging .dt-paging-button.current:hover {
  color: white !important;
  border: 1px solid #15803d;
  background-color: #059669;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #10b981), color-stop(100%, #059669));
  /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, #10b981 0%, #059669 100%);
  /* Chrome10+,Safari5.1+ */
  background: -moz-linear-gradient(top, #10b981 0%, #059669 100%);
  /* FF3.6+ */
  background: -ms-linear-gradient(top, #10b981 0%, #059669 100%);
  /* IE10+ */
  background: -o-linear-gradient(top, #10b981 0%, #059669 100%);
  /* Opera 11.10+ */
  background: linear-gradient(to bottom, #10b981 0%, #059669 100%);
  /* W3C */
}

div.dt-container .dt-paging .dt-paging-button:hover {
  color: inherit !important;
  border: 1px solid #047857;
  background-color: rgba(0, 255, 21, 0.05) !important;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(230, 230, 230, 0.05)), color-stop(100%, rgba(0, 0, 0, 0.05)));
  /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%);
  /* Chrome10+,Safari5.1+ */
  background: -moz-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%);
  /* FF3.6+ */
  background: -ms-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%);
  /* IE10+ */
  background: -o-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%);
  /* Opera 11.10+ */
  background: linear-gradient(to bottom, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%);
  /* W3C */
}

div.dt-container .dt-paging .dt-paging-button:active {
  outline: none;
  background-color: #059669;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #059669), color-stop(100%, #166534));
  /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, #059669 0%, #166534 100%);
  /* Chrome10+,Safari5.1+ */
  background: -moz-linear-gradient(top, #059669 0%, #166534 100%);
  /* FF3.6+ */
  background: -ms-linear-gradient(top, #059669 0%, #166534 100%);
  /* IE10+ */
  background: -o-linear-gradient(top, #059669 0%, #166534 100%);
  /* Opera 11.10+ */
  background: linear-gradient(to bottom, #059669 0%, #166534 100%);
  /* W3C */
  box-shadow: inset 0 0 3px #064e3b !important;
}

.dtfc-top-blocker {
  display: none !important;
}
</style>
