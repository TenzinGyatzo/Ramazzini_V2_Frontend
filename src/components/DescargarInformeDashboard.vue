<script setup lang="ts">
declare const pdfMake: typeof import('pdfmake/build/pdfmake');
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { exportarGraficaAltaResolucion } from '@/helpers/exportChartImage';
import { ref, nextTick, watch } from 'vue';

const props = defineProps<{
  refsGraficas: Record<string, any>;
  nombreEmpresa?: string;
  razonSocial?: string;
  logoBase64?: string;
  periodo?: string;
  tablasDatos?: Record<string, any[] | any>;
  totalTrabajadores?: number;
  centroTrabajo?: string;
  tituloMedicoFirmante?: string;
  nombreMedicoFirmante?: string;
}>();

const obtenerBase64 = (graficaObj: any, customWidth?: number, customHeight?: number): string | undefined => {
  // Si es un objeto con ref y config (para alta resolución)
  if (graficaObj && typeof graficaObj === 'object' && ('ref' in graficaObj || 'config' in graficaObj)) {
    if (graficaObj.config) {
      // Usa exportación en alta resolución con escalado proporcional
      return exportarGraficaAltaResolucion(
        graficaObj.config,
        customWidth || 1200,
        customHeight || 900
      );
    }
    const el = graficaObj.ref?.$el || graficaObj.ref;
    if (el instanceof HTMLCanvasElement) {
      return el.toDataURL();
    }
    const canvas = el?.querySelector?.('canvas');
    return canvas?.toDataURL?.();
  }
  
  // Si es solo un ref (método anterior), convertirlo a formato de alta resolución
  const el = graficaObj?.$el || graficaObj;
  if (el instanceof HTMLCanvasElement) {
    return el.toDataURL();
  }
  const canvas = el?.querySelector?.('canvas');
  return canvas?.toDataURL?.();
};

