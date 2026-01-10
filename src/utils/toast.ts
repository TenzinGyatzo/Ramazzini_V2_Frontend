/**
 * Toast instance for use in interceptors and outside Vue components
 */
import { useToast } from 'vue-toast-notification';

let toastInstance: ReturnType<typeof useToast> | null = null;

/**
 * Get or create the global toast instance
 */
export function getToast() {
  if (!toastInstance) {
    toastInstance = useToast({
      position: 'top-right',
      duration: 5000,
    });
  }
  return toastInstance;
}

/**
 * Initialize toast instance (called from main.ts)
 */
export function initToast() {
  if (!toastInstance) {
    toastInstance = useToast({
      position: 'top-right',
      duration: 5000,
    });
  }
  return toastInstance;
}
