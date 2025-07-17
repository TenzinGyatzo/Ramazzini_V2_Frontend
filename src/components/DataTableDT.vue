<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-fixedcolumns-dt';
import $ from 'jquery';
import { convertirFechaISOaDDMMYYYY, calcularEdad, calcularAntiguedad, determinarVistaCorregida } from '@/helpers/dates';
import { useRouter } from 'vue-router';
import { useEmpresasStore } from '@/stores/empresas';
import { useCentrosTrabajoStore } from '@/stores/centrosTrabajo';

const props = defineProps<{ 
  rows: any[];
  mostrarColumnasOcultas?: boolean;
}>();

const tablaRef = ref<HTMLElement | null>(null);
let dataTableInstance: any = null;

const router = useRouter();
const empresas = useEmpresasStore();
const centrosTrabajo = useCentrosTrabajoStore();

function guardarFiltroEnLocalStorage(id: string, valor: string) {
  localStorage.setItem(`filtro-${id}`, valor);
}

const emit = defineEmits<{
  (e: 'riesgo-trabajo', trabajador: any): void;
  (e: 'riesgos', trabajador: any): void;
  (e: 'editar', trabajador: any): void;
  (e: 'toggle-estado-laboral', trabajador: any): void;
  (e: 'eliminar', payload: { id: string; nombre: string }): void;
  (e: 'actualizando-tabla', actualizando: boolean): void;
}>();

