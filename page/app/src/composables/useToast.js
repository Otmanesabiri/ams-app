/**
 * useToast.js — Composable global de notifications (toast)
 * Copie fidèle de vue-app/src/composables/useToast.ts (sans types TypeScript)
 */
import { ref } from '../../vendor/vue.js'

const toasts = ref([])

export function useToast() {
  const add = (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    toasts.value.push(newToast)
    setTimeout(() => {
      remove(id)
    }, 4000)
  }

  const remove = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, add, remove }
}
