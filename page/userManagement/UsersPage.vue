<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService } from '@/composables/useUser'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const users = ref([])
const loading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const search = ref('')
const status = ref('all')
const page = ref(1)
const pageSize = 5
const deleteModalOpen = ref(false)
const selectedUser = ref(null)
const navigateTo = ref(null)  // For navigating to user details

const statusItems = computed(() => [
  { label: t('userList.allStatuses'), value: 'all' },
  { label: t('userList.active'), value: 'active' },
  { label: t('userList.inactive'), value: 'inactive' },
])

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  return users.value.filter(u => {
    const matchSearch = !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)
    const matchStatus = status.value === 'all' || u.status === status.value
    return matchSearch && matchStatus
  })
})

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

const firstVisible = computed(() => filteredUsers.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1)
const lastVisible = computed(() => Math.min(page.value * pageSize, filteredUsers.value.length))

const columns = computed(() => [
  { accessorKey: 'username', header: t('userList.colUsername') },
  { accessorKey: 'email', header: t('userList.colEmail') },
  { accessorKey: 'firstName', header: t('userList.colFirstName') },
  { accessorKey: 'lastName', header: t('userList.colLastName') },
  { accessorKey: 'status', header: t('userList.colStatus') },
  { accessorKey: 'createdAt', header: t('userList.colCreatedAt') },
  { id: 'actions', header: '' }
])

const getActionItems = (user) => [
  [{ label: t('userList.editUser'), onSelect: () => viewUser(user) }],
  [{ label: t('userList.deleteUser'), onSelect: () => openDeleteModal(user) }],
]

const loadUsers = async () => {
  loading.value = true
  errorMessage.value = ''
  try { users.value = await userService.getUsers() }
  catch { errorMessage.value = 'Unable to load users.' }
  finally { loading.value = false }
}

const resetFilters = () => { search.value = ''; status.value = 'all'; page.value = 1 }

// Emit custom event to notify AppRoot to navigate to user details
const viewUser = (user) => {
  // Store user context for navigation
  sessionStorage.setItem('ams_selected_user_id', user.id)
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/UserDetailsPage' } }))
}

// Navigate to create user page
const createUser = () => {
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/CreateUserPage' } }))
}

const openDeleteModal = (user) => { selectedUser.value = user; deleteModalOpen.value = true }

const confirmDelete = async () => {
  if (!selectedUser.value) return
  deleting.value = true
  try {
    await userService.deleteUser(selectedUser.value.id)
    users.value = users.value.filter(u => u.id !== selectedUser.value?.id)
    deleteModalOpen.value = false
    selectedUser.value = null
    toast.add({ title: 'Success', description: 'User deleted successfully.', color: 'green' })
    const totalPages = Math.max(1, Math.ceil(filteredUsers.value.length / pageSize))
    if (page.value > totalPages) page.value = totalPages
  } catch { errorMessage.value = 'Unable to delete this user.' }
  finally { deleting.value = false }
}

watch([search, status], () => { page.value = 1 })
onMounted(loadUsers)
</script>

<template>
  <div class="max-w-7xl mx-auto px-2">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-[28px] text-gray-900 mb-1">{{ $t('userList.title') }}</h1>
      <p class="text-[15px] text-gray-600">{{ $t('userList.subtitle') }}</p>
    </div>

    <!-- Error Alert -->
    <UAlert v-if="errorMessage" title="Error" :description="errorMessage" color="red" variant="subtle" class="mb-6" />

    <!-- Main Content -->
    <div class="border-t border-gray-200 pt-4 space-y-6">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Filters -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" :placeholder="$t('userList.searchPlaceholder')" variant="outline" class="w-full sm:w-72" />
          <USelect v-model="status" :items="statusItems" value-key="value" variant="outline" class="w-full sm:w-44" />
          <UButton icon="i-heroicons-arrow-path-20-solid" color="gray" variant="ghost" style="color: #0066cc;" @click="resetFilters">Reset</UButton>
        </div>
        <UButton color="primary" variant="solid" style="background-color: #0066cc;" @click="createUser">+ {{ $t('userList.createUser') }}</UButton>
      </div>

      <!-- Table Card -->
      <UCard class="overflow-hidden p-0">
        <UTable :columns="columns" :data="paginatedUsers" :loading="loading">
          <template #username-cell="{ row }">
            <button type="button" class="font-medium text-[#0066cc] hover:underline" @click="viewUser(row.original)">{{ row.original.username }}</button>
          </template>
          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === 'active' ? 'green' : 'gray'" variant="subtle">
              {{ row.original.status === 'active' ? $t('userList.active') : $t('userList.inactive') }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <UDropdownMenu :items="getActionItems(row.original)" :ui="{ content: 'ring-1 ring-gray-200 border-0 shadow-md divide-y divide-gray-200', divider: 'border-gray-200' }">
                <UButton icon="i-heroicons-ellipsis-vertical-20-solid" color="gray" variant="ghost">⋮</UButton>
              </UDropdownMenu>
            </div>
          </template>
          <template #empty>
            <div class="flex flex-col items-center justify-center text-center py-6">
              <span style="font-size:2.5rem;line-height:1;margin-bottom:.75rem;color:#9ca3af;">👥</span>
              <h3 class="font-semibold text-gray-900">{{ $t('userList.noUsersFound') }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ $t('userList.noUsersMatching') }}</p>
            </div>
          </template>
        </UTable>
      </UCard>


      <!-- Pagination -->
      <div v-if="filteredUsers.length > 0" class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <p class="text-sm text-gray-600">
          {{ $t('userList.showing') }} {{ firstVisible }}–{{ lastVisible }} {{ $t('userList.of') }} {{ filteredUsers.length }} {{ $t('userList.users') }}
        </p>
        <UPagination v-model:page="page" :total="filteredUsers.length" :items-per-page="pageSize" />
      </div>
    </div>

    <!-- Delete Modal -->
    <UModal v-model:open="deleteModalOpen" :title="$t('userList.confirmDeleteTitle')">
      <template #body>
        <UAlert color="red" variant="subtle" :title="$t('userList.confirmDeleteTitle')"
          :description="selectedUser ? `Are you sure you want to delete &quot;${selectedUser.username}&quot;?` : $t('userList.confirmDeleteMessage')"
          class="bg-red-50" />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3 pt-2">
          <UButton type="button" variant="ghost" style="color: #0066cc;" :disabled="deleting" @click="deleteModalOpen = false">{{ $t('userForm.cancel') }}</UButton>
          <UButton type="button" color="red" variant="solid" :loading="deleting" @click="confirmDelete">{{ $t('userList.deleteUser') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