const generarDocDefinition = (altaCalidad: boolean = false): TDocumentDefinitions => {

    const encabezado: Content[] = [];

    // Logo y datos de empresa en una tabla
    const headerTable: Content = {
        table: {
            widths: ['*', 'auto'],
            body: [
                [
                    {
                        stack: [
                            {
                                text: 'INFORME DE SALUD LABORAL',
                                style: 'tituloInforme',
                                margin: [0, 0, 0, 8],
                                characterSpacing: 2
                            },
                            {
                              text: (props.nombreEmpresa || 'Empresa').toUpperCase(),
                              style: 'tituloEmpresa',
                              margin: [0, 0, 0, 2],
                            },
                            ...(props.razonSocial ? [{
                                text: props.razonSocial,
                                style: 'razonSocial',
                                margin: [0, 0, 0, 8]
                            }] : []),
                            ...(props.centroTrabajo ? [{
                                text: [
                                    { text: 'Centro de trabajo: ', style: 'centroTrabajoLabel' },
                                    { text: props.centroTrabajo, style: 'centroTrabajoNombre' }
                                ],
                                margin: [0, 0, 0, 5]
                            }] : []),
                            {
                                text: [
                                    { text: 'Total de trabajadores evaluados: ', style: 'totalTrabajadoresLabel' },
                                    { text: `${props.totalTrabajadores || 0}`, style: 'totalTrabajadoresNumero' }
                                ],
                                margin: [0, 0, 0, 5]
                            },
                            ...(props.periodo ? [{
                                text: props.periodo,
                                style: 'periodo',
                                margin: [0, 0, 0, 5]
                            }] : []),
                            {
                                text: `Generado el: ${new Date().toLocaleDateString('es-MX', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}`,
                                style: 'fecha',
                                margin: [0, 0, 0, 0]
                            },
                            ...((props.tituloMedicoFirmante || props.nombreMedicoFirmante) ? [{
                                text: `Generado por: ${props.tituloMedicoFirmante || ''} ${props.nombreMedicoFirmante || ''}`,
                                style: 'fecha',
                                margin: [0, 5, 0, 0]
                            }] : [])
                        ]
                    },
                    ...(props.logoBase64 ? [{
                        image: props.logoBase64,
                        width: 100,
                        height: 100,
                        fit: [100, 100],
                        margin: [0, 0, 0, 0],
                        alignment: 'right',
                        border: [false, false, false, false]
                    }] : [])
                ]
            ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
    };

    encabezado.push(headerTable);

    // Línea divisoria
    encabezado.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E5E7EB' }],
        margin: [0, 0, 0, 20]
    });

    // Generación de imágenes con calidad ajustable
    // Si altaCalidad es true, usa dimensiones altas para mejor calidad
    // Si es false, usa dimensiones normales para mayor velocidad
    const dimensiones = altaCalidad ? {
        imc: [3000, 2000],
        aptitud: [3000, 2000],
        lentes: [3000, 2000],
        corregida: [3000, 2000],
        daltonismo: [3000, 2000],
        agentes: [3000, 2000],
        grupos: [3600, 2000],
        cintura: [3000, 2000],
        sexo: [3000, 2000],
        tensionArterial: [3000, 2000]
    } : {
        imc: [800, 600],
        aptitud: [800, 600],
        lentes: [600, 600],
        corregida: [600, 600],
        daltonismo: [600, 600],
        agentes: [800, 600],
        grupos: [1000, 600],
        cintura: [600, 800],
        sexo: [600, 800],
        tensionArterial: [800, 600]
    };

    const imagenes = {
        imc: obtenerBase64(props.refsGraficas.imc, dimensiones.imc[0], dimensiones.imc[1]),
        aptitud: obtenerBase64(props.refsGraficas.aptitud, dimensiones.aptitud[0], dimensiones.aptitud[1]),
        lentes: obtenerBase64(props.refsGraficas.lentes, dimensiones.lentes[0], dimensiones.lentes[1]),
        corregida: obtenerBase64(props.refsGraficas.corregida, dimensiones.corregida[0], dimensiones.corregida[1]),
        daltonismo: obtenerBase64(props.refsGraficas.daltonismo, dimensiones.daltonismo[0], dimensiones.daltonismo[1]),
        agentes: obtenerBase64(props.refsGraficas.agentes, dimensiones.agentes[0], dimensiones.agentes[1]),
        grupos: obtenerBase64(props.refsGraficas.grupos, dimensiones.grupos[0], dimensiones.grupos[1]),
        cintura: obtenerBase64(props.refsGraficas.cintura, dimensiones.cintura[0], dimensiones.cintura[1]),
        sexo: obtenerBase64(props.refsGraficas.sexo, dimensiones.sexo[0], dimensiones.sexo[1]),
        tensionArterial: obtenerBase64(props.refsGraficas.tensionArterial, dimensiones.tensionArterial[0], dimensiones.tensionArterial[1])
    };

    const contenido: Content[] = [];

    // Resumen ejecutivo
    contenido.push(
        { text: 'INTRODUCCIÓN', style: 'tituloSeccion' },
        {
            text: [
                'Este informe presenta los resultados descriptivos sobre la ',
                { text: 'salud de los trabajadores,', bold: true },
                'con base en los datos recopilados en el ',
                { text: 'periodo de evaluación seleccionado.', bold: true },
                'El documento busca proporcionar a la dirección información objetiva para apoyar la toma de ',
                { text: 'decisiones estratégicas', bold: true },
                ' en materia de salud ocupacional.'
            ],
            style: 'textoNormal',
            margin: [0, 0, 0, 20]
        }
    );

    // Sección 1: Composición Demográfica
    contenido.push({ text: '1. COMPOSICIÓN DEMOGRÁFICA', style: 'tituloSeccion' });

    if (imagenes.sexo) {
        contenido.push(
            { text: '1.1 Distribución por Sexo', style: 'subtituloSeccion' },
            {
                text: 'A continuación se presenta la distribución proporcional por sexo de la población evaluada, lo que permite analizar las características demográficas de la plantilla laboral.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            }
        );
        
        // Obtener datos de la gráfica de sexo
        const datosSexo = props.tablasDatos?.sexo;
        const masculino = datosSexo?.masculino || 0;
        const femenino = datosSexo?.femenino || 0;
        const porcentajeMasculino = datosSexo?.porcentaje || 0;
        const totalSexo = masculino + femenino;
        
        // Crear tabla con gráfica y datos lado a lado
        // Altura de la imagen (en px)
        const alturaImagenSexo = 175;
        // Altura estimada de una fila de la tabla (en px)
        const alturaFilaTabla = 24; // Ajusta este valor si tu fuente es más grande o pequeña
        // Número de filas de la tabla de sexo (header + filas de datos)
        const filasTablaSexo = 1 + 2; // Header + Hombres + Mujeres
        // Altura total estimada de la tabla
        const alturaTablaSexo = filasTablaSexo * alturaFilaTabla;
        // Margen superior para centrar la tabla respecto a la imagen
        const margenSuperiorTablaSexo = Math.max(0, Math.round((alturaImagenSexo - alturaTablaSexo) / 2));
        
        const tablaSexoCombinada = {
            table: {
                widths: ['60%', '40%'],
                body: [
                    [
                        // Columna izquierda: Gráfica
                        {
                            image: imagenes.sexo,
                            width: 175,
                            alignment: 'center'
                        },
                        // Columna derecha: Tabla de datos
                        {
                            table: {
                                headerRows: 1,
                                widths: ['auto', 'auto'],
                                body: [
                                    [
                                        { text: 'Sexo', style: 'tableHeaderMedium' },
                                        { text: 'Cantidad', style: 'tableHeaderMedium' }
                                    ],
                                    [
                                        { text: 'Hombres', style: 'tableCellMedium' },
                                        { text: `${masculino} (${porcentajeMasculino}%)`, style: 'tableCellBlue' }
                                    ],
                                    [
                                        { text: 'Mujeres', style: 'tableCellMedium' },
                                        { text: `${femenino} (${totalSexo > 0 ? Math.round((femenino / totalSexo) * 100) : 0}%)`, style: 'tableCellPink' }
                                    ]
                                ]
                            },
                            layout: 'lightHorizontalLines',
                            margin: [0, margenSuperiorTablaSexo, 0, 0]
                        }
                    ]
                ]
            },
            layout: 'noBorders',
            margin: [0, 10, 0, 20]
        } as Content;
        
        contenido.push(tablaSexoCombinada);
    }

    if (imagenes.grupos) {
        contenido.push(
            { text: '1.2 Distribución por Grupos Etarios', style: 'subtituloSeccion' },
            {
                text: 'Distribución de los trabajadores activos según grupos etarios y género.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.grupos, 
                width: 460, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        
        // Tabla de grupos etarios
        if (props.tablasDatos?.gruposEtarios) {
            // Los grupos etarios tienen estructura diferente: [grupo, {Masculino: X, Femenino: Y}]
            const datosGrupos = props.tablasDatos.gruposEtarios
                .filter(item => item && Array.isArray(item) && item.length >= 2)
                .map(item => [
                    item[0] || '-',
                    item[1]?.Masculino || 0,
                    item[1]?.Femenino || 0
                ]);
            
            if (datosGrupos.length > 0) {
                const tablaGrupos = crearTablaPDF(
                    datosGrupos,
                    ['Grupo Etario', 'Hombres', 'Mujeres'],
                    'Distribución Demográfica Detallada',
                    'gruposEtarios'
                );
                tablaGrupos.forEach(item => contenido.push(item));
            }
        }
    }

    // Sección 2: Indicadores de Salud Física
    contenido.push({ text: '2. INDICADORES DE SALUD FÍSICA', style: 'tituloSeccion', pageBreak: 'before' });

    if (imagenes.imc) {
        contenido.push(
            { text: '2.1 Índice de Masa Corporal (IMC)', style: 'subtituloSeccion' },
            {
                text: [
                    'El ',
                    { text: 'sobrepeso y la obesidad', bold: true },
                    ' se definen como una ',
                    { text: 'acumulación anormal o excesiva de grasa', bold: true },
                    ' que puede ser perjudicial para la salud. ',
                    { text: 'Un IMC elevado es un importante factor de riesgo', bold: true },
                    ' de enfermedades no transmisibles como la diabetes, los trastornos del aparato locomotor, algunos cánceres y las enfermedades cardiovasculares.'
                ],
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.imc, 
                width: 400, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        
        // Tabla de IMC
        if (props.tablasDatos?.imc) {
            const datosIMC = props.tablasDatos.imc
                .filter(item => item && Array.isArray(item) && item.length >= 3)
                .map(item => [
                    item[0] || '-',
                    `${item[1] || 0} (${item[2] || 0}%)`
                ]);
            
            if (datosIMC.length > 0) {
                // Función para asignar color según la categoría de IMC
                const getIMCCellStyle = (categoria: string) => {
                    if (categoria.includes('Bajo peso')) return 'tableCellAmber';
                    if (categoria.includes('Normal')) return 'tableCellEmerald';
                    if (categoria.includes('Sobrepeso') || categoria.includes('Pre-obesidad')) return 'tableCellAmber';
                    if (categoria.includes('Obesidad')) return 'tableCellRose';
                    return 'tableCellMedium';
                };
                const tablaResultadosIMC = [
                    { text: 'Resultados IMC', style: 'subtituloTabla' },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto'],
                            body: [
                                [
                                    { text: 'Categoría', style: 'tableHeaderMedium' },
                                    { text: 'Cantidad (Porcentaje)', style: 'tableHeaderMedium' }
                                ],
                                ...datosIMC.map(row => [
                                    { text: row[0], style: 'tableCellMedium' },
                                    { text: row[1], style: getIMCCellStyle(row[0]) }
                                ])
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        margin: [0, 0, 0, 0] as [number, number, number, number]
                    }
                ];
                const tablaReferenciaIMC = [
                    { text: 'Tabla de la Organización Mundial de la Salud:', style: 'subtituloTabla' },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto'],
                            body: [
                                [
                                    { text: 'IMC', style: 'tableHeaderMedium' },
                                    { text: 'ESTADO', style: 'tableHeaderMedium' }
                                ],
                                [ { text: 'Por debajo de 18.5', style: 'tableCellMedium' }, { text: 'Bajo peso', style: 'tableCellAmber' } ],
                                [ { text: '18.5 – 24.9', style: 'tableCellMedium' }, { text: 'Peso normal', style: 'tableCellEmerald' } ],
                                [ { text: '25.0 – 29.9', style: 'tableCellMedium' }, { text: 'Pre-obesidad o Sobrepeso', style: 'tableCellAmber' } ],
                                [ { text: '30.0 – 34.9', style: 'tableCellMedium' }, { text: 'Obesidad clase I', style: 'tableCellRose' } ],
                                [ { text: '35.0 – 39.9', style: 'tableCellMedium' }, { text: 'Obesidad clase II', style: 'tableCellRose' } ],
                                [ { text: 'Por encima de 40', style: 'tableCellMedium' }, { text: 'Obesidad clase III', style: 'tableCellRose' } ]
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        margin: [0, 0, 0, 0] as [number, number, number, number]
                    },
                    { text: 'Fuente: OMS (2022)', style: 'pieTabla', italics: true, margin: [0, 10, 0, 20] as [number, number, number, number] }
                ];
                contenido.push({
                    columns: [
                        { width: '50%', stack: [tablaResultadosIMC[0], { ...tablaResultadosIMC[1], margin: [0, 0, 0, 0] as [number, number, number, number] }] },
                        { width: '50%', stack: [tablaReferenciaIMC[0], { ...tablaReferenciaIMC[1], margin: [0, 0, 0, 0] as [number, number, number, number] }, tablaReferenciaIMC[2]] }
                    ],
                    columnGap: 5,
                    margin: [0, 0, 0, 0]
                });
            }
        }
    }

    if (imagenes.cintura) {
        contenido.push(
            { text: '2.2 Circunferencia de Cintura', style: 'subtituloSeccion', pageBreak: 'before' },
            {
                text: [
                    'La circunferencia de cintura es un indicador antropométrico útil para evaluar la ',
                    { text: 'distribución de grasa corporal', bold: true },
                    '. Un valor elevado se asocia con acumulación de grasa central, representando un ',
                    { text: 'riesgo incrementado de enfermedades metabólicas y cardiovasculares', bold: true },
                    ', incluso en personas con peso normal según el IMC. El exceso de grasa abdominal está directamente relacionado con un mayor riesgo de desarrollar ',
                    { text: 'síndrome metabólico, diabetes tipo 2, hipertensión arterial y enfermedad coronaria', bold: true },
                    '.'
                ],
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            }
        );
        
        // Obtener datos de la gráfica de circunferencia de cintura
        const datosCintura = props.tablasDatos?.cintura;
        const altoRiesgo = datosCintura?.alto || 0;
        const riesgoAumentado = datosCintura?.chart?.datasets?.[0]?.data?.[1] || 0;
        const bajoRiesgo = datosCintura?.chart?.datasets?.[0]?.data?.[2] || 0;
        const totalCintura = altoRiesgo + riesgoAumentado + bajoRiesgo;
        const porcentajeAltoRiesgo = totalCintura > 0 ? Math.round((altoRiesgo / totalCintura) * 100) : 0;
        const porcentajeRiesgoAumentado = totalCintura > 0 ? Math.round((riesgoAumentado / totalCintura) * 100) : 0;
        const porcentajeBajoRiesgo = totalCintura > 0 ? Math.round((bajoRiesgo / totalCintura) * 100) : 0;
        
        // --- INICIO CAMBIO CENTRADO VERTICAL ---
        // Altura de la imagen (en px)
        const alturaImagenCintura = 200;
        // Altura estimada de una fila de la tabla (en px)
        const alturaFilaTablaCintura = 24;
        // Número de filas de la tabla de cintura (header + 3 categorías)
        const filasTablaCintura = 1 + 3;
        // Altura total estimada de la tabla
        const alturaTablaCintura = filasTablaCintura * alturaFilaTablaCintura;
        // Margen superior para centrar la tabla respecto a la imagen
        const margenSuperiorTablaCintura = Math.max(0, Math.round((alturaImagenCintura - alturaTablaCintura) / 2));
        // --- FIN CAMBIO CENTRADO VERTICAL ---
        
        // Mostrar gráfica y tabla de resultados lado a lado
        contenido.push({
            table: {
                widths: ['60%', '40%'],
                body: [
                    [
                        // Gráfica a la izquierda
                        {
                            image: imagenes.cintura,
                            width: 200,
                            alignment: 'center',
                            margin: [0, 10, 0, 10]
                        },
                        // Tabla de resultados a la derecha
                        {
                            table: {
                                headerRows: 1,
                                widths: ['auto', 'auto'],
                                body: [
                                    [
                                        { text: 'Categoría', style: 'tableHeaderMedium' },
                                        { text: 'Cantidad', style: 'tableHeaderMedium' }
                                    ],
                                    [
                                        { text: 'Alto riesgo', style: 'tableCellMedium' },
                                        { text: `${altoRiesgo} (${porcentajeAltoRiesgo}%)`, style: 'tableCellRose' }
                                    ],
                                    [
                                        { text: 'Riesgo aumentado', style: 'tableCellMedium' },
                                        { text: `${riesgoAumentado} (${porcentajeRiesgoAumentado}%)`, style: 'tableCellAmber' }
                                    ],
                                    [
                                        { text: 'Bajo riesgo', style: 'tableCellMedium' },
                                        { text: `${bajoRiesgo} (${porcentajeBajoRiesgo}%)`, style: 'tableCellGray' }
                                    ]
                                ]
                            },
                            layout: 'lightHorizontalLines',
                            margin: [0, margenSuperiorTablaCintura, 0, 0]
                        }
                    ]
                ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
        });

        // Tabla de referencia debajo (dividida en dos: mujeres y hombres)
        const tablaReferenciaMujeres = {
            table: {
                headerRows: 1,
                widths: ['auto', 'auto', '40%'],
                body: [
                    [
                        { text: 'SEXO', style: 'tableHeaderMedium' },
                        { text: 'CIRCUNFERENCIA', style: 'tableHeaderMedium' },
                        { text: 'NIVEL DE RIESGO', style: 'tableHeaderMedium' }
                    ],
                    [ { text: 'Mujeres', style: 'tableCellMedium' }, { text: '< 80 cm', style: 'tableCellMedium' }, { text: 'Bajo riesgo', style: 'tableCellMedium' } ],
                    [ { text: 'Mujeres', style: 'tableCellMedium' }, { text: '80 – 87 cm', style: 'tableCellMedium' }, { text: 'Riesgo Aumentado', style: 'tableCellMedium' } ],
                    [ { text: 'Mujeres', style: 'tableCellMedium' }, { text: '≥ 88 cm', style: 'tableCellMedium' }, { text: 'Alto riesgo', style: 'tableCellMedium' } ]
                ]
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 5, 0]
        };
        const tablaReferenciaHombres = {
            table: {
                headerRows: 1,
                widths: ['auto', 'auto', '40%'],
                body: [
                    [
                        { text: 'SEXO', style: 'tableHeaderMedium' },
                        { text: 'CIRCUNFERENCIA', style: 'tableHeaderMedium' },
                        { text: 'NIVEL DE RIESGO', style: 'tableHeaderMedium' }
                    ],
                    [ { text: 'Hombres', style: 'tableCellMedium' }, { text: '< 94 cm', style: 'tableCellMedium' }, { text: 'Bajo riesgo', style: 'tableCellMedium' } ],
                    [ { text: 'Hombres', style: 'tableCellMedium' }, { text: '94 – 101 cm', style: 'tableCellMedium' }, { text: 'Riesgo Aumentado', style: 'tableCellMedium' } ],
                    [ { text: 'Hombres', style: 'tableCellMedium' }, { text: '≥ 102 cm', style: 'tableCellMedium' }, { text: 'Alto riesgo', style: 'tableCellMedium' } ]
                ]
            },
            layout: 'lightHorizontalLines',
            margin: [5, 0, 0, 0]
        };
        // Título de las tablas de referencia
        contenido.push({
            text: 'Tabla del Adult Treatment Panel III (ATP III):',
            style: 'subtituloTabla',
            alignment: 'center',
            margin: [0, 10, 0, 5]
        });
        // Tablas de referencia lado a lado
        contenido.push({
            table: {
                widths: ['50%', '50%'],
                body: [
                    [tablaReferenciaMujeres, tablaReferenciaHombres]
                ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 0]
        });
        // Cita de la fuente debajo
        contenido.push({
            text: 'Fuente: ACC/AHA (2013)',
            style: 'pieTabla',
            alignment: 'center',
            italics: true,
            margin: [0, 10, 0, 20]
        });
    }

    if (imagenes.tensionArterial) {
        contenido.push(
            { text: '2.3 Alteraciones en Presión Arterial', style: 'subtituloSeccion', pageBreak: 'before' },
            {
                text: 'La presión arterial es la tensión ejercida por la sangre que circula sobre las paredes de los vasos sanguíneos, y constituye uno de los principales signos vitales. Los valores de la presión sanguínea se expresan en milímetros del mercurio (mmHg).',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.tensionArterial, 
                width: 400, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        // Tabla de resultados y tabla de referencia lado a lado
        if (props.tablasDatos?.tensionArterial) {
            const datosTension = props.tablasDatos.tensionArterial
                .filter(item => item && Array.isArray(item) && item.length >= 3)
                .map(item => [
                    item[0] || '-',
                    `${item[1] || 0} (${item[2] || 0}%)`
                ]);
            if (datosTension.length > 0) {
                // Función para asignar color según la categoría de tensión arterial
                const getTensionCellStyle = (categoria: string) => {
                    if (categoria.includes('Óptima') || categoria.includes('Normal')) return 'tableCellEmerald';
                    if (categoria.includes('Alta')) return 'tableCellAmber';
                    if (categoria.includes('Hipertensión')) return 'tableCellRose';
                    return 'tableCellMedium';
                };
                // Título resultados
                const tablaResultadosTA = [
                    { text: 'Resultados Tensión Arterial \n ', style: 'subtituloTabla' },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 90],
                            body: [
                                [
                                    { text: 'Categoría', style: 'tableHeaderMedium' },
                                    { text: 'Trabajadores (%)', style: 'tableHeaderMedium' }
                                ],
                                ...datosTension.map(row => [
                                    { text: row[0], style: 'tableCellMedium' },
                                    { text: row[1], style: getTensionCellStyle(row[0]) }
                                ])
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        margin: [0, 0, 0, 0] as [number, number, number, number]
                    }
                ];
                // Título y tabla de referencia
                const tablaReferenciaTA = [
                    { text: 'Tabla de la Organización Mundial de la Salud (OMS)\ny la Sociedad Internacional de Hipertensión (SIH):', style: 'subtituloTabla' },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'CATEGORÍA', style: 'tableHeaderMedium' },
                                    { text: 'SISTÓLICA', style: 'tableHeaderMedium' },
                                    { text: 'DIASTÓLICA', style: 'tableHeaderMedium' }
                                ],
                                [ { text: 'Óptima', style: 'tableCellMedium' }, { text: 'Menos de 120', style: 'tableCellMedium' }, { text: 'Menos de 80', style: 'tableCellMedium' } ],
                                [ { text: 'Normal', style: 'tableCellMedium' }, { text: '121 – 130', style: 'tableCellMedium' }, { text: '81 – 85', style: 'tableCellMedium' } ],
                                [ { text: 'Alta', style: 'tableCellMedium' }, { text: '131 – 139', style: 'tableCellMedium' }, { text: '86 – 89', style: 'tableCellMedium' } ],
                                [ { text: 'Hipertensión ligera', style: 'tableCellMedium' }, { text: '140 – 159', style: 'tableCellMedium' }, { text: '90 – 99', style: 'tableCellMedium' } ],
                                [ { text: 'Hipertensión moderada', style: 'tableCellMedium' }, { text: '160 – 179', style: 'tableCellMedium' }, { text: '100 – 109', style: 'tableCellMedium' } ],
                                [ { text: 'Hipertensión severa', style: 'tableCellMedium' }, { text: '180 o más', style: 'tableCellMedium' }, { text: '110 o más', style: 'tableCellMedium' } ]
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        margin: [0, 0, 0, 0] as [number, number, number, number]
                    }
                ];
                contenido.push({
                    columns: [
                        { width: '45%', stack: [tablaResultadosTA[0], { ...tablaResultadosTA[1], margin: [0, 0, 0, 0] as [number, number, number, number] }] },
                        { width: '55%', stack: [
                            tablaReferenciaTA[0],
                            { ...tablaReferenciaTA[1], margin: [0, 0, 0, 0] as [number, number, number, number] },
                            {
                                text: 'Si ambas mediciones caen en categorías distintas, se emplea la más alta.',
                                style: 'pieTabla',
                                alignment: 'left',
                                italics: true,
                                margin: [0, 10, 0, 0] as [number, number, number, number]
                            },
                            {
                                text: 'Fuente: OMS y SIH (2014)',
                                style: 'pieTabla',
                                alignment: 'center',
                                italics: true,
                                margin: [0, 0, 0, 20] as [number, number, number, number]
                            }
                        ] }
                    ],
                    columnGap: 10,
                    margin: [0, 0, 0, 0]
                });
            }
        }
    }

    // Sección 3: Salud Visual
    contenido.push({ text: '3. SALUD VISUAL', style: 'tituloSeccion', pageBreak: 'before' });

    // Tabla de agudeza visual sin corrección
    if (props.tablasDatos?.vision) {
        contenido.push(
            { text: '3.1 Agudeza Visual', style: 'subtituloSeccion' },
            {
                text: 'La agudeza visual es la capacidad del sistema visual para percibir, detectar o identificar objetos especiales en condiciones de buena iluminación. Se define como la agudeza visual normal la capacidad de discernir contornos nítidos separados por una distancia mínima de 1.75 mm desde una distancia de 20 pies (aproximadamente 6 metros).',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            }
        );
        
        const datosVision = props.tablasDatos.vision
            .filter(item => item && Array.isArray(item) && item.length >= 3)
            .map(item => [
                item[0] || '-',
                `${item[1] || 0} (${item[2] || 0}%)`
            ]);
        
        if (datosVision.length > 0) {
            const tablaVision = crearTablaPDF(
                datosVision,
                ['Categoría', 'Trabajadores (Porcentaje)'],
                'AGUDEZA VISUAL',
                'vision'
            );
            tablaVision.forEach(item => contenido.push(item));
        }
        
        contenido.push({
            text: 'Agudeza visual con corrección: Máxima visión lograda con la prescripción exacta en lentes o lentes de contacto. Si el paciente no tiene prescripción, sería igual a la agudeza visual sin corrección.\n\nAgudeza visual sin corrección: Máxima visión lograda sin usar lentes o lentes de contacto.',
            style: 'textoNormal',
            alignment: 'left',
            margin: [0, 0, 0, 20]
        });
    }

    if (imagenes.lentes) {
        contenido.push(
            { text: '3.2 Corrección de Vista y Daltonismo', style: 'subtituloSeccion' },
            {
                text: 'Se evaluó si los trabajadores requieren corrección visual y si utilizan medios para lograrla, así como la presencia de alteraciones en la visión cromática. La mayoría cuenta con corrección adecuada, y solo se identificó un caso de daltonismo.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            }
        );
        
        // Obtener datos de la gráfica de lentes
        const datosLentes = props.tablasDatos?.lentes;
        const requierenLentes = datosLentes?.requiere || 0;
        const noRequierenLentes = datosLentes?.chart?.datasets?.[0]?.data?.[1] || 0;
        const porcentajeRequieren = datosLentes?.porcentaje || 0;
        const totalLentes = requierenLentes + noRequierenLentes;
        
        // Crear tabla con gráfica y datos lado a lado
        const tablaLentesCombinada = {
            table: {
                widths: ['50%', '50%'],
                body: [
                    [
                        // Columna izquierda: Gráfica
                        {
                            image: imagenes.lentes,
                            width: 150,
                            alignment: 'center'
                        },
                        // Columna derecha: Tabla de datos
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 'auto'],
                                body: [
                                    [
                                        { text: 'Categoría', style: 'tableHeaderMedium' },
                                        { text: 'Cantidad', style: 'tableHeaderMedium' }
                                    ],
                                    [
                                        { text: 'Requieren lentes', style: 'tableCellMedium' },
                                        { text: `${requierenLentes} (${porcentajeRequieren}%)`, style: 'tableCellMedium' }
                                    ],
                                    [
                                        { text: 'No requieren', style: 'tableCellMedium' },
                                        { text: `${noRequierenLentes} (${totalLentes > 0 ? Math.round((noRequierenLentes / totalLentes) * 100) : 0}%)`, style: 'tableCellMedium' }
                                    ]
                                ]
                            },
                            layout: 'lightHorizontalLines'
                        }
                    ]
                ]
            },
            layout: 'noBorders',
            margin: [0, 10, 0, 20]
        } as Content;
        
        contenido.push(tablaLentesCombinada);
    }

    if (imagenes.corregida) {
        contenido.push(
            { text: '3.3 Corrección Visual Implementada', style: 'subtituloSeccion' },
            {
                text: 'Trabajadores que ya cuentan con corrección visual implementada.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            }
        );
        
        // Obtener datos de la gráfica de vista corregida
        const datosVistaCorregida = props.tablasDatos?.vistaCorregida;
        const usanLentes = datosVistaCorregida?.usan || 0;
        const noUsanLentes = datosVistaCorregida?.chart?.datasets?.[0]?.data?.[1] || 0;
        const porcentajeUsan = datosVistaCorregida?.porcentaje || 0;
        const totalVistaCorregida = usanLentes + noUsanLentes;
        
        // Crear tabla con gráfica y datos lado a lado
        const tablaVistaCorregidaCombinada = {
            table: {
                widths: ['50%', '50%'],
                body: [
                    [
                        // Columna izquierda: Gráfica
                        {
                            image: imagenes.corregida,
                            width: 150,
                            alignment: 'center'
                        },
                        // Columna derecha: Tabla de datos
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 'auto'],
                                body: [
                                    [
                                        { text: 'Categoría', style: 'tableHeaderMedium' },
                                        { text: 'Cantidad', style: 'tableHeaderMedium' }
                                    ],
                                    [
                                        { text: 'Usan lentes', style: 'tableCellMedium' },
                                        { text: `${usanLentes} (${porcentajeUsan}%)`, style: 'tableCellMedium' }
                                    ],
                                    [
                                        { text: 'No usan lentes', style: 'tableCellMedium' },
                                        { text: `${noUsanLentes} (${totalVistaCorregida > 0 ? Math.round((noUsanLentes / totalVistaCorregida) * 100) : 0}%)`, style: 'tableCellMedium' }
                                    ]
                                ]
                            },
                            layout: 'lightHorizontalLines'
                        }
                    ]
                ]
            },
            layout: 'noBorders',
            margin: [0, 10, 0, 20]
        } as Content;
        
        contenido.push(tablaVistaCorregidaCombinada);
    }

    if (imagenes.daltonismo) {
        contenido.push(
            { text: '3.4 Alteraciones en la Percepción de Colores', style: 'subtituloSeccion' },
            {
                text: 'Informa cuántos trabajadores presentan alteraciones en la percepción de colores.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            }
        );
        
        // Obtener datos de la gráfica de daltonismo
        const datosDaltonismo = props.tablasDatos?.daltonismo;
        const conDaltonismo = datosDaltonismo?.conDaltonismo || 0;
        const sinDaltonismo = datosDaltonismo?.chart?.datasets?.[0]?.data?.[1] || 0;
        const porcentajeDaltonismo = datosDaltonismo?.porcentaje || 0;
        const totalDaltonismo = conDaltonismo + sinDaltonismo;
        
        // Crear tabla con gráfica y datos lado a lado
        const tablaDaltonismoCombinada = {
            table: {
                widths: ['50%', '50%'],
                body: [
                    [
                        // Columna izquierda: Gráfica
                        {
                            image: imagenes.daltonismo,
                            width: 150,
                            alignment: 'center'
                        },
                        // Columna derecha: Tabla de datos
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 'auto'],
                                body: [
                                    [
                                        { text: 'Categoría', style: 'tableHeaderMedium' },
                                        { text: 'Cantidad', style: 'tableHeaderMedium' }
                                    ],
                                    [
                                        { text: 'Con daltonismo', style: 'tableCellMedium' },
                                        { text: `${conDaltonismo} (${porcentajeDaltonismo}%)`, style: 'tableCellMedium' }
                                    ],
                                    [
                                        { text: 'Sin daltonismo', style: 'tableCellMedium' },
                                        { text: `${sinDaltonismo} (${totalDaltonismo > 0 ? Math.round((sinDaltonismo / totalDaltonismo) * 100) : 0}%)`, style: 'tableCellMedium' }
                                    ]
                                ]
                            },
                            layout: 'lightHorizontalLines'
                        }
                    ]
                ]
            },
            layout: 'noBorders',
            margin: [0, 10, 0, 20]
        } as Content;
        
        contenido.push(tablaDaltonismoCombinada);
    }

    // Sección 4: Antecedentes Médicos
    contenido.push({ text: '4. ANTECEDENTES MÉDICOS', style: 'tituloSeccion' });
    contenido.push({
        text: 'Esta sección presenta un resumen de los antecedentes médicos referidos por los trabajadores durante su evaluación, enfocándose en la presencia de enfermedades crónicas y problemas localizados que podrían tener impacto en su salud y desempeño laboral.',
        style: 'textoNormal',
        margin: [0, 0, 0, 20]
    });

    // Tabla de enfermedades crónicas
    if (props.tablasDatos?.enfermedades) {
        const datosEnfermedades = props.tablasDatos.enfermedades
            .filter(item => item && Array.isArray(item) && item.length >= 3)
            .map(item => [
                item[0] || '-',
                `${item[1] || 0} (${item[2] || 0}%)`
            ]);
        
        if (datosEnfermedades.length > 0) {
            const tablaEnfermedades = crearTablaPDF(
                datosEnfermedades,
                ['Antecedente', 'Casos (Porcentaje)'],
                'Enfermedades Crónicas Referidas',
                'enfermedades'
            );
            tablaEnfermedades.forEach(item => contenido.push(item));
        }
    }

    // Tabla de antecedentes localizados
    if (props.tablasDatos?.antecedentes) {
        const datosAntecedentes = props.tablasDatos.antecedentes
            .filter(item => item && Array.isArray(item) && item.length >= 3)
            .map(item => [
                item[0] || '-',
                `${item[1] || 0} (${item[2] || 0}%)`
            ]);
        
        if (datosAntecedentes.length > 0) {
            const tablaAntecedentes = crearTablaPDF(
                datosAntecedentes,
                ['Antecedente', 'Casos (Porcentaje)'],
                'Problemas Localizados Referidos',
                'antecedentes'
            );
            tablaAntecedentes.forEach(item => contenido.push(item));
        }
    }

    // Sección 5: Factores de Riesgo Ocupacional
    if (imagenes.agentes) {
        contenido.push(
            { text: '5. FACTORES DE RIESGO OCUPACIONAL', style: 'tituloSeccion' },
            {
                text: 'Distribución de trabajadores según los agentes de riesgo presentes en su entorno laboral, permitiendo identificar los tipos de exposición más frecuentes dentro de la plantilla.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.agentes, 
                width: 500, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        
        // Tabla de agentes de riesgo
        if (props.tablasDatos?.agentesRiesgo) {
            const datosAgentes = props.tablasDatos.agentesRiesgo
                .filter(item => item && Array.isArray(item) && item.length >= 3)
                .map(item => [
                    item[0] || '-',
                    `${item[1] || 0} (${item[2] || 0}%)`
                ]);
            
            if (datosAgentes.length > 0) {
                const tablaAgentes = crearTablaPDF(
                    datosAgentes,
                    ['Agente de Riesgo', 'Expuestos (Porcentaje)'],
                    'Detalle de Exposición a Agentes de Riesgo',
                    'agentesRiesgo'
                );
                tablaAgentes.forEach(item => contenido.push(item));
            }
        }
    }

    // Sección 6: Aptitud al Puesto
    if (imagenes.aptitud) {
        contenido.push(
            { text: '6. RESULTADOS DE EXÁMENES MÉDICOS PERIÓDICOS', style: 'tituloSeccion' },
            {
                text: 'El examen médico periódico es una evaluación médica regular para los trabajadores durante su empleo. Su propósito principal es monitorear el estado de salud del trabajador, detectar oportunamente posibles alteraciones relacionadas con el trabajo y verificar la aptitud continua para las funciones. Los resultados de estos exámenes ayudan a identificar riesgos para la salud, permiten intervenciones preventivas y determinan si un individuo permanece apto para su puesto.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.aptitud, 
                width: 500, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        
        // Tabla de aptitud
        if (props.tablasDatos?.aptitud) {
            const datosAptitud = props.tablasDatos.aptitud
                .filter(item => item && Array.isArray(item) && item.length >= 3)
                .map(item => [
                    item[0] || '-',
                    `${item[1] || 0} (${item[2] || 0}%)`
                ]);
            
            if (datosAptitud.length > 0) {
                const tablaAptitud = crearTablaPDF(
                    datosAptitud,
                    ['Resultado', 'Trabajadores (Porcentaje)'],
                    'RESULTADOS EXAMENES MÉDICOS',
                    'aptitud'
                );
                tablaAptitud.forEach(item => contenido.push(item));
            }
        }
    }

    // Pie de página
    contenido.push(
        {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E5E7EB' }],
            margin: [0, 20, 0, 10]
        },
        {
            text: 'Este informe fue generado automáticamente por el sistema de gestión de salud laboral Ramazzini.',
            style: 'piePagina',
            alignment: 'center'
        }
    );

    return {
        content: [...encabezado, ...contenido],
        styles: {
            tituloEmpresa: { 
                fontSize: 24, 
                bold: true, 
                color: '#374151', // Gris oscuro
                alignment: 'left',
                margin: [0, 0, 0, 2]
            },
            razonSocial: { 
                fontSize: 13, 
                color: '#6B7280',
                alignment: 'left',
                italics: true,
                margin: [0, 0, 0, 8]
            },
            tituloInforme: { 
                fontSize: 18, 
                bold: true, 
                color: '#059669',
                alignment: 'left',
                characterSpacing: 2,
                margin: [0, 0, 0, 8]
            },
            totalTrabajadores: { 
                fontSize: 14, 
                bold: true, 
                color: '#059669',
                alignment: 'left',
                margin: [0, 0, 0, 5]
            },
            totalTrabajadoresLabel: { 
                fontSize: 14, 
                bold: true, 
                color: '#059669',
                alignment: 'left'
            },
            totalTrabajadoresNumero: { 
                fontSize: 14, 
                bold: true, 
                color: '#059669',
                decorationColor: '#059669'
            },
            centroTrabajo: { 
                fontSize: 13, 
                bold: true, 
                color: '#2563EB',
                alignment: 'left',
                decoration: 'underline',
                decorationColor: '#2563EB',
                margin: [0, 0, 0, 5]
            },
            centroTrabajoLabel: { 
                fontSize: 13, 
                bold: true, 
                color: '#2563EB',
                alignment: 'left'
            },
            centroTrabajoNombre: { 
                fontSize: 13, 
                bold: true, 
                color: '#2563EB',
                alignment: 'left',
                decoration: 'underline',
                decorationColor: '#2563EB'
            },
            periodo: { 
                fontSize: 12, 
                color: '#6B7280',
                alignment: 'left',
                italics: true,
                margin: [0, 0, 0, 5]
            },
            fecha: { 
                fontSize: 10, 
                color: '#9CA3AF',
                alignment: 'left',
                margin: [0, 0, 0, 0]
            },
            medicoResponsable: { 
                fontSize: 12, 
                bold: true, 
                color: '#1F2937',
                alignment: 'left',
                margin: [0, 8, 0, 0]
            },
            subtitulo: { 
                fontSize: 16, 
                bold: true, 
                color: '#059669',
                alignment: 'left'
            },
            tituloSeccion: { 
                fontSize: 16, 
                bold: true, 
                color: '#1F2937',
                margin: [0, 20, 0, 10],
                background: '#F3F4F6'
            },
            subtituloSeccion: { 
                fontSize: 14, 
                bold: true, 
                color: '#059669',
                margin: [0, 15, 0, 5]
            },
            textoNormal: { 
                fontSize: 11, 
                color: '#374151',
                lineHeight: 1.4,
                alignment: 'justify'
            },
            pieTabla: { 
                fontSize: 9, 
                color: '#6B7280',
                lineHeight: 1.4,
                alignment: 'justify'
            },
            subtituloTabla: { 
                fontSize: 12, 
                bold: true, 
                color: '#059669',
                margin: [0, 15, 0, 5]
            },
            tableHeader: { 
                fontSize: 10, 
                bold: true, 
                color: '#374151',
                background: '#F3F4F6',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableCell: { 
                fontSize: 9, 
                color: '#374151',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableCellLeft: {
                fontSize: 9,
                color: '#374151',
                alignment: 'left',
                margin: [2, 2, 2, 2]
            },
            tableCellEmerald: {
                fontSize: 9,
                color: '#047857',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableCellAmber: {
                fontSize: 9,
                color: '#D97706',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableCellRose: {
                fontSize: 9,
                color: '#DC2626',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableCellBlue: {
                fontSize: 9,
                color: '#1D4ED8',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableCellPink: {
                fontSize: 9,
                color: '#BE185D',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableCellGray: {
                fontSize: 9,
                color: '#374151',
                alignment: 'center',
                margin: [2, 2, 2, 2]
            },
            tableHeaderSmall: { 
                fontSize: 8, 
                bold: true, 
                color: '#374151',
                background: '#F3F4F6',
                alignment: 'center',
                margin: [1, 1, 1, 1]
            },
            tableCellSmall: { 
                fontSize: 8, 
                color: '#374151',
                alignment: 'center',
                margin: [1, 1, 1, 1]
            },
            tableCellLeftSmall: {
                fontSize: 8,
                color: '#374151',
                alignment: 'left',
                margin: [1, 1, 1, 1]
            },
            tableCellEmeraldSmall: {
                fontSize: 8,
                color: '#047857',
                alignment: 'center',
                margin: [1, 1, 1, 1]
            },
            tableCellAmberSmall: {
                fontSize: 8,
                color: '#D97706',
                alignment: 'center',
                margin: [1, 1, 1, 1]
            },
            tableCellRoseSmall: {
                fontSize: 8,
                color: '#DC2626',
                alignment: 'center',
                margin: [1, 1, 1, 1]
            },
            tableHeaderMedium: { 
                fontSize: 10, 
                bold: true, 
                color: '#374151',
                background: '#F3F4F6',
                alignment: 'center',
                margin: [3, 3, 3, 3]
            },
            tableCellMedium: { 
                fontSize: 10, 
                color: '#374151',
                alignment: 'center',
                margin: [3, 3, 3, 3]
            },
            tableCellLeftMedium: {
                fontSize: 10,
                color: '#374151',
                alignment: 'left',
                margin: [3, 3, 3, 3]
            },
            piePagina: { 
                fontSize: 9, 
                color: '#9CA3AF',
                italics: true
            }
        },
        pageMargins: [40, 60, 40, 60],
        defaultStyle: {
            font: 'Roboto'
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                fontSize: 9,
                color: '#9CA3AF',
                margin: [0, 10, 0, 0]
            };
        }
    };
};

// Estado para controlar cuando se está generando el PDF
const generandoPDF = ref(false);
const mostrarModalGeneracion = ref(false);
const mensajeExito = ref('');

// Watcher para monitorear cambios en el estado
watch(generandoPDF, (newValue) => {
  if (!newValue) {
    // Ya no cerramos automáticamente el modal
    // El usuario debe hacer clic para cerrarlo
  }
});

const generarPDF = async () => {
  generandoPDF.value = true;
  mostrarModalGeneracion.value = true;
  
  // Esperar a que Vue actualice el DOM
  await nextTick();
  
  // Pequeño delay para asegurar que el modal se muestre
  setTimeout(async () => {
    try {
      const docDefinition = generarDocDefinition(false); // Calidad normal
      pdfMake.createPdf(docDefinition).open();
      mensajeExito.value = 'El informe se generó correctamente. Puedes revisarlo en la ventana que se abrió.';
    } catch (error) {
      console.error('Error al generar PDF:', error);
      mensajeExito.value = 'Error al generar el PDF.';
    } finally {
      // Pequeño delay para que el usuario vea el estado de carga
      setTimeout(() => {
        generandoPDF.value = false;
      }, 1000);
    }
  }, 100);
};

const cerrarModal = () => {
  if (!generandoPDF.value && mensajeExito.value) {
    // Solo cerrar si ya terminó el proceso y hay mensaje de éxito
    mostrarModalGeneracion.value = false;
    mensajeExito.value = '';
  }
};

const descargarPDF = async () => {
  generandoPDF.value = true;
  mostrarModalGeneracion.value = true;
  
  // Esperar a que Vue actualice el DOM
  await nextTick();
  
  // Pequeño delay para asegurar que el modal se muestre
  setTimeout(async () => {
    try {
      const docDefinition = generarDocDefinition(true); // Alta calidad
      pdfMake.createPdf(docDefinition).download(`InformeSaludLaboral_${props.nombreEmpresa?.replace(/\s+/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`);
      mensajeExito.value = 'Informe generado correctamente.';
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      mensajeExito.value = 'Error al descargar el informe.';
    } finally {
      // Pequeño delay para que el usuario vea el estado de carga
      setTimeout(() => {
        generandoPDF.value = false;
      }, 1000);
    }
  }, 100);
};

// Función para crear tablas en PDF con colores condicionales
const crearTablaPDF = (datos: any[], columnas: string[], titulo: string, tipoTabla: string = 'general'): Content[] => {
  if (!datos || datos.length === 0) return [];
  
  // Filtrar y limpiar los datos para evitar celdas undefined
  const datosLimpios = datos
    .filter(fila => fila && Array.isArray(fila))
    .map(fila => fila.map(celda => celda !== undefined && celda !== null ? String(celda) : '-'));
  
  if (datosLimpios.length === 0) return [];

  // Función para determinar el estilo de celda según el tipo de tabla y valores
  const getCellStyle = (valor: string, columnaIndex: number, filaIndex: number) => {
    // Extraer solo el número de la cantidad (antes del paréntesis)
    const cantidadMatch = valor.match(/^(\d+)/);
    const cantidad = cantidadMatch ? parseInt(cantidadMatch[1]) : 0;
    
    // Primera columna siempre sin colores (solo centrada)
    if (columnaIndex === 0) return 'tableCell';
    
    // Lógica específica por tipo de tabla
    switch (tipoTabla) {
      case 'imc':
        const categoria = datosLimpios[filaIndex][0];
        if (categoria === 'Normal') return 'tableCellEmerald';
        if (['Bajo peso', 'Sobrepeso'].includes(categoria)) return 'tableCellAmber';
        return 'tableCellRose';
      
      case 'aptitud':
        const resultado = datosLimpios[filaIndex][0];
        if (resultado === 'Apto Sin Restricciones') return 'tableCellEmerald';
        if (resultado === 'Apto Con Precaución') return 'tableCellAmber';
        if (resultado === 'Apto Con Restricciones') return 'tableCellAmber';
        if (resultado === 'No Apto') return 'tableCellRose';
        return 'tableCell';
      
      case 'enfermedades':
      case 'antecedentes':
      case 'agentesRiesgo':
        return cantidad === 0 ? 'tableCellEmerald' : 'tableCellRose';
      
      case 'gruposEtarios':
        if (columnaIndex === 1) return 'tableCellBlue'; // Hombres
        if (columnaIndex === 2) return 'tableCellPink'; // Mujeres
        return 'tableCell';
      
      case 'vision':
        const categoriaVision = datosLimpios[filaIndex][0];
        if (cantidad === 0) return 'tableCellEmerald';
        if (categoriaVision === 'Visión ligeramente reducida') return 'tableCellAmber';
        if (['Visión excepcional', 'Visión normal'].includes(categoriaVision)) return 'tableCellEmerald';
        return 'tableCellRose';
      
      case 'tensionArterial':
        const categoriaTension = datosLimpios[filaIndex][0];
        if (['Óptima', 'Normal'].includes(categoriaTension)) return 'tableCellEmerald';
        if (categoriaTension === 'Alta') return 'tableCellAmber';
        if (['Hipertensión ligera', 'Hipertensión moderada', 'Hipertensión severa'].includes(categoriaTension)) return 'tableCellRose';
        return 'tableCell';
      
      default:
        return 'tableCell';
    }
  };
  
  return [
    { text: titulo, style: 'subtituloTabla', margin: [0, 15, 0, 5] } as Content,
    {
      table: {
        headerRows: 1,
        widths: columnas.map(() => '*'),
        body: [
          columnas.map(col => ({ text: col, style: 'tableHeader' })),
          ...datosLimpios.map((fila, filaIndex) => 
            fila.map((celda, columnaIndex) => ({ 
              text: celda, 
              style: getCellStyle(celda, columnaIndex, filaIndex) 
            }))
          )
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 5, 0, 15]
    } as Content
  ];
};

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>

<template>
    <!-- Modal de generación de PDF -->
    <Transition name="fade">
      <div 
        v-if="mostrarModalGeneracion" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click="!generandoPDF && mensajeExito ? cerrarModal() : null"
      >
        <div class="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4" @click.stop>
          <div class="flex flex-col items-center justify-center space-y-4 py-10">
            <!-- Spinner durante la generación -->
            <svg v-if="generandoPDF" class="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            
            <!-- Icono de éxito cuando termina -->
            <i v-else class="fas fa-check-circle text-4xl text-emerald-600"></i>
            
            <!-- Mensajes dinámicos -->
            <p v-if="generandoPDF" class="text-gray-700 text-center">Generando el informe, por favor espera...</p>
            <p v-else class="text-gray-700 text-center">{{ mensajeExito || 'Proceso completado' }}</p>
            
            <p v-if="generandoPDF" class="text-sm text-gray-500 text-center">Esto puede tomar unos segundos.</p>
            
            <!-- Botón de cerrar solo cuando está listo -->
<!--             <button 
              v-if="!generandoPDF && mensajeExito"
              @click="cerrarModal"
              class="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition duration-200"
            >
              Cerrar
            </button> -->
          </div>
        </div>
      </div>
    </Transition>

    <div class="flex items-center gap-4 self-center">
    <button
        @click="generarPDF"
        :disabled="generandoPDF"
        :class="[
            'gap-2 px-4 py-2 rounded-lg shadow transition duration-300 flex items-center',
            generandoPDF 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        ]"
    >
        <i v-if="generandoPDF" class="fas fa-spinner fa-spin mr-1"></i>
        <i v-else class="fas fa-eye mr-1"></i>
        {{ generandoPDF ? 'Generando PDF...' : 'Ver informe' }}
    </button>

    <button
        @click="descargarPDF"
        :disabled="generandoPDF"
        :class="[
            'gap-2 px-4 py-2 rounded-lg shadow transition duration-300 flex items-center',
            generandoPDF 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
        ]"
    >
        <i v-if="generandoPDF" class="fas fa-spinner fa-spin mr-1"></i>
        <i v-else class="fas fa-download mr-1"></i>
        {{ generandoPDF ? 'Generando PDF...' : 'Descargar en alta calidad' }}
    </button>
    </div>
</template>
