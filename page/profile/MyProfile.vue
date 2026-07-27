<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfile } from '@/composables/useProfile'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { profile, isLoading, error, fetchProfile, updateProfile, resetProfile } = useProfile()
const toast = useToast()
const successMessage = ref('')

onMounted(() => { fetchProfile() })

const saveProfile = async () => {
  successMessage.value = ''
  try {
    await updateProfile(profile.value)
    toast.add({ title: 'Success', description: 'Your profile has been updated successfully.', color: 'green' })
  } catch (err) {
    // Error is managed by useProfile
  }
}

const cancelChanges = () => {
  resetProfile()
  successMessage.value = ''
}
</script>

<template>
  <div class="max-w-4xl pt-2">
    <!-- Header Area -->
    <div class="mb-10">
      <h1 class="text-3xl font-normal text-gray-900 mb-2">{{ $t('profile.title') }}</h1>
      <p class="text-[15px] text-gray-600">{{ $t('profile.subtitle') }}</p>
    </div>

    <!-- Feedback Alerts -->
    <div class="mb-6">
      <UAlert v-if="successMessage" title="Success" :description="successMessage" color="green" variant="subtle" class="bg-green-50 mb-3" />
      <UAlert v-if="error" title="Error" :description="error" color="red" variant="subtle" class="bg-red-50" />
    </div>

    <!-- Form Section Card -->
    <UCard>
      <div class="max-w-2xl">
        <h2 class="text-xl font-medium text-gray-900 mb-6">{{ $t('profile.general') }}</h2>
        
        <div v-if="isLoading" class="flex items-center justify-center py-12 text-gray-400">
          <span style="display:inline-block;animation:spin 1s linear infinite;width:2rem;height:2rem;border:3px solid #e5e7eb;border-top-color:#0066cc;border-radius:50%;"></span>
        </div>
        
        <form v-else @submit.prevent="saveProfile" class="space-y-6">
          <UFormField :label="$t('profile.username')">
            <UInput v-model="profile.username" variant="outline" class="w-full" />
          </UFormField>

          <UFormField :label="$t('profile.email')">
            <UInput v-model="profile.email" type="email" variant="outline" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField :label="$t('profile.firstName')">
              <UInput v-model="profile.firstName" variant="outline" class="w-full" />
            </UFormField>

            <UFormField :label="$t('profile.lastName')">
              <UInput v-model="profile.lastName" variant="outline" class="w-full" />
            </UFormField>
          </div>

          <div class="flex gap-4 pt-4">
            <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" :loading="isLoading">{{ $t('profile.save') }}</UButton>
            <UButton type="button" variant="ghost" style="color: #0066cc;" @click="cancelChanges">{{ $t('profile.cancel') }}</UButton>
          </div>
        </form>
      </div>
    </UCard>
  </div>
</template>

