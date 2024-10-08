<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import DataTablesCore from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

let dataTableInstance: any = null;

onMounted(() => {
  // Iniciar la tabla cuando se monta el componente
  if (!dataTableInstance) {
    dataTableInstance = new DataTablesCore('#customTable');
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
  <table id="customTable" class="table table-hover table-striped">
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

<style scoped>
@import 'bootstrap/dist/css/bootstrap.min.css'; /* Importar Bootstrap de manera encapsulada */

.pagination {
  --bs-pagination-padding-x: 0.75rem;
  --bs-pagination-padding-y: 0.375rem;
  --bs-pagination-font-size: 1rem;
  --bs-pagination-color: #105a38 !important;
  --bs-pagination-bg: var(--bs-body-bg);
  --bs-pagination-border-width: var(--bs-border-width);
  --bs-pagination-border-color: var(--bs-border-color);
  --bs-pagination-border-radius: var(--bs-border-radius);
  --bs-pagination-hover-color: #105a38 !important;
  --bs-pagination-hover-bg: var(--bs-tertiary-bg);
  --bs-pagination-hover-border-color: var(--bs-border-color);
  --bs-pagination-focus-color: #105a38 !important;
  --bs-pagination-focus-bg: var(--bs-secondary-bg);
  --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(26, 136, 81, 0.25) !important;
  --bs-pagination-active-color: #fff;
  --bs-pagination-active-bg: #198754 !important;
  --bs-pagination-active-border-color: #198754 !important;
  --bs-pagination-disabled-color: var(--bs-secondary-color);
  --bs-pagination-disabled-bg: var(--bs-secondary-bg);
  --bs-pagination-disabled-border-color: var(--bs-border-color);
}
</style>
