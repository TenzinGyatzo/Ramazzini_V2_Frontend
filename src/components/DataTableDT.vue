<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-fixedcolumns-dt';

const tablaRef = ref<HTMLElement | null>(null);

let dataTableInstance: any = null;

function guardarFiltroEnLocalStorage(id: string, valor: string) {
  localStorage.setItem(`filtro-${id}`, valor);
}

onMounted(() => {
  // Iniciar la tabla cuando se monta el componente
  if (!dataTableInstance) {
    dataTableInstance = new DataTablesCore('#customTable', {
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
        { targets: [11, 12, 13, 14, 15, 16, 17], visible: false }, // Oculta las columnas de historia clínica
        { targets: 19, width: '160px' } // Acciones
      ]
    } as any);
  }

    const filtros = [
    { id: 'sexo', columna: 4 },
    { id: 'puesto', columna: 6 },
    { id: 'alergico', columna: 11 },
    { id: 'diabetico', columna: 12 },
    { id: 'hipertensivo', columna: 13 },
    { id: 'accidente', columna: 14 },
    { id: 'imc', columna: 15 },
    { id: 'aptitud', columna: 16 },
    { id: 'estadoLaboral', columna: 17 }
  ];

  dataTableInstance.on('init', () => {
    filtros.forEach(({ id, columna }) => {
      const valorGuardado = localStorage.getItem(`filtro-${id}`);
      if (valorGuardado !== null) {
        const selectEl = document.getElementById(`filtro-${id}`) as HTMLSelectElement;
        if (selectEl) selectEl.value = valorGuardado;

        const regex = valorGuardado === '' ? '' : valorGuardado === '-' ? '^-$' : `^${valorGuardado}$`;
        dataTableInstance.column(columna).search(regex, true, false);
      }
    });

    dataTableInstance.draw();
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

  document.getElementById('filtro-alergico')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('alergico', valor);
    dataTableInstance.column(11).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-diabetico')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('diabetico', valor);
    dataTableInstance.column(12).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-hipertensivo')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('hipertensivo', valor);
    dataTableInstance.column(13).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-accidente')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('accidente', valor);
    dataTableInstance.column(14).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-imc')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('imc', valor);
    dataTableInstance.column(15).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });

  document.getElementById('filtro-aptitud')?.addEventListener('change', function () {
    const valor = (this as HTMLSelectElement).value;
    guardarFiltroEnLocalStorage('aptitud', valor);
    dataTableInstance.column(16).search(valor === '-' ? '^-$' : valor, true, false).draw();
  });
  
  const estadoLaboralSelect = document.getElementById('filtro-estadoLaboral') as HTMLSelectElement;

  estadoLaboralSelect?.addEventListener('change', function () {
    const valor = this.value;
    guardarFiltroEnLocalStorage('estadoLaboral', valor);
    dataTableInstance.column(17).search(
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
      dataTableInstance.column(17).search(regex, true, false).draw();
    }
  });

});

</script>

<template>
  <div class="table-container overflow-x-auto">
    <table id="customTable" ref="tablaRef" class="table-auto min-w-[1200px] border-collapse">
      <thead>
        <tr>
          <th>#</th>
          <th >Nombre</th>
          <th>Fecha Registro</th>
          <th>Edad</th>
          <th>Sexo</th>
          <th>Escolaridad</th>
          <th>Puesto</th>
          <th>Antigüedad</th>
          <th>Teléfono</th>
          <th>Estado Civil</th>
          <th>Hijos</th>
          <th>Alg.</th>
          <th>Dbt.</th>
          <th>Hta.</th>
          <th>Acc.</th>
          <th>IMC</th>
          <th>Aptitud</th>
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
