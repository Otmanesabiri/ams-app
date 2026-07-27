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
const breadcrumbItems = computed(() => [
  { label: t('roleCreate.breadcrumbRealmRoles'), click: goBack },
  { label: isEditMode ? t('roleList.update') : t('roleCreate.breadcrumbCreateRole') }
])
</script>

<template>
  <div class="max-w-6xl mx-auto px-2 space-y-6">
    <!-- Breadcrumb -->
    <UBreadcrumb :items="breadcrumbItems" />

    <!-- Header -->
    <h1 class="text-2xl font-medium text-gray-900 mb-4">{{ isEditMode ? $t('roleList.update') : $t('roleCreate.title') }}</h1>

    <!-- Form Card -->
    <UCard>
      <form @submit.prevent="submit" class="space-y-6 max-w-3xl" novalidate>
        <UFormField :label="$t('roleCreate.roleName')" required :error="errors.name">
          <UInput v-model="state.name" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.name }" @input="delete errors.name" />
        </UFormField>

        <div class="flex items-center justify-between py-3 border-y border-gray-100">
          <div>
            <span class="text-sm font-medium text-gray-900">Rôle Composite</span>
            <p class="text-xs text-gray-500 mt-0.5">Un rôle composite contient d'autres sous-rôles associés.</p>
          </div>
          <USwitch v-model="state.isComposite" />
        </div>

        <UFormField :label="$t('roleCreate.description')">
          <UTextarea v-model="state.description" :rows="4" variant="outline" class="w-full" />
        </UFormField>

        <!-- Actions -->
        <div class="pt-4 flex gap-4">
          <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" :loading="isLoading">{{ $t('roleCreate.save') }}</UButton>
          <UButton type="button" variant="ghost" style="color: #0066cc;" @click="goBack">{{ $t('roleCreate.cancel') }}</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