onMounted(() => {
  if (!dataTableInstance) {

    $.fn.dataTable.ext.type.order['date-dd-MM-yyyy-desc'] = function(a, b) {
      const dateA = a.split('-').reverse().join('-');
      const dateB = b.split('-').reverse().join('-');
      return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
    };

    $.fn.dataTable.ext.type.order['date-dd-MM-yyyy-asc'] = function(a, b) {
      const dateA = a.split('-').reverse().join('-');
      const dateB = b.split('-').reverse().join('-');
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    };

    // Definir las columnas que se ocultan por defecto
    const columnasOcultas = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];

    dataTableInstance = new DataTablesCore('#customTable', {
      data: props.rows,
      createdRow: function(row, data, dataIndex) {
        // Agregar clase CSS según la aptitud del trabajador
        if (data && typeof data === 'object' && 'aptitudResumen' in data && 
            data.aptitudResumen && typeof data.aptitudResumen === 'object' && 
            'aptitudPuesto' in data.aptitudResumen) {
          
          const aptitud = data.aptitudResumen.aptitudPuesto;
          
          switch (aptitud) {
            case 'Apto Sin Restricciones':
              $(row).addClass('apto-sin-restricciones-row');
              break;
            case 'Apto Con Precaución':
              $(row).addClass('apto-con-precaucion-row');
              break;
            case 'Apto Con Restricciones':
              $(row).addClass('apto-con-restricciones-row');
              break;
            case 'No Apto':
              $(row).addClass('no-apto-row');
              break;
            case 'Evaluación No Completada':
              $(row).addClass('evaluacion-no-completada-row');
              break;
          }
        }
      },
      columns: [
        { data: null, title: '#', render: (data, type, row, meta) => meta.row + 1 }, // 0
        { data: 'numeroEmpleado', title: 'Num. Trab.', defaultContent: '-' }, // 1
        { data: 'nombre', title: 'Nombre completo' }, // 2
        // { data: 'updatedAt', title: 'Última actualización', render: d => convertirFechaISOaDDMMYYYY(d) },
        { 
          data: 'updatedAt', 
          title: 'Última actualización', 
          render: d => convertirFechaISOaDDMMYYYY(d), 
          type: 'date-dd-MM-yyyy' // Indica que la columna tiene fechas en formato personalizado
        }, // 3
        { data: 'fechaNacimiento', title: 'Edad', render: d => calcularEdad(d) + ' años' }, // 4
        { data: 'sexo', title: 'Sexo' }, // 5
        { data: 'escolaridad', title: 'Escolaridad' }, // 6
        { data: 'puesto', title: 'Puesto' }, // 7
        { data: 'fechaIngreso', title: 'Antigüedad', render: d => calcularAntiguedad(d) }, // 8
        { data: 'telefono', title: 'Teléfono', defaultContent: '-' }, // 9
        { data: 'estadoCivil', title: 'Estado Civil' }, // 10
        { data: 'exploracionFisicaResumen.categoriaIMC', title: 'IMC', defaultContent: '-' }, // 11
        { data: 'exploracionFisicaResumen.categoriaCircunferenciaCintura', title: 'Cintura', defaultContent: '-' }, // 12
        { data: 'exploracionFisicaResumen.categoriaTensionArterial', title: 'TA'}, // 13
        { data: 'examenVistaResumen.requiereLentesUsoGeneral', title: 'Req. Lentes', render: d => d === 'Si' ? 'Requiere lentes' : 'No requiere' }, // 14
        { data: null, title: 'Corrección', render: d => determinarVistaCorregida(d.examenVistaResumen?.requiereLentesUsoGeneral, Number(d.examenVistaResumen?.ojoIzquierdoLejanaConCorreccion), Number(d.examenVistaResumen?.ojoDerechoLejanaConCorreccion)) }, // 15
        { data: 'examenVistaResumen.sinCorreccionLejanaInterpretacion', title: 'Agudeza', defaultContent: '-' }, // 16
        { data: 'examenVistaResumen.interpretacionIshihara', title: 'Daltonismo', defaultContent: '-' }, // 17
        { data: 'historiaClinicaResumen.lumbalgias', title: 'Lumbalgia', render: d => d === 'Si' ? 'Si' : 'No' }, // 18
        { data: 'historiaClinicaResumen.diabeticosPP', title: 'Diabetes', render: d => d === 'Si' ? 'Si' : 'No' }, // 19
        { data: 'historiaClinicaResumen.cardiopaticosPP', title: 'Cardiopatías', render: d => d === 'Si' ? 'Si' : 'No' }, // 20
        { data: 'historiaClinicaResumen.alergicos', title: 'Alergias', render: d => d === 'Si' ? 'Si' : 'No' }, // 21
        { data: 'historiaClinicaResumen.hipertensivosPP', title: 'Hipertensión', render: d => d === 'Si' ? 'Si' : 'No' }, // 22
        { data: 'historiaClinicaResumen.respiratorios', title: 'Respiratorios', render: d => d === 'Si' ? 'Si' : 'No' }, // 23
        { data: 'historiaClinicaResumen.epilepticosPP', title: 'Epilépticos', render: d => d === 'Si' ? 'Si' : 'No' }, // 24
        { data: 'historiaClinicaResumen.accidentes', title: 'Accidentes', render: d => d === 'Si' ? 'Si' : 'No' }, // 25
        { data: 'historiaClinicaResumen.quirurgicos', title: 'Cirugias', render: d => d === 'Si' ? 'Si' : 'No' }, // 26
        { data: 'historiaClinicaResumen.traumaticos', title: 'Traumas', render: d => d === 'Si' ? 'Si' : 'No' }, // 27
        { data: 'historiaClinicaResumen.alcoholismo', title: 'Alcohol'}, // 28
        { data: 'historiaClinicaResumen.tabaquismo', title: 'Tabaco'}, // 29
        { data: 'historiaClinicaResumen.accidenteLaboral', title: 'Acc. Laboral'}, // 30
        { data: 'aptitudResumen.aptitudPuesto', title: 'Aptitud', defaultContent: '-' }, // 31
        { data: 'agentesRiesgoActuales', title: 'Agentes Riesgo', render: d => Array.isArray(d) ? d.join(', ') : '-' }, // 32
        { data: 'consultaResumen.fechaNotaMedica', title: 'Consultas', render: d => d ? 'Si' : 'No' }, // 33
        { data: 'estadoLaboral', title: 'Estado Laboral' }, // 34
        {
          data: null,
          title: 'Expediente',
          render: function (data, type, row) {
            const url = router.resolve({
              name: 'expediente-medico',
              params: {
                idEmpresa: empresas.currentEmpresaId,
                idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId,
                idTrabajador: row._id
              }
            }).href;

            return `
              <a
                href="${url}"
                class="btn-expediente bg-emerald-600 text-white rounded-full px-2 py-1 transition-transform duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-700 border-2 border-emerald-600"
                data-id="${row._id}"
              >
                Expediente
              </a>
            `;
          }
        }, // 35
        {
          data: null,
          title: 'Acciones',
          render: function (data, type, row) {
          const esInactivo = row.estadoLaboral === 'Inactivo';

          return `
              <div class="relative h-[32px]">

              <!-- RTs -->
                <button
                  type="button"
                  class="btn-rt group absolute right-24 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-violet-200 hover:bg-violet-300 text-violet-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-violet-200 hover:border-violet-100 whitespace-nowrap flex items-center overflow-hidden text-sm"
                  data-id="${row._id}"
                >
                  RT
                  <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm">
                    Riesgo de Trabajo
                  </span>
                </button>

              <!-- Riesgos -->
                <button
                  type="button"
                  class="btn-riesgos group absolute left-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-gray-300 hover:bg-amber-400 text-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-amber-100 whitespace-nowrap flex items-center overflow-hidden"
                  data-id="${row._id}"
                >
                  <i class="fa-solid fa-exclamation-triangle"></i>
                  <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm">
                    Agentes de Riesgo
                  </span>
                </button>

              <!-- Editar -->
                <button
                  type="button"
                  class="btn-editar group absolute left-0 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-sky-100 whitespace-nowrap flex items-center overflow-hidden"
                  data-id="${row._id}"
                >
                  <i class="fa-regular fa-pen-to-square"></i>
                  <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-sm">
                    Editar
                  </span>
                </button>

              <!-- Alta o Baja -->
                ${
                  esInactivo
                    ? `<button type="button" class="btn-alta-baja group absolute right-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-green-100 whitespace-nowrap flex items-center overflow-hidden"
                        data-id="${row._id}">
                        <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 text-sm">Alta</span>
                        <i class="fa-solid fa-person-arrow-up-from-line"></i>
                      </button>`
                    : `<button type="button" class="btn-alta-baja group absolute right-12 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-orange-100 whitespace-nowrap flex items-center overflow-hidden"
                        data-id="${row._id}">
                        <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 text-sm">Baja</span>
                        <i class="fa-solid fa-person-arrow-down-to-line"></i>
                      </button>`
                }

                <!-- Eliminar -->
                <button
                  type="button"
                  class="btn-eliminar group absolute right-0 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-red-100 whitespace-nowrap flex items-center overflow-hidden"
                  data-id="${row._id}"
                  data-nombre="${row.nombre}"
                >
                  <span class="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 text-sm order-1">
                    Eliminar
                  </span>
                  <i class="fa-solid fa-trash-can order-2"></i>
                </button>

              </div>
            `;
          }
        }, // 36
      ],
      deferRender: true,
      scrollX: true,
      select: true,
      order: [[0, 'desc']],
      scrollCollapse: true,
      scrollY: '800px',
      language: {
        url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-ES.json',
        // @ts-expect-error: DataTables select extension no está tipado en language
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
        { targets: props.mostrarColumnasOcultas ? [] : columnasOcultas, visible: props.mostrarColumnasOcultas ? true : false }, // Oculta las columnas según la prop
        { targets: 36, width: '210px' } // Acciones 200 para agregar otro botón
      ]
    });

    $(document).on('click', '.btn-expediente', function (e) {
      // Solo intercepta si NO es clic con Ctrl/Command o botón medio
      if (e.ctrlKey || e.metaKey || e.which === 2) return;

      e.preventDefault();

      const idTrabajador = $(this).data('id');
      const trabajador = props.rows.find(t => t._id === idTrabajador);

      if (trabajador) {
        router.push({
          name: 'expediente-medico',
          params: {
            idEmpresa: empresas.currentEmpresaId,
            idCentroTrabajo: centrosTrabajo.currentCentroTrabajoId,
            idTrabajador: trabajador._id
          }
        });
      }
    });

    $(document).on('click', '.btn-rt', function () {
      const id = $(this).data('id');
      const trabajador = props.rows.find(t => t._id === id);
      if (trabajador) {
        emit('riesgo-trabajo', trabajador);
      }
    });

    $(document).on('click', '.btn-riesgos', function () {
      const id = $(this).data('id');
      const trabajador = props.rows.find(t => t._id === id);
      if (trabajador) {
        emit('riesgos', trabajador);
      }
    });

    $(document).on('click', '.btn-editar', function () {
      const id = $(this).data('id');
      const trabajador = props.rows.find(t => t._id === id);
      if (trabajador) {
        emit('editar', trabajador);
      }
    });

    $(document).on('click', '.btn-alta-baja', function () {
      const id = $(this).data('id');
      const trabajador = props.rows.find(t => t._id === id);
      if (trabajador) {
        emit('toggle-estado-laboral', trabajador);
      }
    });

    $(document).on('click', '.btn-eliminar', function () {
      const id = $(this).data('id');
      const nombre = $(this).data('nombre');
      emit('eliminar', { id, nombre });
    });

    dataTableInstance.on('init', function () {
      aplicarTodosLosFiltrosDesdeLocalStorage();
      
      // Ocultar columna de número de empleado si no hay datos
      const tieneNumeroEmpleado = props.rows.some(row => 
        row.numeroEmpleado && 
        row.numeroEmpleado !== '-' && 
        row.numeroEmpleado.trim() !== ''
      );
      
      if (!tieneNumeroEmpleado) {
        dataTableInstance.column(1).visible(false);
      }
    });

    let ordenAplicado = false;

    dataTableInstance.on('draw', function () {
      if (filtroPeriodoReferencia && !ordenAplicado) {
        ordenAplicado = true; // Evita el bucle infinito
        dataTableInstance.order([2, 'desc']).draw(false);
      } else if (!filtroPeriodoReferencia && !ordenAplicado) {
        ordenAplicado = true; // Evita el bucle infinito
        dataTableInstance.order([0, 'desc']).draw(false);
      }

      // Restablecemos la variable después del primer cambio
      setTimeout(() => {
        ordenAplicado = false;
      }, 10); // Un pequeño delay para garantizar que se libere la variable
    });
  }
});

