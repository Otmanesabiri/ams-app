<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const email = ref('')
const error = ref('')
const success = ref(false)

const handleReset = async () => {
  error.value = ''
  if (!email.value.trim()) {
    error.value = t('auth.emailRequired') || 'Email is required'
    return
  }
  
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    success.value = true
  } catch (err) {
    error.value = 'Failed to send reset link.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/LoginPage' } }))
}
</script>

<template>
  <div class="w-full">
    <!-- Header Logo -->
    <a href="#" @click.prevent="goToLogin" class="mb-8 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity">
      <div class="w-10 h-10 bg-[#0066cc] rounded-md flex items-center justify-center text-white font-bold text-xl">K</div>
      <span class="text-2xl font-bold text-gray-900 tracking-tight">AMS S2M</span>
    </a>

    <!-- Forgot Password Card -->
    <UCard class="w-full">
      <h1 class="text-2xl font-semibold text-gray-900 mb-1">{{ $t('auth.forgotPassword') }}</h1>
      <p class="text-sm text-gray-500 mb-6">{{ $t('auth.forgotPasswordDesc') }}</p>

      <UAlert v-if="error" title="Error" :description="error" color="red" variant="subtle" class="bg-red-50 mb-6" />
      
      <div v-if="success" class="text-center py-4">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('auth.resetLinkSent') }}</h3>
        <p class="text-sm text-gray-500 mb-6">{{ $t('auth.resetLinkSentDesc') }}</p>
        <UButton type="button" color="primary" variant="solid" style="background-color: #0066cc;" class="w-full justify-center" @click="goToLogin">{{ $t('auth.returnToLogin') }}</UButton>
      </div>

      <form v-else @submit.prevent="handleReset" class="space-y-6">
        <UFormField :label="$t('auth.emailAddress')" required :error="error">
          <UInput v-model="email" type="email" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': error }" @input="error = ''" />
        </UFormField>

        <div>
          <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" class="w-full flex justify-center py-2.5 text-sm" :loading="loading">{{ $t('auth.sendResetLink') }}</UButton>
        </div>
      </form>

      <div v-if="!success" class="mt-6 text-center">
        <button type="button" @click="goToLogin" class="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1 mx-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ $t('auth.backToLogin') }}
        </button>
      </div>
    </UCard>
  </div>
</template>

