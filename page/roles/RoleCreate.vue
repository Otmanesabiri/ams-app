<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoles } from '@/composables/useRoles'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { createRole, getRole, updateRole, isLoading } = useRoles()
const toast = useToast()

const roleId = sessionStorage.getItem('ams_selected_role_id')
const isEditMode = !!roleId

const state = reactive({ name: '', description: '', isComposite: false })
const errors = reactive({})

onMounted(async () => {
  if (isEditMode) {
    try {
      const role = await getRole(roleId)
      state.name = role.name
      state.description = role.description || ''
      state.isComposite = !!role.isComposite
    } catch (e) {
      console.error('Failed to load role', e)
    }
  }
})

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!state.name.trim()) errors.name = 'Role name is required'
  return Object.keys(errors).length === 0
}

const goBack = () => {
  sessionStorage.removeItem('ams_selected_role_id')
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'roles/RoleList' } }))
}

const submit = async () => {
  if (!validate()) return
  const payload = { name: state.name.trim(), description: state.description.trim(), isComposite: state.isComposite }
  try {
    if (isEditMode) {
      await updateRole(roleId, payload)
      toast.add({ title: 'Success', description: 'Role updated successfully.', color: 'green' })
    } else {
      await createRole(payload)
      toast.add({ title: 'Success', description: 'Role created successfully.', color: 'green' })
    }
    goBack()
  } catch (e) {
    toast.add({ title: 'Error', description: 'Operation failed.', color: 'red' })
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-2">
    <!-- Breadcrumb -->
    <nav class="text-sm text-gray-600 mb-4 flex items-center">
      <button @click="goBack" class="text-[#0066cc] hover:underline">{{ $t('roleCreate.breadcrumbRealmRoles') }}</button>
      <span class="mx-2 text-gray-400">
        <svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </span>
      <span>{{ isEditMode ? $t('roleList.update') : $t('roleCreate.breadcrumbCreateRole') }}</span>
    </nav>

    <!-- Header -->
    <h1 class="text-2xl font-medium text-gray-900 mb-4">{{ isEditMode ? $t('roleList.update') : $t('roleCreate.title') }}</h1>

    <!-- Form Section -->
    <div class="border-t border-gray-200 pt-8 mt-2">
      <form @submit.prevent="submit" class="space-y-8" novalidate>
        <!-- Role name -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0">
          <label class="w-64 text-[14px] font-bold text-gray-900 flex items-center pt-2">
            {{ $t('roleCreate.roleName') }} <span class="text-red-500 ml-1 text-xs">*</span>
          </label>
          <div class="flex-1 max-w-3xl">
            <UInput v-model="state.name" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.name }" @input="delete errors.name" />
            <p v-if="errors.name" class="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ errors.name }}
            </p>
          </div>
        </div>

        <!-- Composite Role toggle -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
          <label class="w-64 text-[14px] font-bold text-gray-900">Rôle Composite</label>
          <div class="flex-1 max-w-3xl flex items-center gap-3">
            <USwitch v-model="state.isComposite" />
            <span class="text-xs text-gray-500">Un rôle composite contient d'autres sous-rôles associés.</span>
          </div>
        </div>

        <!-- Description -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0">
          <label class="w-64 text-[14px] font-bold text-gray-900 pt-2">{{ $t('roleCreate.description') }}</label>
          <div class="flex-1 max-w-3xl">
            <UTextarea v-model="state.description" :rows="4" variant="outline" class="w-full" />
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex gap-4">
          <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" :loading="isLoading">{{ $t('roleCreate.save') }}</UButton>
          <UButton type="button" variant="ghost" style="color: #0066cc;" @click="goBack">{{ $t('roleCreate.cancel') }}</UButton>
        </div>
      </form>
    </div>
  </div>
</template>
