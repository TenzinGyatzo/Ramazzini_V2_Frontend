<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-fixedcolumns-dt';

let dataTableInstance: any = null;

onMounted(() => {
  // Iniciar la tabla cuando se monta el componente
  if (!dataTableInstance) {
    dataTableInstance = new DataTablesCore('#customTable', {
      select: true,
      
    });
  }
});

onUnmounted(() => {
  // Destruir la instancia de DataTable cuando el componente se desmonte
  if (dataTableInstance) {
    dataTableInstance.destroy();
    dataTableInstance = null;
  }
});
</script>

<template>
  <table id="customTable" class="table table-hover" style="width:100%">
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Fecha Registro</th>
        <th>Edad</th>
        <th>Sexo</th>
        <th>Escolaridad</th>
        <th>Puesto</th>
        <th>Antigüedad</th>
        <th>Teléfono</th>
        <th>Estado Civil</th>
        <th>Hijos</th>
        <th>Expediente</th>
        <th>-</th>
      </tr>
    </thead>
    <tbody>
      <slot></slot> <!-- Permitir que el contenido (filas de trabajadores) sea pasado desde el componente padre -->
    </tbody>
  </table>
</template>

<style>
@import 'datatables.net-dt';

table.dataTable > tbody > tr.selected > * {
  box-shadow: inset 0 0 0 9999px #10b981;
  color: rgb(255, 255, 255);
}

div.dt-container .dt-paging .dt-paging-button.current, div.dt-container .dt-paging .dt-paging-button.current:hover {
  color: white !important; 
  border: 1px solid #15803d;
  background-color: #059669;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #10b981), color-stop(100%, #059669)); /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, #10b981 0%, #059669 100%); /* Chrome10+,Safari5.1+ */
  background: -moz-linear-gradient(top, #10b981 0%, #059669 100%); /* FF3.6+ */
  background: -ms-linear-gradient(top, #10b981 0%, #059669 100%); /* IE10+ */
  background: -o-linear-gradient(top, #10b981 0%, #059669 100%); /* Opera 11.10+ */
  background: linear-gradient(to bottom, #10b981 0%, #059669 100%); /* W3C */
}

div.dt-container .dt-paging .dt-paging-button:hover {
  color: inherit !important;
  border: 1px solid #047857;
  background-color: rgba(0, 255, 21, 0.05) !important;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(230, 230, 230, 0.05)), color-stop(100%, rgba(0, 0, 0, 0.05))); /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%); /* Chrome10+,Safari5.1+ */
  background: -moz-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%); /* FF3.6+ */
  background: -ms-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%); /* IE10+ */
  background: -o-linear-gradient(top, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%); /* Opera 11.10+ */
  background: linear-gradient(to bottom, rgba(230, 230, 230, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%); /* W3C */
}

div.dt-container .dt-paging .dt-paging-button:active {
  outline: none;
  background-color: #059669;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #059669), color-stop(100%, #166534)); /* Chrome,Safari4+ */
  background: -webkit-linear-gradient(top, #059669 0%, #166534 100%); /* Chrome10+,Safari5.1+ */
  background: -moz-linear-gradient(top, #059669 0%, #166534 100%); /* FF3.6+ */
  background: -ms-linear-gradient(top, #059669 0%, #166534 100%); /* IE10+ */
  background: -o-linear-gradient(top, #059669 0%, #166534 100%); /* Opera 11.10+ */
  background: linear-gradient(to bottom, #059669 0%, #166534 100%); /* W3C */
  box-shadow: inset 0 0 3px #064e3b !important;
}
</style>
