/**
 * useProfile.js — Composable profil utilisateur
 * Copie fidèle de vue-app/src/composables/useProfile.ts (sans types TypeScript)
 */
import { ref } from '../../vendor/vue.js'

export function useProfile() {
  const profile = ref({
    username: 'admin',
    email: 'admin@ams.com',
    firstName: 'AMS',
    lastName: 'Administrator',
  })

  const originalProfile = ref({ ...profile.value })
  const isLoading = ref(false)
  const error = ref(null)

  const fetchProfile = async () => {
    isLoading.value = true
    try {
      await new Promise(r => setTimeout(r, 150))
      // Données simulées
      const data = { username: 'admin', email: 'admin@ams.com', firstName: 'AMS', lastName: 'Administrator' }
      profile.value = data
      originalProfile.value = { ...data }
    } catch (err) {
      console.error('Failed to fetch profile', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (payload) => {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(r => setTimeout(r, 300))
      profile.value = { ...payload }
      originalProfile.value = { ...payload }
    } catch (err) {
      console.error('Failed to update profile', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetProfile = () => {
    profile.value = { ...originalProfile.value }
    error.value = null
  }

  return { profile, originalProfile, isLoading, error, fetchProfile, updateProfile, resetProfile }
}
