<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const state = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  passwordConfirm: ''
})
const errors = reactive({})

const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  if (!state.username.trim()) errors.username = 'Username is required'
  if (!state.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.email = 'Invalid email format'
  if (!state.password.trim()) errors.password = 'Password is required'
  if (state.password !== state.passwordConfirm) errors.passwordConfirm = 'Passwords do not match'
  return Object.keys(errors).length === 0
}

const handleRegister = async () => {
  if (!validate()) return
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    successMessage.value = 'Registration successful! You can now log in.'
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/LoginPage' } }))
    }, 2000)
  } catch (err) {
    errorMessage.value = err.message || 'Registration failed'
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

    <!-- Register Card -->
    <UCard class="w-full">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">{{ $t('auth.registerTitle') }}</h1>

      <UAlert v-if="errorMessage" title="Error" :description="errorMessage" color="red" variant="subtle" class="bg-red-50 mb-4" />
      <UAlert v-if="successMessage" title="Success" :description="successMessage" color="green" variant="subtle" class="bg-green-50 mb-4" />

      <form @submit.prevent="handleRegister" class="space-y-5" novalidate>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField :label="$t('userForm.firstName')">
            <UInput v-model="state.firstName" variant="outline" class="w-full" />
          </UFormField>
          <UFormField :label="$t('userForm.lastName')">
            <UInput v-model="state.lastName" variant="outline" class="w-full" />
          </UFormField>
        </div>

        <UFormField :label="$t('userForm.username')" required :error="errors.username">
          <UInput v-model="state.username" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.username }" @input="delete errors.username" />
        </UFormField>

        <UFormField :label="$t('userForm.email')" required :error="errors.email">
          <UInput v-model="state.email" type="email" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.email }" @input="delete errors.email" />
        </UFormField>

        <UFormField :label="$t('auth.password')" required :error="errors.password">
          <UInput v-model="state.password" type="password" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.password }" @input="delete errors.password" />
        </UFormField>

        <UFormField :label="$t('auth.passwordConfirm')" required :error="errors.passwordConfirm">
          <UInput v-model="state.passwordConfirm" type="password" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.passwordConfirm }" @input="delete errors.passwordConfirm" />
        </UFormField>

        <div class="pt-2">
          <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" class="w-full flex justify-center py-2.5 text-sm" :loading="loading">{{ $t('auth.registerButton') }}</UButton>
        </div>
      </form>

      <div class="mt-6 text-center">
        <span class="text-sm text-gray-600">{{ $t('auth.alreadyHaveAccount') }} </span>
        <button type="button" @click="goToLogin" class="font-medium text-[#0066cc] hover:text-[#0055b3]">{{ $t('auth.signInButton') }}</button>
      </div>
    </UCard>
  </div>
</template>

