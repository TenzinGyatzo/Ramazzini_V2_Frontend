import { computed } from 'vue';
import { useMedicoFirmanteStore } from '@/stores/medicoFirmante';
import { useEnfermeraFirmanteStore } from '@/stores/enfermeraFirmante';
import { useTecnicoFirmanteStore } from '@/stores/tecnicoFirmante';

/**
 * Composable para obtener el firmante activo del usuario actual
 * Prioridad: Médico > Enfermera > Técnico
 * 
 * @returns Objeto con el firmante activo y su nombre formateado
 */
export function useActiveFirmante() {
  const medicoFirmanteStore = useMedicoFirmanteStore();
  const enfermeraFirmanteStore = useEnfermeraFirmanteStore();
  const tecnicoFirmanteStore = useTecnicoFirmanteStore();

  /**
   * Determina el firmante activo según prioridad
   * Prioridad: Médico > Enfermera > Técnico
   */
  const activeFirmante = computed(() => {
    // Prioridad: Médico > Enfermera > Técnico
    if (medicoFirmanteStore.medicoFirmante?.nombre) {
      return {
        type: 'medico' as const,
        firmante: medicoFirmanteStore.medicoFirmante,
      };
    }
    
    if (enfermeraFirmanteStore.enfermeraFirmante?.nombre) {
      return {
        type: 'enfermera' as const,
        firmante: enfermeraFirmanteStore.enfermeraFirmante,
      };
    }
    
    if (tecnicoFirmanteStore.tecnicoFirmante?.nombre) {
      return {
        type: 'tecnico' as const,
        firmante: tecnicoFirmanteStore.tecnicoFirmante,
      };
    }
    
    return null;
  });

  /**
   * Obtiene el nombre completo del firmante con título profesional
   * Formato: {tituloProfesional} + {nombre}
   * Ejemplo: "Dr. Juan Rodríguez" o "Enf. María García"
   */
  const firmanteDisplayName = computed(() => {
    const firmanteData = activeFirmante.value;
    
    if (!firmanteData) {
      return 'Profesional no identificado';
    }
    
    const { firmante } = firmanteData;
    const titulo = firmante.tituloProfesional || '';
    const nombre = firmante.nombre || '';
    
    // Si hay título, combinarlo con el nombre
    if (titulo && nombre) {
      return `${titulo} ${nombre}`.trim();
    }
    
    // Si solo hay nombre, retornarlo
    if (nombre) {
      return nombre;
    }
    
    return 'Profesional no identificado';
  });

  return {
    activeFirmante,
    firmanteDisplayName,
  };
}
