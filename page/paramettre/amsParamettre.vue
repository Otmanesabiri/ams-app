<script>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useParameters } from '@/composables/useParameters'

export default {
  name: 'AmsParamettre',
  setup() {
    const { t } = useI18n()
    const { isSaving, generalForm, loginForm, emailForm, themesForm, localizationForm, saveParameters } = useParameters()

    const activeTab = ref('general')

    const tabItems = computed(() => [
      { id: 'general', label: t('parameters.tabGeneral') },
      { id: 'login', label: t('parameters.tabLogin') },
      { id: 'email', label: t('parameters.tabEmail') },
      { id: 'themes', label: t('parameters.tabThemes') },
      { id: 'localization', label: t('parameters.tabLocalization') },
    ])

    const requireSslOptions = [
      { label: 'Aucune (None)', value: 'none' },
      { label: 'Requêtes externes (External)', value: 'external' },
      { label: 'Toutes les requêtes (All)', value: 'all' },
    ]

    const localeOptions = [
      { label: 'Français (fr)', value: 'fr' },
      { label: 'English (en)', value: 'en' },
      { label: 'Español (es)', value: 'es' },
      { label: 'Deutsch (de)', value: 'de' },
    ]

    function toggleDarkMode(val) {
      themesForm.darkMode = val
      document.documentElement.classList.toggle('dark', val)
      document.body.classList.toggle('dark', val)
      localStorage.setItem('theme_dark_mode', val ? 'true' : 'false')
    }

    function setField(form, key, val) {
      form[key] = val
    }

    return {
      t,
      isSaving, generalForm, loginForm, emailForm, themesForm, localizationForm, saveParameters,
      activeTab, tabItems, requireSslOptions, localeOptions,
      toggleDarkMode, setField,
    }
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-2 space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <h1 class="text-[28px] text-gray-900 font-medium mb-1">{{ $t('parameters.title') }}</h1>
        <p class="text-[15px] text-gray-600">{{ $t('parameters.subtitle') }}</p>
      </div>
      <UButton color="primary" variant="solid" style="background-color: #0066cc;" :loading="isSaving" @click="saveParameters">{{ $t('parameters.save') }}</UButton>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-6">
        <button v-for="tab in tabItems" :key="tab.id" type="button"
          class="pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          @click="activeTab = tab.id">{{ tab.label }}</button>
      </nav>
    </div>

    <!-- Tab Contents Card -->
    <UCard>
      <!-- GENERAL TAB -->
      <div v-if="activeTab === 'general'" class="space-y-6 max-w-3xl">
        <UFormField :label="$t('parameters.realmId')" description="Non modifiable">
          <UInput v-model="generalForm.realmId" disabled variant="outline" class="w-full bg-gray-50" />
        </UFormField>

        <UFormField :label="$t('parameters.displayName')">
          <UInput v-model="generalForm.displayName" variant="outline" class="w-full" />
        </UFormField>

        <UFormField :label="$t('parameters.htmlDisplayName')">
          <UInput v-model="generalForm.htmlDisplayName" variant="outline" class="w-full" />
        </UFormField>

        <UFormField :label="$t('parameters.frontendUrl')">
          <UInput v-model="generalForm.frontendUrl" placeholder="https://ams.example.com" variant="outline" class="w-full" />
        </UFormField>

        <UFormField :label="$t('parameters.requireSsl')">
          <USelect v-model="generalForm.requireSsl" :items="requireSslOptions" value-key="value" variant="outline" class="w-full" />
        </UFormField>

        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.userManagedAccess') }}</span>
          <USwitch v-model="generalForm.userManagedAccess" />
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.realmEnabled') }}</span>
          <USwitch v-model="generalForm.enabled" />
        </div>
      </div>

      <!-- LOGIN TAB -->
      <div v-if="activeTab === 'login'" class="space-y-4 max-w-3xl">
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.userRegistration') }}</span>
          <USwitch v-model="loginForm.userRegistration" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.forgotPassword') }}</span>
          <USwitch v-model="loginForm.forgotPassword" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.rememberMe') }}</span>
          <USwitch v-model="loginForm.rememberMe" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.emailAsUsername') }}</span>
          <USwitch v-model="loginForm.emailAsUsername" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.loginWithEmail') }}</span>
          <USwitch v-model="loginForm.loginWithEmail" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.duplicateEmails') }}</span>
          <USwitch v-model="loginForm.duplicateEmailsAllowed" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.verifyEmail') }}</span>
          <USwitch v-model="loginForm.verifyEmail" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.verifyProfile') }}</span>
          <USwitch v-model="loginForm.verifyProfile" />
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.editUsername') }}</span>
          <USwitch v-model="loginForm.editUsername" />
        </div>
      </div>

      <!-- EMAIL TAB -->
      <div v-if="activeTab === 'email'" class="space-y-6 max-w-3xl">
        <UFormField :label="$t('parameters.fromEmail')">
          <UInput v-model="emailForm.from" variant="outline" class="w-full" />
        </UFormField>
        <UFormField :label="$t('parameters.fromName')">
          <UInput v-model="emailForm.fromDisplayName" variant="outline" class="w-full" />
        </UFormField>
        <UFormField :label="$t('parameters.smtpHost')">
          <UInput v-model="emailForm.host" variant="outline" class="w-full" />
        </UFormField>
        <UFormField :label="$t('parameters.smtpPort')">
          <UInput v-model="emailForm.port" type="number" variant="outline" class="w-full" />
        </UFormField>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.enableSsl') }}</span>
          <USwitch v-model="emailForm.enableSsl" />
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.enableStartTls') }}</span>
          <USwitch v-model="emailForm.enableStartTls" />
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.smtpAuth') }}</span>
          <USwitch v-model="emailForm.authEnabled" />
        </div>
        <template v-if="emailForm.authEnabled">
          <UFormField :label="$t('parameters.smtpUsername')">
            <UInput v-model="emailForm.smtpUsername" variant="outline" class="w-full" />
          </UFormField>
          <UFormField :label="$t('parameters.smtpPassword')">
            <UInput v-model="emailForm.smtpPassword" type="password" variant="outline" class="w-full" />
          </UFormField>
        </template>
      </div>

      <!-- THEMES TAB -->
      <div v-if="activeTab === 'themes'" class="space-y-6 max-w-3xl">
        <div class="flex items-center justify-between py-2">
          <div>
            <span class="text-sm font-medium text-gray-900 block">{{ $t('parameters.darkMode') }}</span>
            <span class="text-xs text-gray-500">Active le thème sombre de l'interface</span>
          </div>
          <USwitch :modelValue="themesForm.darkMode" @update:modelValue="toggleDarkMode" />
        </div>
      </div>

      <!-- LOCALIZATION TAB -->
      <div v-if="activeTab === 'localization'" class="space-y-6 max-w-3xl">
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-900">{{ $t('parameters.enableI18n') }}</span>
          <USwitch v-model="localizationForm.internationalizationEnabled" />
        </div>
        <UFormField :label="$t('parameters.defaultLocale')">
          <USelect v-model="localizationForm.defaultLocale" :items="localeOptions" value-key="value" variant="outline" class="w-full" />
        </UFormField>
      </div>
    </UCard>
  </div>
</template>

