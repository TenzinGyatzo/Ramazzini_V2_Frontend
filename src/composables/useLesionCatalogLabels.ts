/**
 * Composable para resolver etiquetas de catálogos de lesión (sitio ocurrencia, área anatómica).
 * Carga catálogos bajo demanda y los cachea para reutilización en listas de documentos.
 */
import { ref, shallowRef } from 'vue';
import CatalogsAPI from '@/api/CatalogsAPI';
import { CatalogType } from '@/interfaces/catalogos.interface';

// Cache compartido entre instancias (singleton)
const sitioMap = shallowRef<Record<number, string>>({});
const areaMap = shallowRef<Record<number, string>>({});
let loadPromise: Promise<void> | null = null;

const INTENCIONALIDAD_LABELS: Record<number, string> = {
  1: 'Accidental',
  2: 'Violencia familiar',
  3: 'Violencia no familiar',
  4: 'Autoinfligido',
  11: 'Trata de personas',
};

export function useLesionCatalogLabels() {
  const isLoading = ref(false);

  async function loadIfNeeded() {
    if (Object.keys(sitioMap.value).length > 0 && Object.keys(areaMap.value).length > 0) {
      return;
    }
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      isLoading.value = true;
      try {
        const [sitioRes, areaRes] = await Promise.all([
          CatalogsAPI.listCatalog(CatalogType.SITIO_OCURRENCIA),
          CatalogsAPI.listCatalog(CatalogType.AREA_ANATOMICA),
        ]);
        const sitio: Record<number, string> = {};
        (sitioRes.data || []).forEach((e: { code: string | number; description?: string }) => {
          const code = Number(e.code);
          if (!Number.isNaN(code)) {
            sitio[code] = `${e.code} - ${(e.description || '').trim()}`;
          }
        });
        const area: Record<number, string> = {};
        (areaRes.data || []).forEach((e: { code: string | number; description?: string }) => {
          const code = Number(e.code);
          if (!Number.isNaN(code)) {
            area[code] = `${e.code} - ${(e.description || '').trim().toUpperCase()}`;
          }
        });
        sitioMap.value = sitio;
        areaMap.value = area;
      } catch (err) {
        console.error('Error cargando catálogos de lesión:', err);
      } finally {
        isLoading.value = false;
      }
    })();

    return loadPromise;
  }

  function getSitioLabel(code: number | string | null | undefined): string {
    if (code == null || code === '') return '';
    const n = Number(code);
    if (Number.isNaN(n)) return String(code);
    return sitioMap.value[n] ?? String(code);
  }

  function getAreaLabel(code: number | string | null | undefined): string {
    if (code == null || code === '') return '';
    const n = Number(code);
    if (Number.isNaN(n)) return String(code);
    return areaMap.value[n] ?? String(code);
  }

  function getIntencionalidadLabel(code: number | string | null | undefined): string {
    if (code == null || code === '') return '';
    const n = Number(code);
    if (Number.isNaN(n)) return String(code);
    return INTENCIONALIDAD_LABELS[n] ?? String(code);
  }

  return {
    loadIfNeeded,
    getSitioLabel,
    getAreaLabel,
    getIntencionalidadLabel,
    isLoading,
  };
}
