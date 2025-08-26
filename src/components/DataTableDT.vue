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
  mostrarLeyenda?: boolean;
}>();

// Estado local para controlar la visibilidad de la leyenda
const mostrarLeyendaLocal = ref(props.mostrarLeyenda !== false);

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
  (e: 'toggle-leyenda', mostrar: boolean): void;
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
    const columnasOcultas = [2, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

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
        
        // Agregar clase CSS según el estado de vigencia
        if (data && typeof data === 'object' && 'aptitudResumen' in data && 
            data.aptitudResumen && typeof data.aptitudResumen === 'object' && 
            'fechaAptitudPuesto' in data.aptitudResumen) {
          
          const fechaAptitud = data.aptitudResumen.fechaAptitudPuesto;
          if (fechaAptitud) {
            const { estado } = calcularEstadoVigencia(fechaAptitud as string | Date);
            
            switch (estado) {
              case 'Por vencer':
                $(row).addClass('por-vencer-row');
                break;
              case 'Vencido':
                $(row).addClass('vencido-row');
                break;
            }
          }
        }
      },
      columns: [
        { data: null, title: '#', render: (data, type, row, meta) => meta.row + 1 }, // 0
        { data: 'numeroEmpleado', title: 'Num. Trab.', defaultContent: '-' }, // 1
        { data: 'nss', title: 'NSS', defaultContent: '-' }, // 2
        { 
          data: null, 
          title: 'Nombre completo',
          render: function(data, type, row) {
            const primerApellido = row.primerApellido || '';
            const segundoApellido = row.segundoApellido || '';
            const nombre = row.nombre || '';
            
            let nombreCompleto = '';
            if (primerApellido) nombreCompleto += primerApellido;
            if (segundoApellido) nombreCompleto += segundoApellido ? ' ' + segundoApellido : '';
            if (nombre) nombreCompleto += nombreCompleto ? ' ' + nombre : nombre;
            
            return nombreCompleto || 'Sin nombre';
          }
        }, // 3
        // { data: 'updatedAt', title: 'Última actualización', render: d => convertirFechaISOaDDMMYYYY(d) },
        { 
          data: 'updatedAt', 
          title: 'Último cambio', 
          render: d => convertirFechaISOaDDMMYYYY(d), 
          type: 'date-dd-MM-yyyy' // Indica que la columna tiene fechas en formato personalizado
        }, // 4
        { data: 'fechaNacimiento', title: 'Edad', render: d => calcularEdad(d) + ' años' }, // 5
        { data: 'sexo', title: 'Sexo' }, // 6
        { data: 'escolaridad', title: 'Escolaridad' }, // 7
        { data: 'puesto', title: 'Puesto' }, // 8
        { data: 'fechaIngreso', title: 'Antigüedad', render: d => calcularAntiguedad(d) }, // 9
        { data: 'telefono', title: 'Teléfono', defaultContent: '-' }, // 10
        { data: 'estadoCivil', title: 'Estado Civil' }, // 11
        { data: 'exploracionFisicaResumen.categoriaIMC', title: 'IMC', defaultContent: '-' }, // 12
        { data: 'exploracionFisicaResumen.categoriaCircunferenciaCintura', title: 'Cintura', defaultContent: '-' }, // 13
        { data: 'exploracionFisicaResumen.categoriaTensionArterial', title: 'TA', defaultContent: '-' }, // 14
        { data: 'examenVistaResumen.requiereLentesUsoGeneral', title: 'Req. Lentes', render: d => d === 'Si' ? 'Requiere lentes' : 'No requiere', defaultContent: '-' }, // 15
        { data: null, title: 'Corrección', render: d => determinarVistaCorregida(d.examenVistaResumen?.requiereLentesUsoGeneral, Number(d.examenVistaResumen?.ojoIzquierdoLejanaConCorreccion), Number(d.examenVistaResumen?.ojoDerechoLejanaConCorreccion)) }, // 16
        { data: 'examenVistaResumen.sinCorreccionLejanaInterpretacion', title: 'Agudeza', defaultContent: '-' }, // 17
        { data: 'examenVistaResumen.interpretacionIshihara', title: 'Daltonismo', defaultContent: '-' }, // 18
        { data: 'historiaClinicaResumen.lumbalgias', title: 'Lumbalgia', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 19
        { data: 'historiaClinicaResumen.diabeticosPP', title: 'Diabetes', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 20
        { data: 'historiaClinicaResumen.cardiopaticosPP', title: 'Cardiopatías', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 21
        { data: 'historiaClinicaResumen.alergicos', title: 'Alergias', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 22
        { data: 'historiaClinicaResumen.hipertensivosPP', title: 'Hipertensión', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 23
        { data: 'historiaClinicaResumen.respiratorios', title: 'Respiratorios', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 24
        { data: 'historiaClinicaResumen.epilepticosPP', title: 'Epilépticos', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 25
        { data: 'historiaClinicaResumen.accidentes', title: 'Accidentes', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 26
        { data: 'historiaClinicaResumen.quirurgicos', title: 'Cirugias', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 27
        { data: 'historiaClinicaResumen.traumaticos', title: 'Traumas', render: d => d === 'Si' ? 'Si' : 'No', defaultContent: '-' }, // 28
        { data: 'historiaClinicaResumen.alcoholismo', title: 'Alcohol', defaultContent: '-' }, // 29
        { data: 'historiaClinicaResumen.tabaquismo', title: 'Tabaco', defaultContent: '-' }, // 30
        { data: 'historiaClinicaResumen.accidenteLaboral', title: 'Acc. Laboral', defaultContent: '-' }, // 31
        { data: 'aptitudResumen.aptitudPuesto', title: 'Aptitud', defaultContent: '-' }, // 32
        { 
          data: 'aptitudResumen.fechaAptitudPuesto', 
          title: 'Estado Vigencia', 
          render: function(data, type, row) {
            if (!data) return '<span class="text-gray-500">Sin fecha</span>';
                        
            const { estado, diasRestantes, diasTranscurridos, color } = calcularEstadoVigencia(data);
                        
            return `
              <div class="flex flex-col items-start gap-1">
                <span class="font-medium ${color}">${estado}</span>
                ${estado === 'Vigente' ? `<span class="text-xs text-gray-600">${diasRestantes} días restantes</span>` : 
                  estado === 'Por vencer' ? `<span class="text-xs text-gray-600">${diasRestantes} días restantes</span>` :
                  estado === 'Vencido' ? `<span class="text-xs text-gray-500">${Math.max(0, diasTranscurridos - 365)} días vencido</span>` :
                  `<span class="text-xs text-gray-500">${estado}</span>`}
              </div>
            `;
          },
          defaultContent: '<span class="text-gray-500">Sin fecha</span>' 
        }, // 33
        { data: 'agentesRiesgoActuales', title: 'Agentes Riesgo', render: d => Array.isArray(d) ? d.join(', ') : '-', defaultContent: '-' }, // 34
        { data: 'consultaResumen.fechaNotaMedica', title: 'Consultas', render: d => d ? 'Si' : 'No', defaultContent: '-' }, // 35
        { data: 'estadoLaboral', title: 'Estado Laboral' }, // 36
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
                class="btn-expediente bg-emerald-600 text-white rounded-full px-2 py-1 transition-all duration-300 ease-out transform hover:scale-105 shadow-md hover:shadow-lg hover:bg-emerald-500 hover:text-white hover:border-emerald-700 border-2 border-emerald-600 inline-block"
                data-id="${row._id}"
              >
                Expediente
              </a>
            `;
          }
        }, // 37
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
                  class="btn-rt group absolute right-25 z-10 hover:z-40 px-2.5 py-1 rounded-full bg-violet-200 hover:bg-violet-300 text-violet-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-violet-200 hover:border-violet-100 whitespace-nowrap flex items-center overflow-hidden text-sm"
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
        }, // 38
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
        { targets: 0, className: 'text-center' }, // Tabaco
        { targets: 30, width: '70px' }, // Tabaco
        { targets: 32, width: '100px' }, // Aptitud
        { targets: 38, width: '248px', className: 'columna-acciones' } // Acciones con clase específica
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

    // Eliminamos la lógica de reordenamiento automático que interfiere con el orden original
    // dataTableInstance.on('draw', function () {
    //   // Esta lógica causaba que el filtro de período cambiara el orden automáticamente
    // });
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
    { id: 'sexo', columna: 6 },
    { id: 'puesto', columna: 8 },
    { id: 'imc', columna: 12 },
    { id: 'cintura', columna: 13 },
    { id: 'tensionArterial', columna: 14 },
    { id: 'lentes', columna: 15 },
    { id: 'correccionVisual', columna: 16 },
    { id: 'agudeza', columna: 17 },
    { id: 'daltonismo', columna: 18 },
    { id: 'lumbalgia', columna: 19 },
    { id: 'diabetico', columna: 20 },
    { id: 'cardiopatico', columna: 21 },
    { id: 'alergia', columna: 22 },
    { id: 'hipertensivo', columna: 23 },
    { id: 'epilepsia', columna: 25 },
    { id: 'accidente', columna: 26 },
    { id: 'quirurgico', columna: 27 },
    { id: 'traumatico', columna: 28 },
    { id: 'aptitud', columna: 32 },
    { id: 'vigencia', columna: 33 },
    { id: 'exposicion', columna: 34 }, // <-- este tiene lógica especial
    { id: 'consultas', columna: 35 },
    { id: 'estadoLaboral', columna: 36 }
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
        fechaFinMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
        break;
      case 'Esta semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes de la semana actual
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFinMesAnterior = new Date(hoy);
        fechaFinMesAnterior.setDate(hoy.getDate() - hoy.getDay() + 7); // Domingo de la semana actual
        fechaFinMesAnterior.setHours(23, 59, 59, 999);
        break;
      case 'Este mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFinMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'Mes anterior':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        fechaFinMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'Últimos 3 meses':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 3);
        fechaFinMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
        break;
      case 'Últimos 6 meses':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 6);
        fechaFinMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
        break;
      case 'Este año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        fechaFinMesAnterior = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'Año anterior':
        fechaInicio = new Date(hoy.getFullYear() - 1, 0, 1);
        fechaFinAnoAnterior = new Date(hoy.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
    }

    if (fechaInicio) {
      const desde = fechaInicio.getTime();
      const hasta = (fechaFinMesAnterior || fechaFinAnoAnterior)?.getTime() || null;

      filtroPeriodoReferencia = function (settings, data) {
        const fechaTexto = data[4]; // columna "Última actualización" (índice 4)
        if (!fechaTexto || fechaTexto === '-') return true;
        
        const partes = fechaTexto.split('-');
        if (partes.length !== 3) return true;

        const fecha = new Date(+partes[2], +partes[1] - 1, +partes[0]); // dd-MM-yyyy
        const fechaTime = fecha.getTime();
        
        const cumpleFiltro = hasta ? (fechaTime >= desde && fechaTime <= hasta) : (fechaTime >= desde);
                
        return cumpleFiltro;
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
    const columnasOcultas = [2, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
    
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

// Agregar watcher para la prop mostrarLeyenda
watch(() => props.mostrarLeyenda, (nuevoValor) => {
  mostrarLeyendaLocal.value = nuevoValor !== false;
});

// Función helper para calcular estado de vigencia y días restantes
function calcularEstadoVigencia(fechaAptitudPuesto: string | Date | null): { estado: string; diasRestantes: number; diasTranscurridos: number; color: string } {
  if (!fechaAptitudPuesto) {
    return { estado: 'Sin fecha', diasRestantes: 0, diasTranscurridos: 0, color: 'text-gray-500' };
  }

  // Convertir la fecha a objeto Date si es string
  let fechaAptitud: Date;
  
  if (typeof fechaAptitudPuesto === 'string') {
    // Si es string, intentar parsear como ISO o como dd/MM/yyyy
    if (fechaAptitudPuesto.includes('/')) {
      // Formato dd/MM/yyyy
      const partes = fechaAptitudPuesto.split('/');
      if (partes.length === 3) {
        fechaAptitud = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      } else {
        fechaAptitud = new Date(fechaAptitudPuesto);
      }
    } else {
      // Formato ISO u otro
      fechaAptitud = new Date(fechaAptitudPuesto);
    }
  } else {
    fechaAptitud = fechaAptitudPuesto;
  }
  
  const fechaActual = new Date();
  
  // Validar que la fecha sea válida
  if (isNaN(fechaAptitud.getTime())) {
    console.warn('Fecha inválida:', fechaAptitudPuesto, 'fecha parseada:', fechaAptitud);
    return { estado: 'Fecha inválida', diasRestantes: 0, diasTranscurridos: 0, color: 'text-gray-500' };
  }
  
  // Calcular diferencia en días
  const diferenciaTiempo = fechaActual.getTime() - fechaAptitud.getTime();
  const diasTranscurridos = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
  
  // Validar que el cálculo sea válido
  if (isNaN(diasTranscurridos)) {
    console.warn('Error calculando días transcurridos:', { fechaAptitud, fechaActual, diferenciaTiempo });
    return { estado: 'Error cálculo', diasRestantes: 0, diasTranscurridos: 0, color: 'text-gray-500' };
  }
  
  // Calcular días restantes para vencer (365 días total)
  const diasRestantes = Math.max(0, 365 - diasTranscurridos);
  
  let estado: string;
  let color: string;
  
  // Lógica corregida:
  // - Si < 304 días: "Vigente" (0-303 días)
  // - Si >= 304 días y < 365 días: "Por vencer" (entre 304-364 días)
  // - Si >= 365 días: "Vencido" (ya cumplió el año completo)
  if (diasTranscurridos < 304) {
    estado = 'Vigente';
    color = 'text-green-600';
  } else if (diasTranscurridos >= 304 && diasTranscurridos < 365) {
    estado = 'Por vencer';
    color = 'text-orange-600';
  } else {
    estado = 'Vencido';
    color = 'text-red-600';
  }
  
  return { estado, diasRestantes, diasTranscurridos, color };
}

</script>

<template>
    <div class="table-container">
    <!-- Leyenda de indicadores visuales -->
    <Transition name="desplegar-leyenda" mode="out-in">
      <div v-if="mostrarLeyendaLocal" class="leyenda-indicadores mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-sm font-semibold text-gray-700">Indicadores Visuales en la Tabla</h3>
          <button 
            @click="mostrarLeyendaLocal = false; emit('toggle-leyenda', false)"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Ocultar leyenda"
          >
            <i class="fa-solid fa-times text-sm"></i>
          </button>
        </div>
      
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <!-- Leyenda de Aptitud (Bordes izquierdos) -->
          <div>
            <h4 class="text-xs font-medium text-gray-600 mb-2">Estado de Aptitud (Borde izquierdo)</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-500 rounded-sm"></div>
                <span class="text-xs text-gray-600">Apto Sin Restricciones</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                <span class="text-xs text-gray-600">Apto Con Precaución</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-orange-500 rounded-sm"></div>
                <span class="text-xs text-gray-600">Apto Con Restricciones</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-500 rounded-sm"></div>
                <span class="text-xs text-gray-600">No Apto</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gray-500 rounded-sm"></div>
                <span class="text-xs text-gray-600">Evaluación No Completada</span>
              </div>
            </div>
          </div>
          
          <!-- Leyenda de Vigencia (Fondo de fila) -->
          <div>
            <h4 class="text-xs font-medium text-gray-600 mb-2">Vigencia (Color de fondo de la fila)</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-orange-100 border border-orange-300 rounded-sm"></div>
                <span class="text-xs text-gray-600">Por Vencer (Vence en menos de 60 días)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-100 border border-red-300 rounded-sm"></div>
                <span class="text-xs text-gray-600">Vencido (Ya cumplió el año)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
                <span class="text-xs text-gray-600">Vigente (examen médico válido)</span>
              </div>
            </div>
          </div>
        </div>
      
    <!-- Información adicional -->
        <div class="mt-3 pt-3 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            <strong>Nota:</strong> Los indicadores se combinan para mostrar tanto la aptitud del trabajador como la vigencia de su examen médico. 
            El borde izquierdo indica la aptitud, mientras que el color de fondo indica si el examen está por vencer o ya venció.
          </p>
        </div>
      </div>
      </Transition>
      
      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table id="customTable" ref="tablaRef" class="display w-full"></table>
      </div>
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

/* Forzar ancho fijo de la columna de acciones */
table.dataTable th.columna-acciones,
table.dataTable td.columna-acciones {
  width: 248px !important;
  min-width: 248px !important;
  max-width: 248px !important;
  white-space: nowrap;
}

/* Asegurar que la última columna tenga el ancho correcto */
table.dataTable th:last-child,
table.dataTable td:last-child {
  width: 248px !important;
  min-width: 248px !important;
  max-width: 248px !important;
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

/* Estilos para la semaforización de aptitud usando background-image */

/* Apto Sin Restricciones - Verde */
table.dataTable tbody tr.apto-sin-restricciones-row {
  background-image: linear-gradient(to right, #10b981 0px, #10b981 4px, transparent 4px) !important;
  background-repeat: no-repeat !important;
  background-position: left center !important;
}

table.dataTable tbody tr.apto-sin-restricciones-row:hover {
  background-color: #f0fdf4 !important;
  background-image: linear-gradient(to right, #10b981 0px, #10b981 4px, #f0fdf4 4px) !important;
}

/* Apto Con Precaución - Amarillo */
table.dataTable tbody tr.apto-con-precaucion-row {
  background-image: linear-gradient(to right, #f59e0b 0px, #f59e0b 4px, transparent 4px) !important;
  background-repeat: no-repeat !important;
  background-position: left center !important;
}

table.dataTable tbody tr.apto-con-precaucion-row:hover {
  background-color: #fffbeb !important;
  background-image: linear-gradient(to right, #f59e0b 0px, #f59e0b 4px, #fffbeb 4px) !important;
}

/* Apto Con Restricciones - Naranja */
table.dataTable tbody tr.apto-con-restricciones-row {
  background-image: linear-gradient(to right, #f97316 0px, #f97316 4px, transparent 4px) !important;
  background-repeat: no-repeat !important;
  background-position: left center !important;
}

table.dataTable tbody tr.apto-con-restricciones-row:hover {
  background-color: #fff7ed !important;
  background-image: linear-gradient(to right, #f97316 0px, #f97316 4px, #fff7ed 4px) !important;
}

/* No Apto - Rojo */
table.dataTable tbody tr.no-apto-row {
  background-image: linear-gradient(to right, #dc2626 0px, #dc2626 4px, transparent 4px) !important;
  background-repeat: no-repeat !important;
  background-position: left center !important;
}

table.dataTable tbody tr.no-apto-row:hover {
  background-color: #fef2f2 !important;
  background-image: linear-gradient(to right, #dc2626 0px, #dc2626 4px, #fef2f2 4px) !important;
}

/* Evaluación No Completada - Gris */
table.dataTable tbody tr.evaluacion-no-completada-row {
  background-image: linear-gradient(to right, #4B5563 0px, #4B5563 4px, transparent 4px) !important;
  background-repeat: no-repeat !important;
  background-position: left center !important;
}

table.dataTable tbody tr.evaluacion-no-completada-row:hover {
  background-color: #fef2f2 !important;
  background-image: linear-gradient(to right, #4B5563 0px, #4B5563 4px, #fef2f2 4px) !important;
}

/* Por Vencer - Fondo naranja claro */
table.dataTable tbody tr.por-vencer-row {
  background-color: #ffedd5 !important; /* orange-100 */
}

table.dataTable tbody tr.por-vencer-row:hover {
  background-color: #fed7aa !important; /* orange-200 */
}

/* Vencido - Fondo rojo claro */
table.dataTable tbody tr.vencido-row {
  background-color: #fee2e2 !important; /* red-100 */
}

table.dataTable tbody tr.vencido-row:hover {
  background-color: #fecaca !important; /* red-200 */
}

/* Estilos adicionales para forzar el ancho de la columna de acciones */
.columna-acciones {
  width: 248px !important;
  min-width: 248px !important;
  max-width: 248px !important;
}

/* Sobrescribir cualquier estilo inline de DataTables */
table.dataTable th.columna-acciones,
table.dataTable td.columna-acciones {
  width: 248px !important;
  min-width: 248px !important;
  max-width: 248px !important;
  box-sizing: border-box !important;
}

/* Asegurar que el contenedor de la tabla respete el ancho */
.dataTables_wrapper .dataTables_scroll {
  overflow-x: auto;
}

/* Forzar el ancho mínimo de la tabla */
#customTable {
  min-width: 100%;
}

/* Clases personalizadas para posicionamiento intermedio */
.right-26 {
  right: 6.5rem; /* 104px - punto medio entre right-24 (96px) y right-28 (112px) */
}

.right-25 {
  right: 6.25rem; /* 100px - más cerca de right-24 */
}

.right-27 {
  right: 6.75rem; /* 108px - más cerca de right-28 */
}

/* Estilos para la columna de vigencia */
table.dataTable td:nth-child(34) {
  min-width: 120px;
  max-width: 150px;
}

/* Asegurar que el contenido de vigencia se alinee correctamente */
table.dataTable td:nth-child(34) .flex {
  align-items: flex-start;
  justify-content: flex-start;
}

/* Estilos para la leyenda de indicadores */
.leyenda-indicadores {
  font-family: inherit;
}

.leyenda-indicadores h3 {
  color: #374151; /* gray-700 */
  font-weight: 600;
}

.leyenda-indicadores h4 {
  color: #4B5563; /* gray-600 */
  font-weight: 500;
}

.leyenda-indicadores .text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 768px) {
  .leyenda-indicadores {
    padding: 1rem;
  }
  
  .leyenda-indicadores .grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .leyenda-indicadores .space-y-2 > div {
    margin-bottom: 0.5rem;
  }
}

/* Transición para la leyenda */
.desplegar-leyenda-enter-active,
.desplegar-leyenda-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.desplegar-leyenda-enter-from,
.desplegar-leyenda-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.desplegar-leyenda-enter-to,
.desplegar-leyenda-leave-from {
  opacity: 1;
  max-height: 800px;
  transform: translateY(0);
}

</style>
