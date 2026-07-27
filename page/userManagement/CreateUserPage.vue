<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService } from '@/composables/useUser'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  enabled: true,
  emailVerified: false,
})

const errors = reactive({})

const goBack = () => {
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/UsersPage' } }))
}

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.username.trim()) errors.username = 'Username is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format'
  return Object.keys(errors).length === 0
}

const submit = async () => {
  if (!validate()) return
  saving.value = true
  errorMessage.value = ''
  try {
    const newUser = await userService.createUser({ ...form })
    toast.add({ title: 'Success', description: 'User created successfully.', color: 'green' })
    sessionStorage.setItem('ams_selected_user_id', newUser.id)
    window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/UserDetailsPage' } }))
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Unable to create the user.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-2 space-y-6">
    <!-- Breadcrumb -->
    <div class="text-sm text-gray-500">
      <button @click="goBack" class="hover:underline text-[#0066cc]">{{ $t('userList.title') }}</button>
      <span class="mx-2">›</span>
      <span class="font-medium text-gray-900">{{ $t('userForm.titleCreate') }}</span>
    </div>

    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ $t('userForm.titleCreate') }}</h1>
      <p class="text-sm text-gray-500">{{ $t('userForm.subtitleCreate') }}</p>
    </div>

    <!-- Error Alert -->
    <UAlert v-if="errorMessage" title="Error" :description="errorMessage" color="red" variant="subtle" class="bg-red-50" />

    <!-- Form -->
    <div class="border-t border-gray-200 pt-8">
      <div>
        <h2 class="text-base font-semibold text-gray-900 mb-1">{{ $t('userForm.generalInfo') }}</h2>
        <p class="text-sm text-gray-500 mb-6">{{ $t('userForm.generalInfoSubtitle') }}</p>

        <form @submit.prevent="submit" class="space-y-5 max-w-2xl">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <label class="w-48 text-sm font-medium text-gray-700 shrink-0">{{ $t('userForm.username') }} <span class="text-red-500">*</span></label>
            <div class="flex-1">
              <UInput v-model="form.username" :placeholder="$t('userForm.enterUsername')" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500': errors.username }" @input="delete errors.username" />
              <p v-if="errors.username" class="text-xs text-red-600 mt-1">{{ errors.username }}</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <label class="w-48 text-sm font-medium text-gray-700 shrink-0">{{ $t('userForm.email') }} <span class="text-red-500">*</span></label>
            <div class="flex-1">
              <UInput v-model="form.email" type="email" :placeholder="$t('userForm.enterEmail')" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500': errors.email }" @input="delete errors.email" />
              <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <label class="w-48 text-sm font-medium text-gray-700 shrink-0">{{ $t('userForm.firstName') }}</label>
            <UInput v-model="form.firstName" :placeholder="$t('userForm.enterFirstName')" variant="outline" class="flex-1" />
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <label class="w-48 text-sm font-medium text-gray-700 shrink-0">{{ $t('userForm.lastName') }}</label>
            <UInput v-model="form.lastName" :placeholder="$t('userForm.enterLastName')" variant="outline" class="flex-1" />
          </div>
          <div class="flex items-center justify-between py-3 border-y border-gray-100">
            <div>
              <span class="text-sm font-medium text-gray-900">{{ $t('userForm.userEnabled') }}</span>
              <p class="text-xs text-gray-500 mt-0.5">{{ $t('userForm.userEnabledDesc') }}</p>
            </div>
            <USwitch v-model="form.enabled" />
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <span class="text-sm font-medium text-gray-900">{{ $t('userForm.emailVerified') }}</span>
              <p class="text-xs text-gray-500 mt-0.5">{{ $t('userForm.emailVerifiedDesc') }}</p>
            </div>
            <USwitch v-model="form.emailVerified" />
          </div>

          <div class="flex gap-4 pt-4">
            <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" :loading="saving">{{ $t('userForm.save') }}</UButton>
            <UButton type="button" variant="ghost" style="color: #0066cc;" @click="goBack">{{ $t('userForm.cancel') }}</UButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