onBeforeUnmount(() => {
  $(document).off('click', '.btn-expediente');
  $(document).off('click', '.btn-editar');
  $(document).off('click', '.btn-eliminar');
  // y así sucesivamente
});

// Fuera de la función principal
let filtroPeriodoReferencia: ((settings: any, data: any[]) => boolean) | null = null;

function aplicarTodosLosFiltrosDesdeLocalStorage() {
  const filtros = [
    { id: 'sexo', columna: 5 },
    { id: 'puesto', columna: 7 },
    { id: 'imc', columna: 11 },
    { id: 'cintura', columna: 12 },
    { id: 'tensionArterial', columna: 13 },
    { id: 'lentes', columna: 14 },
    { id: 'correccionVisual', columna: 15 },
    { id: 'agudeza', columna: 16 },
    { id: 'daltonismo', columna: 17 },
    { id: 'lumbalgia', columna: 18 },
    { id: 'diabetico', columna: 19 },
    { id: 'cardiopatico', columna: 20 },
    { id: 'alergia', columna: 21 },
    { id: 'hipertensivo', columna: 22 },
    { id: 'epilepsia', columna: 24 },
    { id: 'accidente', columna: 25 },
    { id: 'quirurgico', columna: 26 },
    { id: 'traumatico', columna: 27 },
    { id: 'aptitud', columna: 31 },
    { id: 'exposicion', columna: 32 }, // <-- este tiene lógica especial
    { id: 'consultas', columna: 33 },
    { id: 'estadoLaboral', columna: 34 }
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
    let fechaFinMesAnterior: Date | null = null;
    let fechaFinAnoAnterior: Date | null = null;

    switch (valorPeriodo) {
      case 'Hoy':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
        break;
      case 'Esta semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes de la semana actual
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'Este mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'Mes anterior':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        fechaFinMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0); // Último día del mes anterior
        break;
      case 'Últimos 3 meses':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 3);
        break;
      case 'Últimos 6 meses':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 6);
        break;
      case 'Este año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        break;
      case 'Año anterior':
        fechaInicio = new Date(hoy.getFullYear() - 1, 0, 1);
        fechaFinAnoAnterior = new Date(hoy.getFullYear() - 1, 11, 31); // Último día del año anterior
        break;
    }

    if (fechaInicio) {
      const desde = fechaInicio.getTime();
      const hasta = (fechaFinMesAnterior || fechaFinAnoAnterior) ? (fechaFinMesAnterior?.getTime() || fechaFinAnoAnterior?.getTime()) : null;

      filtroPeriodoReferencia = function (settings, data) {
        const fechaTexto = data[2]; // columna "Fecha Registro" (Asegúrate que esté correctamente en formato dd-MM-yyyy)
        const partes = fechaTexto.split('-');
        if (partes.length !== 3) return true;

        const fecha = new Date(+partes[2], +partes[1] - 1, +partes[0]); // dd-MM-yyyy
        if (hasta) {
          return fecha.getTime() >= desde && fecha.getTime() <= hasta;
        }
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

// Agregar watcher para la prop mostrarColumnasOcultas
watch(() => props.mostrarColumnasOcultas, (nuevoValor) => {
  if (dataTableInstance) {
    const columnasOcultas = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
    
    // Cambiar la visibilidad de las columnas
    columnasOcultas.forEach((columnaIndex) => {
      dataTableInstance.column(columnaIndex).visible(nuevoValor);
    });
    
    // Usar requestAnimationFrame para detectar cuando el DOM realmente se actualiza
    // Esto es más preciso que un timeout fijo
    requestAnimationFrame(() => {
      // Un segundo requestAnimationFrame para asegurar que la tabla terminó de renderizar
      requestAnimationFrame(() => {
        emit('actualizando-tabla', false);
      });
    });
  }
});

</script>

<template>
  <div class="table-container overflow-x-auto">
    <table id="customTable" ref="tablaRef" class="display w-full"></table>
  </div>
</template>

<style scoped>
.table-container {
  overflow-x: auto;
  /* Permite scroll horizontal solo si es necesario */
}

#customTable {
  width: 100%;
  table-layout: fixed;
  /* Mantén el comportamiento automático para el layout */
}

/* Forzar ancho fijo de la última columna sin importar el viewport */
table.dataTable th:last-child,
table.dataTable td:last-child {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
  white-space: nowrap;
}

</style>


<style>
@import 'datatables.net-dt';

:root {
  --dt-row-selected: 16, 185, 129 !important; /* RGB del #10b981 */
}

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

table.dataTable tbody tr:hover > * {
  background-color: #e5e7eb !important; /* gray-300 de Tailwind */
}

/* Asegura que el botón "Expediente" mantenga texto blanco al seleccionar la fila */
table.dataTable tbody tr.selected .btn-expediente {
  color: white !important;
}

table.dataTable tbody tr > td,
table.dataTable tbody tr > th {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

table.dataTable tbody td {
  line-height: 1.3 !important; /* o prueba con 1.1 o incluso 1.0 */
}

/* Estilos para la semaforización de aptitud */

/* Apto Sin Restricciones - Verde */
table.dataTable tbody tr.apto-sin-restricciones-row {
  border-left: 4px solid #10b981 !important;
}

table.dataTable tbody tr.apto-sin-restricciones-row:hover {
  background-color: #f0fdf4 !important;
}

/* Apto Con Precaución - Amarillo */
table.dataTable tbody tr.apto-con-precaucion-row {
  border-left: 4px solid #f59e0b !important;
}

table.dataTable tbody tr.apto-con-precaucion-row:hover {
  background-color: #fffbeb !important;
}

/* Apto Con Restricciones - Naranja */
table.dataTable tbody tr.apto-con-restricciones-row {
  border-left: 4px solid #f97316 !important;
}

table.dataTable tbody tr.apto-con-restricciones-row:hover {
  background-color: #fff7ed !important;
}

/* No Apto - Rojo */
table.dataTable tbody tr.no-apto-row {
  border-left: 4px solid #dc2626 !important;
}

table.dataTable tbody tr.no-apto-row:hover {
  background-color: #fef2f2 !important;
}

/* Evaluación No Completada - Gris */
table.dataTable tbody tr.evaluacion-no-completada-row {
  border-left: 4px solid #4B5563 !important; 
}

table.dataTable tbody tr.evaluacion-no-completada-row:hover {
  background-color: #fef2f2 !important;
}

</style>
