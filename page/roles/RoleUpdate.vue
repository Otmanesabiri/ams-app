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

const errors = reactive<Record<string, string>>({})

const schema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
  description: z.string().optional(),
  composite: z.boolean().optional()
})

const validate = (): boolean => {
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

const submit = async () => {
  if (!validate()) {
    return
  }

  const payload: RolePayload = {
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
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'roles/RoleList' } }))
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-2">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="text-sm text-gray-500 mb-2">
        <a href="#" @click.prevent="window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'roles/RoleList' } }))" class="hover:underline text-[#0066cc]">{{ $t('roleList.title') }}</a>
        <span class="mx-2">&gt;</span>
        <span class="font-medium text-gray-900">{{ state.name || '...' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <h1 class="text-[28px] text-gray-900 font-medium">{{ $t('roleList.update') }}: {{ state.name }}</h1>
      </div>
    </div>

    <!-- Form Section -->
    <div class="border-t border-gray-200 pt-8 mt-2">
      <form @submit.prevent="submit" class="space-y-8" novalidate>
        <!-- Role name -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0">
          <label class="w-64 text-sm font-medium text-gray-700 pt-2">
            {{ $t('roleCreate.roleName') }} <span class="text-red-500 ml-1 text-xs">*</span>
          </label>
          <div class="flex-1 max-w-3xl">
            <UInput 
              v-model="state.name" 
              variant="outline"
              class="w-full"
              :class="{ 'ring-2 ring-red-500 border-red-500': errors.name }"
              @input="delete errors.name"
            />
            <p v-if="errors.name" class="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ errors.name }}
            </p>
          </div>
        </div>

        <!-- Description -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0">
          <label class="w-64 text-sm font-medium text-gray-700 pt-2">
            {{ $t('roleCreate.description') }}
          </label>
          <div class="flex-1 max-w-3xl">
            <UTextarea 
              v-model="state.description" 
              :rows="4"
              variant="outline"
              class="w-full"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex gap-4">
          <UButton 
            type="submit" 
            color="primary"
            variant="solid"
            style="background-color: #0066cc;"
            :loading="isLoading"
          >
            {{ $t('userForm.save') }}
          </UButton>
          <UButton 
            to="/admin/roles"
            variant="ghost"
            style="color: #0066cc;"
          >
            {{ $t('userForm.cancel') }}
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
