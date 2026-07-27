<script setup>
import { reactive, ref } from 'vue'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const errorMessage = ref('')

const state = reactive({
  username: '',
  password: ''
})
const errors = reactive({})

const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  if (!state.username.trim()) errors.username = t('auth.username') + ' is required'
  if (!state.password.trim()) errors.password = t('auth.password') + ' is required'
  return Object.keys(errors).length === 0
}

const handleLogin = async () => {
  if (!validate()) return
  loading.value = true
  errorMessage.value = ''
  try {
    await new Promise(resolve => setTimeout(resolve, 600))
    window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'dashboard/amsDashboard' } }))
  } catch (err) {
    errorMessage.value = err.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/RegisterPage' } }))
}

const goToForgot = () => {
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'forgotPassword/ForgotPasswordPage' } }))
}
const rememberMe = ref(false)
</script>

<template>
  <div class="w-full">
    <!-- Header Logo -->
    <a href="#" @click.prevent="window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'dashboard/amsDashboard' } }))" class="mb-8 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity">
      <div class="w-10 h-10 bg-[#0066cc] rounded-md flex items-center justify-center text-white font-bold text-xl">K</div>
      <span class="text-2xl font-bold text-gray-900 tracking-tight">AMS S2M</span>
    </a>

    <!-- Login Card -->
    <UCard class="w-full">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">{{ $t('auth.signInTitle') }}</h1>

      <UAlert v-if="errorMessage" title="Error" :description="errorMessage" color="red" variant="subtle" class="bg-red-50 mb-6" />

      <form @submit.prevent="handleLogin" class="space-y-6" novalidate>
        <UFormField :label="$t('auth.username')" required :error="errors.username">
          <UInput v-model="state.username" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.username }" autocomplete="username" @input="delete errors.username" />
        </UFormField>

        <UFormField :label="$t('auth.password')" required :error="errors.password">
          <UInput v-model="state.password" type="password" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.password }" autocomplete="current-password" @input="delete errors.password" />
        </UFormField>

        <div class="flex items-center justify-between">
          <UCheckbox v-model="rememberMe" :label="$t('auth.rememberMe')" />
          <div class="text-sm">
            <button type="button" @click="goToForgot" class="font-medium text-[#0066cc] hover:text-[#0055b3]">{{ $t('auth.forgotPassword') }}</button>
          </div>
        </div>

        <div>
          <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" class="w-full flex justify-center py-2.5 text-sm" :loading="loading">{{ $t('auth.signInButton') }}</UButton>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div>
          <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-500">{{ $t('auth.newToAms') }}</span></div>
        </div>
        <div class="mt-6 text-center">
          <button type="button" @click="goToRegister" class="font-medium text-[#0066cc] hover:text-[#0055b3]">{{ $t('auth.registerNow') }}</button>
        </div>
      </div>
    </UCard>
  </div>
</template>

