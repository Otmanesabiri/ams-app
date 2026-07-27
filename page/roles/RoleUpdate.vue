<script setup>
import { reactive, onMounted } from 'vue'
import { z } from 'zod'
import { useRoles } from '@/composables/useRoles'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
// Removed import type

const { t } = useI18n()
const roleId = new URLSearchParams(window.location.search).get('id') || '1'

const { getRole, updateRole, isLoading } = useRoles()
const toast = useToast()

const state = reactive({
  name: '',
  description: '',
  composite: false
})

const errors = reactive({})

const schema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
  description: z.string().optional(),
  composite: z.boolean().optional()
})

const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])

  const result = schema.safeParse(state)
  if (!result.success) {
    result.error.issues.forEach(issue => {
      const field = String(issue.path[0])
      if (!errors[field]) {
        errors[field] = issue.message
      }
    })
    return false
  }
  return true
}

onMounted(async () => {
  try {
    const role = await getRole(roleId)
    state.name = role.name || ''
    state.description = role.description || ''
    state.composite = role.isComposite || false
  } catch (e) {
    window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'roles/RoleList' } }))
  }
})

const goBack = () => {
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'roles/RoleList' } }))
}

const submit = async () => {
  if (!validate()) return

  const payload = {
    name: state.name.trim(),
    description: state.description.trim(),
    composite: state.composite
  }
  await updateRole(roleId, payload)
  toast.add({
    title: 'Success',
    description: 'Role updated successfully.',
    color: 'green'
  })
  goBack()
}

const breadcrumbItems = computed(() => [
  { label: t('roleList.title'), click: goBack },
  { label: state.name || '...' }
])
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 space-y-6">
    <!-- Breadcrumb -->
    <UBreadcrumb :items="breadcrumbItems" />

    <!-- Header Section -->
    <div class="mb-4">
      <h1 class="text-[28px] text-gray-900 font-medium">{{ $t('roleList.update') }}: {{ state.name }}</h1>
    </div>

    <!-- Form Card -->
    <UCard>
      <form @submit.prevent="submit" class="space-y-6 max-w-3xl" novalidate>
        <UFormField :label="$t('roleCreate.roleName')" required :error="errors.name">
          <UInput v-model="state.name" variant="outline" class="w-full" :class="{ 'ring-2 ring-red-500 border-red-500': errors.name }" @input="delete errors.name" />
        </UFormField>

        <UFormField :label="$t('roleCreate.description')">
          <UTextarea v-model="state.description" :rows="4" variant="outline" class="w-full" />
        </UFormField>

        <!-- Actions -->
        <div class="pt-4 flex gap-4">
          <UButton type="submit" color="primary" variant="solid" style="background-color: #0066cc;" :loading="isLoading">
            {{ $t('userForm.save') }}
          </UButton>
          <UButton type="button" variant="ghost" style="color: #0066cc;" @click="goBack">
            {{ $t('userForm.cancel') }}
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

