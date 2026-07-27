/**
 * useRoles.js — Composable gestion des rôles (avec mock de données)
 * Copie fidèle de vue-app/src/composables/useRoles.ts (sans types TypeScript)
 * Note: remplace les appels API fetch par des mocks locaux pour compatibilité No-Build
 */
import { ref } from '../../vendor/vue.js'

const mockRoles = [
  { id: '1', name: 'default-roles-client01', isComposite: true, description: '${role_default-roles}' },
  { id: '2', name: 'offline_access', isComposite: false, description: '${role_offline-access}' },
  { id: '3', name: 'uma_authorization', isComposite: false, description: '${role_uma_authorization}' },
]

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms))

export function useRoles() {
  const roles = ref([])
  const isLoading = ref(false)

  const fetchRoles = async () => {
    isLoading.value = true
    try {
      await delay()
      roles.value = mockRoles.map(r => ({ ...r }))
    } catch (error) {
      console.error('Failed to fetch roles', error)
    } finally {
      isLoading.value = false
    }
  }

  const createRole = async (payload) => {
    await delay()
    const newRole = {
      id: Math.random().toString(36).substring(2, 9),
      name: payload.name.trim(),
      isComposite: !!payload.isComposite,
      description: payload.description || ''
    }
    mockRoles.unshift(newRole)
  }

  const deleteRole = async (id) => {
    isLoading.value = true
    try {
      await delay()
      const idx = mockRoles.findIndex(r => r.id === id)
      if (idx !== -1) mockRoles.splice(idx, 1)
      await fetchRoles()
    } catch (error) {
      console.error('Failed to delete role', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getRole = async (id) => {
    await delay()
    const role = mockRoles.find(r => r.id === id)
    if (!role) throw new Error('Role not found')
    return { ...role }
  }

  const updateRole = async (id, payload) => {
    isLoading.value = true
    try {
      await delay()
      const idx = mockRoles.findIndex(r => r.id === id)
      if (idx !== -1) {
        mockRoles[idx] = { ...mockRoles[idx], name: payload.name, description: payload.description, isComposite: !!payload.isComposite }
      }
      await fetchRoles()
    } catch (error) {
      console.error('Failed to update role', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return { roles, isLoading, fetchRoles, createRole, deleteRole, getRole, updateRole }
}
