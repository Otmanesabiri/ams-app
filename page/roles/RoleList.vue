<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoles } from '@/composables/useRoles'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const { roles, isLoading, fetchRoles, deleteRole } = useRoles()
const toast = useToast()

onMounted(() => { fetchRoles() })

const search = ref('')

const filteredRoles = computed(() => {
  if (!search.value) return roles.value
  const query = search.value.toLowerCase()
  return roles.value.filter(role => role.name?.toLowerCase().includes(query) || role.description?.toLowerCase().includes(query))
})

const columns = computed(() => [
  { accessorKey: 'name', header: t('roleList.colRoleName') },
  { accessorKey: 'isComposite', header: t('roleList.colComposite') },
  { accessorKey: 'description', header: t('roleList.colDescription') },
  { id: 'actions' }
])

const handleDelete = async (id) => {
  await deleteRole(id)
  toast.add({ title: 'Success', description: 'Role deleted successfully.', color: 'green' })
}

const navigateToCreate = () => {
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'roles/RoleCreate' } }))
}

const navigateToRole = (id) => {
  sessionStorage.setItem('ams_selected_role_id', id)
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'roles/RoleCreate' } }))
}

const getItems = (row) => [
  [{ label: t('roleList.update'), onSelect: () => navigateToRole(row.id) }],
  [{ label: t('roleList.delete'), onSelect: () => handleDelete(row.id) }]
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-2">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-[28px] text-gray-900 mb-1">{{ $t('roleList.title') }}</h1>
      <p class="text-[15px] text-gray-600 flex items-center gap-1">
        {{ $t('roleList.subtitle') }}
        <a href="#" class="text-[#0066cc] hover:underline flex items-center">
          {{ $t('roleList.learnMore') }}
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </p>
    </div>

    <!-- Table Container -->
    <div class="border-t border-gray-200 pt-4">
      <!-- Toolbar -->
      <div class="flex items-center justify-between pb-4">
        <div class="flex items-center gap-4">
          <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" :placeholder="$t('roleList.searchPlaceholder')" variant="outline" class="w-64" />
          <UButton color="primary" variant="solid" style="background-color: #0066cc;" @click="navigateToCreate">{{ $t('roleList.createRole') }}</UButton>
          <UButton icon="i-heroicons-arrow-path-20-solid" color="white" variant="ghost" style="color: #0066cc;" @click="fetchRoles" :loading="isLoading">{{ $t('roleList.refresh') }}</UButton>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="isLoading" class="flex items-center justify-center py-12 text-gray-400 text-sm">Chargement...</div>
        <table v-else class="w-full text-left text-sm text-gray-700">
          <thead class="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th class="px-6 py-3.5">{{ $t('roleList.colRoleName') }}</th>
              <th class="px-6 py-3.5">{{ $t('roleList.colComposite') }}</th>
              <th class="px-6 py-3.5">{{ $t('roleList.colDescription') }}</th>
              <th class="px-6 py-3.5"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="filteredRoles.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-400 text-sm">Aucun rôle trouvé.</td>
            </tr>
            <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50/80 transition-colors">
              <td class="px-6 py-4">
                <button @click="navigateToRole(role.id)" class="flex items-center gap-1 text-[#0066cc] font-medium hover:underline cursor-pointer">{{ role.name }}</button>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ role.isComposite ? $t('roleList.true') : $t('roleList.false') }}</td>
              <td class="px-6 py-4 text-gray-500 text-xs">{{ role.description }}</td>
              <td class="px-6 py-4">
                <div class="flex justify-end">
                  <UDropdownMenu :items="getItems(role)" :ui="{ content: 'ring-1 ring-gray-200 border-0 shadow-md divide-y divide-gray-200', divider: 'border-gray-200' }">
                    <UButton color="gray" variant="ghost">⋮</UButton>
                  </UDropdownMenu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
