/**
 * useParameters.js — Composable paramètres du realm
 * Copie fidèle de vue-app/src/composables/useParameters.ts (sans types TypeScript)
 */
import { reactive, ref, watch } from '../../vendor/vue.js'
import { useToast } from './useToast.js'

export function useParameters() {
  const toast = useToast()
  const isSaving = ref(false)

  const generalForm = reactive({
    realmId: 'ams',
    displayName: 'AMS Monitoring Platform',
    htmlDisplayName: '<strong>AMS</strong> Monitoring',
    frontendUrl: 'https://ams.example.com',
    requireSsl: 'external',
    userManagedAccess: false,
    enabled: true,
  })

  const loginForm = reactive({
    userRegistration: false,
    forgotPassword: true,
    rememberMe: true,
    emailAsUsername: false,
    loginWithEmail: true,
    duplicateEmailsAllowed: false,
    verifyEmail: true,
    verifyProfile: true,
    editUsername: false,
  })

  const emailForm = reactive({
    from: 'no-reply@ams.com',
    fromDisplayName: 'AMS Platform',
    replyTo: '',
    replyToDisplayName: '',
    envelopeFrom: '',
    host: 'smtp.example.com',
    port: 587,
    enableSsl: false,
    enableStartTls: true,
    authEnabled: false,
    smtpUsername: '',
    smtpPassword: '',
  })

  const isInitiallyDark = typeof window !== 'undefined'
    ? localStorage.getItem('theme_dark_mode') === 'true' || document.documentElement.classList.contains('dark')
    : false

  const themesForm = reactive({ darkMode: isInitiallyDark })

  watch(
    () => themesForm.darkMode,
    (isDark) => {
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark)
        document.body.classList.toggle('dark', isDark)
        localStorage.setItem('theme_dark_mode', isDark ? 'true' : 'false')
      }
    },
    { immediate: true }
  )

  const localizationForm = reactive({
    internationalizationEnabled: true,
    supportedLocales: ['fr', 'en'],
    defaultLocale: 'fr',
  })

  async function saveParameters() {
    isSaving.value = true
    await new Promise((resolve) => setTimeout(resolve, 400))
    isSaving.value = false
    toast.add({ title: 'Success', description: 'Realm parameters saved successfully.', color: 'green' })
  }

  return { isSaving, generalForm, loginForm, emailForm, themesForm, localizationForm, saveParameters }
}
