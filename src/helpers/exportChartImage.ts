import Chart from 'chart.js/auto';

export function exportarGraficaAltaResolucion(chartConfig: any, width = 1200, height = 900): string {
  const exportCanvas = document.createElement('canvas');
  
  // Calcular aspect ratio basado en el tipo de gráfica
  let aspectRatio;
  if (chartConfig.type === 'doughnut' || chartConfig.type === 'pie') {
    // Para gráficas circulares, mantener proporción cuadrada
    aspectRatio = 1;
  } else if (chartConfig.type === 'bar') {
    // Para gráficas de barras, usar proporción más ancha
    aspectRatio = 1.5; // 3:2 ratio
  } else {
    // Para otros tipos, usar proporción estándar
    aspectRatio = 1.33; // 4:3 ratio
  }
  
  // Calcular dimensiones manteniendo aspect ratio
  let finalWidth, finalHeight;
  if (width && height) {
    // Si se proporcionan dimensiones específicas, usarlas
    finalWidth = width;
    finalHeight = height;
  } else {
    // Calcular dimensiones basadas en aspect ratio
    const baseSize = 1200;
    finalWidth = baseSize;
    finalHeight = Math.round(baseSize / aspectRatio);
  }
  
  exportCanvas.width = finalWidth;
  exportCanvas.height = finalHeight;
  const ctx = exportCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }

  // Clona la configuración y ajusta el tamaño
  const config = JSON.parse(JSON.stringify(chartConfig));
  config.options = config.options || {};
  config.options.responsive = false;
  config.options.maintainAspectRatio = false; // Importante para controlar el aspect ratio
  config.options.animation = false;

  // Factor de escalado optimizado según el tipo de gráfica
  let scaleFactor;
  if (config.type === 'doughnut' || config.type === 'pie') {
    // Para gráficas de anillo y pastel, usar un factor más conservador para mantener proporciones
    scaleFactor = Math.min(finalWidth / 400, finalHeight / 400) * 2.0;
  } else {
    // Para gráficas de barras, usar factor estándar
    scaleFactor = Math.min(finalWidth / 400, finalHeight / 300) * 0.8;
  }

  // Escalar fuentes de datos labels
  if (config.options.plugins?.datalabels?.font) {
    const originalSize = config.options.plugins.datalabels.font.size || 12;
    config.options.plugins.datalabels.font.size = Math.round(originalSize * scaleFactor);
  }

  // Escalar fuentes de los ejes (solo para gráficas que los tengan)
  if (config.options.scales?.x?.ticks?.font) {
    const originalSize = config.options.scales.x.ticks.font.size || 12;
    config.options.scales.x.ticks.font.size = Math.round(originalSize * scaleFactor * 1); // 0% más grande
  }
  if (config.options.scales?.y?.ticks?.font) {
    const originalSize = config.options.scales.y.ticks.font.size || 12;
    config.options.scales.y.ticks.font.size = Math.round(originalSize * scaleFactor * 1); // 0% más grande
  }

  // Hacer las líneas de los ejes más visibles (solo ejes principales, sin cuadrícula)
  if (config.options.scales?.x?.grid) {
    config.options.scales.x.grid.display = false; // Desactivar cuadrícula
  }
  if (config.options.scales?.y?.grid) {
    config.options.scales.y.grid.display = false; // Desactivar cuadrícula
  }

  // Elegir color de ejes según calidad
  const esCalidadNormal = finalWidth <= 1000;
  const ejeWidth = esCalidadNormal ? 1 : 3;

  if (config.options.scales?.x) {
    config.options.scales.x.border = {
      display: true,
      color: '#374151',
      width: ejeWidth
    };
    config.options.scales.x.ticks = config.options.scales.x.ticks || {};
    config.options.scales.x.ticks.color = '#374151';
  }
  if (config.options.scales?.y) {
    config.options.scales.y.border = {
      display: true,
      color: '#374151',
      width: ejeWidth
    };
    config.options.scales.y.ticks = config.options.scales.y.ticks || {};
    config.options.scales.y.ticks.color = '#374151';
  }

  // Escalar padding para mantener proporciones
  if (config.options.layout?.padding) {
    const originalPadding = config.options.layout.padding;
    if (typeof originalPadding === 'object') {
      config.options.layout.padding = {
        top: Math.round((originalPadding.top || 0) * scaleFactor),
        right: Math.round((originalPadding.right || 0) * scaleFactor),
        bottom: Math.round((originalPadding.bottom || 0) * scaleFactor),
        left: Math.round((originalPadding.left || 0) * scaleFactor)
      };
    }
  }

  // Escalar padding de los ticks de los ejes para igualar separación visual
  if (config.options.scales?.x?.ticks) {
    const originalTickPadding = config.options.scales.x.ticks.padding ?? 6;
    config.options.scales.x.ticks.padding = Math.round(originalTickPadding * scaleFactor);
  }
  if (config.options.scales?.y?.ticks) {
    const originalTickPadding = config.options.scales.y.ticks.padding ?? 6;
    config.options.scales.y.ticks.padding = Math.round(originalTickPadding * scaleFactor);
  }

  // Configuraciones específicas por tipo de gráfica
  if (config.type === 'bar') {
    // Escalar grosor de barras
    if (config.options.scales?.x) {
      const originalThickness = config.options.scales.x.barThickness || 20;
      config.options.scales.x.barThickness = Math.round(originalThickness * scaleFactor * 0.8);
    }
  } else if (config.type === 'doughnut') {
    // Para gráficas de anillo, ajustar el cutout proporcionalmente
    if (config.options.cutout) {
      const originalCutout = config.options.cutout;
      if (typeof originalCutout === 'string' && originalCutout.includes('%')) {
        // Mantener el porcentaje pero ajustar el tamaño del anillo
        const percentage = parseInt(originalCutout);
        config.options.cutout = `${Math.max(50, Math.min(80, percentage))}%`;
      }
    }
  }

  // Crea la gráfica en el canvas temporal
  const tempChart = new Chart(ctx, config);

  // Exporta la imagen con máxima calidad
  const imgData = exportCanvas.toDataURL('image/png', 1.0);

  // Destruye la gráfica temporal para liberar memoria
  tempChart.destroy();

  return imgData;
} 