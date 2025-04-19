<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-fixedcolumns-dt';
import $ from 'jquery';

const tablaRef = ref<HTMLElement | null>(null);
let dataTableInstance: any = null;

function guardarFiltroEnLocalStorage(id: string, valor: string) {
  localStorage.setItem(`filtro-${id}`, valor);
}

onMounted(() => {
  // Iniciar la tabla cuando se monta el componente
  if (!dataTableInstance) {
    dataTableInstance = new DataTablesCore('#customTable', {
      deferRender: true,
      select: true,
      order: [[0, 'desc']],
      /* fixedColumns:{
        leftColumns: 2
      }, */
      scrollCollapse: true,
      scrollY: '800px',
      scrollX: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-ES.json',
        select: {
          rows: {
            _: "", // Texto cuando se seleccionan varias filas
            0: "", // Texto cuando no se selecciona ninguna fila
            1: ""  // Texto cuando se selecciona una fila
          },
          cells: "", // Texto para celdas seleccionadas (puedes dejarlo vacio)
          columns: "" // Texto para columnas seleccionadas (puedes dejarlo vacío)
        }
      },
      columnDefs: [
        { targets: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], visible: false }, // Oculta las columnas 
        { targets: 20, width: '160px' } // Acciones
      ]
    } as any);
  }

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
    { id: 'accidente', columna: 20 },
    { id: 'agentesRiesgo', columna: 21 },
    { id: 'consultas', columna: 22 },
    { id: 'estadoLaboral', columna: 23 },
  ];

  dataTableInstance.on('init', function () {
    aplicarTodosLosFiltrosDesdeLocalStorage();
  });

  document.getElementById('filtro-sexo')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('sexo', valor);
    dataTableInstance.column(4).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-puesto')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('puesto', valor);
    dataTableInstance.column(6).search(valor, true, false).draw();
  });

  document.getElementById('filtro-imc')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('imc', valor);
    dataTableInstance.column(11).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-aptitud')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('aptitud', valor);
    dataTableInstance.column(13).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-diabetico')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('diabetico', valor);
    dataTableInstance.column(18).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-hipertensivo')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('hipertensivo', valor);
    dataTableInstance.column(19).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-accidente')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('accidente', valor);
    dataTableInstance.column(20).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });
  
  document.getElementById('filtro-exposicion')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('exposicion', valor);

    const regex = valor === '' ? '' : valor === '-' ? '^-$' : valor; // '-' representa "sin exposición"
    dataTableInstance.column(21).search(regex, true, false).draw();
  });

  const estadoLaboralSelect = document.getElementById('filtro-estadoLaboral') as HTMLSelectElement;

  estadoLaboralSelect?.addEventListener('change', function () {
    const valor = this.value;
    guardarFiltroEnLocalStorage('estadoLaboral', valor);
    dataTableInstance.column(23).search(
      valor === '' ? '' : valor === '-' ? '^-$' : `^${valor}$`,
      true,
      false
    ).draw();
  });

  // Aplicar el filtro por defecto en "Activo" cuando la tabla ya esté inicializada
  dataTableInstance.on('init', function () {
    if (estadoLaboralSelect) {
      const defaultValor = estadoLaboralSelect.value;
      const regex = defaultValor === '' ? '' : defaultValor === '-' ? '^-$' : `^${defaultValor}$`;
      dataTableInstance.column(23).search(regex, true, false).draw();
    }
  });

  document.getElementById('filtro-periodo')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('periodo', valor);

    const hoy = new Date();
    let fechaInicio: Date | null = null;
    let fechaFin: Date | null = null;

    switch (valor) {
      case 'Hoy':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
        break;

      case 'Esta semana':
        const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1; // lunes = 0, domingo = 6
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - diaSemana);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(hoy);
        fechaFin.setDate(fechaInicio.getDate() + 7);
        fechaFin.setHours(0, 0, 0, 0);
        break;

      case 'Este mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        break;

      case 'Mes anterior':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;

      case 'Últimos 3 meses': {
        const anio = hoy.getFullYear();
        const mes = hoy.getMonth(); // 0 = enero

        fechaInicio = new Date(anio, mes - 2, 1); // Primer día de hace 2 meses
        fechaFin = new Date(anio, mes + 1, 1);    // Primer día del mes siguiente
        break;
      }

      case 'Este año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        fechaFin = new Date(hoy.getFullYear() + 1, 0, 1);
        break;

      case 'Año anterior':
        fechaInicio = new Date(hoy.getFullYear() - 1, 0, 1);
        fechaFin = new Date(hoy.getFullYear(), 0, 1);
        break;

      default:
        dataTableInstance.column(2).search('').draw();
        return;
    }

    if (fechaInicio) {
      const desde = fechaInicio.getTime();
      // Limpiar filtro anterior si existe
      if (filtroPeriodoReferencia) {
        $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(f => f !== filtroPeriodoReferencia);
        filtroPeriodoReferencia = null;
      }

      // Definir nuevo filtro si aplica
      if (fechaInicio) {
        const desde = fechaInicio.getTime();
        const hasta = fechaFin ? fechaFin.getTime() : null; // Si no hay fecha fin, no se aplica filtro

        filtroPeriodoReferencia = function (settings, data) {
          const fechaTexto = data[2]; // dd-mm-yyyy
          const partes = fechaTexto.split('-');
          if (partes.length !== 3) return true; // ignora si está mal formateada

          const fecha = new Date(+partes[2], +partes[1] - 1, +partes[0]);
          const time = fecha.getTime();

          return time >= desde && time < hasta;
        };
        $.fn.dataTable.ext.search.push(filtroPeriodoReferencia);
      }

      dataTableInstance.draw();
    }
  });
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
    { id: 'accidente', columna: 20 },
    { id: 'exposicion', columna: 21 }, // <-- este tiene lógica especial
    { id: 'consultas', columna: 22 },
    { id: 'estadoLaboral', columna: 23 }
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
    <table id="customTable" ref="tablaRef" class="table-auto min-w-[1200px] border-collapse">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Última<br>actualización</th>
          <th>Edad&nbsp;&nbsp;&nbsp;&nbsp;</th>
          <th>Sexo</th>
          <th>Escolaridad</th>
          <th>Puesto</th>
          <th>Antigüedad</th>
          <th>Teléfono</th>
          <th>Estado Civil</th>
          <th>Hijos</th>
          <th>IMC</th>
          <th>Cintura</th>
          <th>Aptitud</th>
          <th>Req. Lentes</th>
          <th>Corrección</th>
          <th>Agudeza</th>
          <th>Daltonismo</th>
          <th>Dbt.</th>
          <th>Hta.</th>
          <th>Acc.</th>
          <th>Agentes Riesgo</th>
          <th>Consultas</th>
          <th>Estado Laboral</th>
          <th>Expediente</th>
          <th class="w-[200px]">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <slot></slot> <!-- Permitir que el contenido (filas de trabajadores) sea pasado desde el componente padre -->
      </tbody>
    </table>
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
