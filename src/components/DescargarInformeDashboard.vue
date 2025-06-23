<script setup lang="ts">
declare const pdfMake: typeof import('pdfmake/build/pdfmake');
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { exportarGraficaAltaResolucion } from '@/helpers/exportChartImage';

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
  
  // Si es solo un ref (método anterior)
  const el = graficaObj?.$el || graficaObj;
  if (el instanceof HTMLCanvasElement) {
    return el.toDataURL();
  }
  const canvas = el?.querySelector?.('canvas');
  return canvas?.toDataURL?.();
};

const generarDocDefinition = (): TDocumentDefinitions => {
    // Debug: verificar si llegan los datos del médico firmante
    console.log('Props médico firmante:', {
        titulo: props.tituloMedicoFirmante,
        nombre: props.nombreMedicoFirmante
    });

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
                                text: `Centro de trabajo: ${props.centroTrabajo}`,
                                style: 'centroTrabajo',
                                margin: [0, 0, 0, 5],
                                decorationColor: '#2563EB'
                            }] : []),
                            {
                                text: `Total de trabajadores evaluados: ${props.totalTrabajadores || 0}`,
                                style: 'totalTrabajadores',
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
                            ...(props.tituloMedicoFirmante ? [{
                                text: `Responsable del informe: ${props.tituloMedicoFirmante} ${props.nombreMedicoFirmante || ''}`,
                                style: 'medicoResponsable',
                                margin: [0, 8, 0, 0]
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

    const imagenes = {
        imc: obtenerBase64(props.refsGraficas.imc),
        aptitud: obtenerBase64(props.refsGraficas.aptitud),
        lentes: obtenerBase64(props.refsGraficas.lentes),
        corregida: obtenerBase64(props.refsGraficas.corregida),
        daltonismo: obtenerBase64(props.refsGraficas.daltonismo),
        agentes: obtenerBase64(props.refsGraficas.agentes),
        grupos: obtenerBase64(props.refsGraficas.grupos, 3000, 2000),
        cintura: obtenerBase64(props.refsGraficas.cintura),
    };

    // Debug: verificar que la imagen de grupos se genere correctamente
    console.log('Imagen grupos generada:', imagenes.grupos ? 'SÍ' : 'NO');
    if (imagenes.grupos) {
        console.log('Tamaño imagen grupos:', imagenes.grupos.length, 'caracteres');
    }

    const contenido: Content[] = [];

    // Resumen ejecutivo
    contenido.push(
        { text: 'RESUMEN EJECUTIVO', style: 'tituloSeccion' },
        {
            text: 'Este informe presenta un análisis integral del estado de salud de los trabajadores, incluyendo indicadores clave como distribución por IMC, aptitud laboral, salud visual, antecedentes médicos y exposición a factores de riesgo ocupacional.',
            style: 'textoNormal',
            margin: [0, 0, 0, 20]
        }
    );

    // Sección 1: Composición Demográfica
    if (imagenes.grupos) {
        console.log('Agregando imagen de grupos etarios al PDF con ancho 450px');
        contenido.push(
            { text: '1. COMPOSICIÓN DEMOGRÁFICA', style: 'tituloSeccion' },
            {
                text: 'Distribución de trabajadores por grupos de edad y género, permitiendo identificar la estructura demográfica de la plantilla laboral.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.grupos, 
                width: 400, 
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
    contenido.push({ text: '2. INDICADORES DE SALUD FÍSICA', style: 'tituloSeccion' });

    if (imagenes.imc) {
        contenido.push(
            { text: '2.1 Distribución por Categoría de IMC', style: 'subtituloSeccion' },
            {
                text: 'El Índice de Masa Corporal (IMC) es un indicador clave para evaluar el estado nutricional y los riesgos de salud asociados al peso corporal.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.imc, 
                width: 450, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        
        // Tabla de IMC
        if (props.tablasDatos?.imc) {
            const datosIMC = props.tablasDatos.imc
                .filter(item => item && Array.isArray(item) && item.length >= 3);
            
            if (datosIMC.length > 0) {
                const tablaIMC = crearTablaPDF(
                    datosIMC,
                    ['Categoría', 'Cantidad', 'Porcentaje'],
                    'Detalle de Distribución por IMC',
                    'imc'
                );
                tablaIMC.forEach(item => contenido.push(item));
            }
        }
    }

    if (imagenes.cintura) {
        contenido.push(
            { text: '2.2 Riesgo por Circunferencia de Cintura', style: 'subtituloSeccion' },
            {
                text: 'Indicador de grasa abdominal y riesgo metabólico asociado a enfermedades cardiovasculares.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            }
        );
        
        // Obtener datos de la gráfica de circunferencia de cintura
        const datosCintura = props.tablasDatos?.cintura;
        const altoRiesgo = datosCintura?.alto || 0;
        const bajoRiesgo = datosCintura?.chart?.datasets?.[0]?.data?.[1] || 0;
        const porcentajeAltoRiesgo = datosCintura?.porcentaje || 0;
        const totalCintura = altoRiesgo + bajoRiesgo;
        
        // Crear tabla con gráfica y datos lado a lado
        const tablaCinturaCombinada = {
            table: {
                widths: ['50%', '50%'],
                body: [
                    [
                        // Columna izquierda: Gráfica
                        {
                            image: imagenes.cintura,
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
                                        { text: 'Alto riesgo', style: 'tableCellLeftMedium' },
                                        { text: `${altoRiesgo} (${porcentajeAltoRiesgo}%)`, style: 'tableCellMedium' }
                                    ],
                                    [
                                        { text: 'Bajo riesgo', style: 'tableCellLeftMedium' },
                                        { text: `${bajoRiesgo} (${totalCintura > 0 ? Math.round((bajoRiesgo / totalCintura) * 100) : 0}%)`, style: 'tableCellMedium' }
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
        
        contenido.push(tablaCinturaCombinada);
        
        contenido.push({
            text: 'Interpretación: La gráfica muestra la distribución de trabajadores según su riesgo metabólico basado en la circunferencia de cintura. Una circunferencia elevada se asocia con mayor riesgo de diabetes, hipertensión y enfermedades cardiovasculares.',
            style: 'textoNormal',
            alignment: 'left',
            margin: [0, 0, 0, 20]
        });
    }

    // Sección 3: Salud Visual
    contenido.push({ text: '3. SALUD VISUAL', style: 'tituloSeccion' });

    if (imagenes.lentes) {
        contenido.push(
            { text: '3.1 Necesidad de Corrección Visual', style: 'subtituloSeccion' },
            {
                text: 'Proporción de trabajadores que requieren lentes para desempeñar sus actividades de manera segura.',
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
                            width: 120,
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
                                        { text: 'Requieren lentes', style: 'tableCellLeftMedium' },
                                        { text: `${requierenLentes} (${porcentajeRequieren}%)`, style: 'tableCellMedium' }
                                    ],
                                    [
                                        { text: 'No requieren', style: 'tableCellLeftMedium' },
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
        
        contenido.push({
            text: 'Interpretación: La gráfica muestra la distribución entre trabajadores que requieren corrección visual (lentes) y aquellos que no la necesitan. Los trabajadores que requieren lentes pueden tener dificultades para realizar tareas que demandan buena agudeza visual.',
            style: 'textoNormal',
            alignment: 'left',
            margin: [0, 0, 0, 20]
        });
    }

    if (imagenes.corregida) {
        contenido.push(
            { text: '3.2 Corrección Visual Implementada', style: 'subtituloSeccion' },
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
                            width: 120,
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
                                        { text: 'Usan lentes', style: 'tableCellLeftMedium' },
                                        { text: `${usanLentes} (${porcentajeUsan}%)`, style: 'tableCellMedium' }
                                    ],
                                    [
                                        { text: 'No usan lentes', style: 'tableCellLeftMedium' },
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
        
        contenido.push({
            text: 'Interpretación: Esta gráfica indica cuántos trabajadores que requieren lentes ya cuentan con corrección visual implementada. Un alto porcentaje sugiere buena adherencia a las recomendaciones médicas.',
            style: 'textoNormal',
            alignment: 'left',
            margin: [0, 0, 0, 20]
        });
    }

    if (imagenes.daltonismo) {
        contenido.push(
            { text: '3.3 Alteraciones en la Percepción de Colores', style: 'subtituloSeccion' },
            {
                text: 'Detección de daltonismo y otras alteraciones en la percepción de colores.',
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
                            width: 120,
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
                                        { text: 'Con daltonismo', style: 'tableCellLeftMedium' },
                                        { text: `${conDaltonismo} (${porcentajeDaltonismo}%)`, style: 'tableCellMedium' }
                                    ],
                                    [
                                        { text: 'Sin daltonismo', style: 'tableCellLeftMedium' },
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
        
        contenido.push({
            text: 'Interpretación: La gráfica muestra la proporción de trabajadores con alteraciones en la percepción de colores. Esta condición puede afectar la capacidad para realizar tareas que requieren distinción de colores.',
            style: 'textoNormal',
            alignment: 'left',
            margin: [0, 0, 0, 20]
        });
    }

    // Tabla de agudeza visual sin corrección
    if (props.tablasDatos?.vision) {
        const datosVision = props.tablasDatos.vision
            .filter(item => item && Array.isArray(item) && item.length >= 3);
        
        if (datosVision.length > 0) {
            const tablaVision = crearTablaPDF(
                datosVision,
                ['Categoría', 'Trabajadores', 'Porcentaje'],
                'Agudeza Visual Sin Corrección',
                'vision'
            );
            tablaVision.forEach(item => contenido.push(item));
        }
    }

    // Sección 4: Antecedentes Médicos
    contenido.push({ text: '4. ANTECEDENTES MÉDICOS', style: 'tituloSeccion' });
    contenido.push({
        text: 'Esta sección incluye información sobre antecedentes de enfermedades crónicas y problemas localizados referidos por los trabajadores durante su evaluación médica.',
        style: 'textoNormal',
        margin: [0, 0, 0, 20]
    });

    // Tabla de enfermedades crónicas
    if (props.tablasDatos?.enfermedades) {
        const datosEnfermedades = props.tablasDatos.enfermedades
            .filter(item => item && Array.isArray(item) && item.length >= 3);
        
        if (datosEnfermedades.length > 0) {
            const tablaEnfermedades = crearTablaPDF(
                datosEnfermedades,
                ['Antecedente', 'Casos', 'Porcentaje'],
                'Enfermedades Crónicas Referidas',
                'enfermedades'
            );
            tablaEnfermedades.forEach(item => contenido.push(item));
        }
    }

    // Tabla de antecedentes localizados
    if (props.tablasDatos?.antecedentes) {
        const datosAntecedentes = props.tablasDatos.antecedentes
            .filter(item => item && Array.isArray(item) && item.length >= 3);
        
        if (datosAntecedentes.length > 0) {
            const tablaAntecedentes = crearTablaPDF(
                datosAntecedentes,
                ['Antecedente', 'Casos', 'Porcentaje'],
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
                text: 'Evaluación de la exposición a agentes de riesgo en el entorno laboral que pueden afectar la salud de los trabajadores.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.agentes, 
                width: 450, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        
        // Tabla de agentes de riesgo
        if (props.tablasDatos?.agentesRiesgo) {
            const datosAgentes = props.tablasDatos.agentesRiesgo
                .filter(item => item && Array.isArray(item) && item.length >= 3);
            
            if (datosAgentes.length > 0) {
                const tablaAgentes = crearTablaPDF(
                    datosAgentes,
                    ['Agente de Riesgo', 'Expuestos', 'Porcentaje'],
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
            { text: '6. APTITUD AL PUESTO DE TRABAJO', style: 'tituloSeccion' },
            {
                text: 'Evaluación de la capacidad de los trabajadores para desempeñar sus funciones de manera segura y efectiva.',
                style: 'textoNormal',
                margin: [0, 0, 0, 10]
            },
            { 
                image: imagenes.aptitud, 
                width: 450, 
                alignment: 'center',
                margin: [0, 10, 0, 20] 
            }
        );
        
        // Tabla de aptitud
        if (props.tablasDatos?.aptitud) {
            const datosAptitud = props.tablasDatos.aptitud
                .filter(item => item && Array.isArray(item) && item.length >= 3);
            
            if (datosAptitud.length > 0) {
                const tablaAptitud = crearTablaPDF(
                    datosAptitud,
                    ['Resultado', 'Trabajadores', 'Porcentaje'],
                    'Detalle de Aptitud al Puesto',
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
                color: '#047857', // Verde oscuro
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
            centroTrabajo: { 
                fontSize: 13, 
                bold: true, 
                color: '#2563EB',
                alignment: 'left',
                decoration: 'underline',
                decorationColor: '#2563EB',
                margin: [0, 0, 0, 5]
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
                lineHeight: 1.4
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

const generarPDF = () => {
  const docDefinition = generarDocDefinition();
  pdfMake.createPdf(docDefinition).open();
};

const descargarPDF = () => {
  const docDefinition = generarDocDefinition();
  pdfMake.createPdf(docDefinition).download(`InformeSaludLaboral_${props.nombreEmpresa?.replace(/\s+/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`);
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
    const cantidad = parseInt(valor) || 0;
    
    // Primera columna siempre alineada a la izquierda
    if (columnaIndex === 0) return 'tableCellLeft';
    
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

<template>
    <div class="flex items-center gap-4 self-center">
    <button
        @click="generarPDF"
        class="gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition duration-300 flex items-center"
    >
        <i class="fas fa-eye mr-1"></i>
        Ver informe
    </button>

    <button
        @click="descargarPDF"
        class="gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow transition duration-300 flex items-center"
    >
        <i class="fas fa-download mr-1"></i>
        Descargar PDF
    </button>
    </div>
</template>
