import Chart from 'chart.js/auto';

export function exportarGraficaAltaResolucion(chartConfig: any, width = 1200, height = 900): string {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }

  // Clona la configuración y ajusta el tamaño
  const config = JSON.parse(JSON.stringify(chartConfig));
  config.options = config.options || {};
  config.options.responsive = false;
  config.options.animation = false;

  // Factor de escalado más conservador para evitar elementos demasiado grandes
  const scaleFactor = Math.min(width / 400, height / 300) * 0.8; // Reducido a 80% para ser más conservador

  // Escalar fuentes de datos labels (más conservador)
  if (config.options.plugins?.datalabels?.font) {
    const originalSize = config.options.plugins.datalabels.font.size || 12;
    config.options.plugins.datalabels.font.size = Math.round(originalSize * scaleFactor);
  }

  // Escalar fuentes de los ejes (más agresivo para que no queden pequeñas)
  if (config.options.scales?.x?.ticks?.font) {
    const originalSize = config.options.scales.x.ticks.font.size || 12;
    config.options.scales.x.ticks.font.size = Math.round(originalSize * scaleFactor * 1); // 0% más grande
  }
  if (config.options.scales?.y?.ticks?.font) {
    const originalSize = config.options.scales.y.ticks.font.size || 12;
    config.options.scales.y.ticks.font.size = Math.round(originalSize * scaleFactor * 1); // 0% más grande
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

  // Escalar grosor de barras si es una gráfica de barras (más conservador)
  if (config.type === 'bar' && config.options.scales?.x) {
    const originalThickness = config.options.scales.x.barThickness || 20;
    config.options.scales.x.barThickness = Math.round(originalThickness * scaleFactor * 0.8); // 20% más pequeño
  }

  // Crea la gráfica en el canvas temporal
  const tempChart = new Chart(ctx, config);

  // Exporta la imagen
  const imgData = exportCanvas.toDataURL('image/png');

  // Destruye la gráfica temporal para liberar memoria
  tempChart.destroy();

  return imgData;
} 