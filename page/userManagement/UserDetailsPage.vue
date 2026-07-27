<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService } from '@/composables/useUser'
import { useRoles } from '@/composables/useRoles'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()
const { roles: allRoles, fetchRoles } = useRoles()

const user = ref(null)
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const deleteModalOpen = ref(false)

const activeTab = ref('details')

// Roles tab state
const assignedRoleIds = ref([])
const roleModalOpen = ref(false)
const selectedRoleIdsToAssign = ref([])
const assigningRoles = ref(false)

// Password reset state
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
  temporary: true
})
const resettingPassword = ref(false)

const userId = sessionStorage.getItem('ams_selected_user_id')

const goBack = () => {
  sessionStorage.removeItem('ams_selected_user_id')
  window.dispatchEvent(new CustomEvent('ams:navigate', { detail: { page: 'userManagement/UsersPage' } }))
}

const loadUser = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    user.value = await userService.getUserById(userId)
    await loadUserRoles()
  } catch {
    errorMessage.value = 'Unable to load this user.'
  } finally {
    loading.value = false
  }
}

const loadUserRoles = async () => {
  try {
    await fetchRoles()
    assignedRoleIds.value = await userService.getUserRoleIds(userId)
  } catch (e) {
    console.error('Failed to load user roles', e)
  }
}

const assignedRolesList = computed(() => {
  return allRoles.value.filter(r => assignedRoleIds.value.includes(r.id))
})

const unassignedRolesList = computed(() => {
  return allRoles.value.filter(r => !assignedRoleIds.value.includes(r.id))
})

const openAssignRolesModal = () => {
  selectedRoleIdsToAssign.value = []
  roleModalOpen.value = true
}

const handleAssignRoles = async () => {
  if (selectedRoleIdsToAssign.value.length === 0) return
  assigningRoles.value = true
  try {
    assignedRoleIds.value = await userService.assignRolesToUser(userId, selectedRoleIdsToAssign.value)
    toast.add({ title: 'Succès', description: 'Rôles assignés avec succès.', color: 'green' })
    roleModalOpen.value = false
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible d\'assigner les rôles.', color: 'red' })
  } finally {
    assigningRoles.value = false
  }
}

const handleUnassignRole = async (roleId) => {
  try {
    assignedRoleIds.value = await userService.unassignRoleFromUser(userId, roleId)
    toast.add({ title: 'Succès', description: 'Rôle retiré avec succès.', color: 'green' })
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Impossible de retirer le rôle.', color: 'red' })
  }
}

const handleResetPassword = async () => {
  if (!passwordForm.newPassword) {
    toast.add({ title: 'Erreur', description: 'Le mot de passe ne peut pas être vide.', color: 'red' })
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.add({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', color: 'red' })
    return
  }
  resettingPassword.value = true
  try {
    await userService.resetPassword(userId, passwordForm)
    toast.add({ title: 'Succès', description: 'Mot de passe réinitialisé avec succès.', color: 'green' })
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e) {
    toast.add({ title: 'Erreur', description: 'Échec de la réinitialisation.', color: 'red' })
  } finally {
    resettingPassword.value = false
  }
}

const saveUser = async () => {
  if (!user.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    user.value = await userService.updateUser(userId, {
      username: user.value.username,
      email: user.value.email,
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      enabled: user.value.status === 'active',
      emailVerified: user.value.emailVerified,
    })
    toast.add({ title: 'Succès', description: 'Utilisateur mis à jour avec succès.', color: 'green' })
    goBack()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Unable to update the user.'
  } finally {
    saving.value = false
  }
}

const deleteUser = async () => {
  if (!user.value) return
  deleting.value = true
  try {
    await userService.deleteUser(user.value.id)
    toast.add({ title: 'Succès', description: 'Utilisateur supprimé avec succès.', color: 'green' })
  } catch {
    errorMessage.value = 'Unable to delete the user.'
    deleteModalOpen.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(loadUser)

const breadcrumbItems = computed(() => [
  { label: t('userList.title'), click: goBack },
  { label: user.value?.username || '...' }
])

const roleColumns = [
  { accessorKey: 'name', header: 'Nom du rôle' },
  { accessorKey: 'isComposite', header: 'Composite' },
  { accessorKey: 'description', header: 'Description' },
  { id: 'actions', header: '' }
]
</script>


<template>
  <div class="max-w-7xl mx-auto px-2 space-y-6">
    <!-- Header -->
    <div>
      <UBreadcrumb :items="breadcrumbItems" />
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-[28px] text-gray-900 font-medium leading-tight">{{ user?.username }}</h1>
          <p class="text-xs text-gray-500 mt-0.5">ID : {{ user?.id }} • Créé le {{ user?.createdAt || 'N/A' }}</p>
        </div>
        <UButton v-if="user" color="red" variant="soft" @click="deleteModalOpen = true" class="flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          <span>{{ $t('userList.deleteUser') }}</span>
        </UButton>
      </div>
    </div>

    <!-- Alerts -->
    <UAlert v-if="errorMessage" title="Erreur" :description="errorMessage" color="red" variant="subtle" class="bg-red-50" />

    <!-- Loading -->
    <div v-if="loading" class="flex min-h-64 items-center justify-center py-12">
      <span style="display:inline-block;animation:spin 1s linear infinite;width:2rem;height:2rem;border:3px solid #e5e7eb;border-top-color:#0066cc;border-radius:50%;"></span>
    </div>

    <!-- Main Content with Keycloak Tabs -->
    <div v-else-if="user" class="space-y-6">
      <!-- Tabs Navigation Bar (Keycloak Style) -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8">
          <button 
            type="button"
            class="pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            :class="activeTab === 'details' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            @click="activeTab = 'details'"
          >
            Détails
          </button>
          <button 
            type="button"
            class="pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2"
            :class="activeTab === 'roles' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            @click="activeTab = 'roles'"
          >
            <span>Mapping des Rôles</span>
            <UBadge color="blue" variant="soft" class="text-xs">{{ assignedRoleIds.length }}</UBadge>
          </button>
          <button 
            type="button"
            class="pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            :class="activeTab === 'credentials' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            @click="activeTab = 'credentials'"
          >
            Identifiants (Mot de passe)
          </button>
          <button 
            type="button"
            class="pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            :class="activeTab === 'groups' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            @click="activeTab = 'groups'"
          >
            Groupes
          </button>
        </nav>
      </div>

      <!-- TAB 1: DETAILS -->
      <UCard v-if="activeTab === 'details'">
        <h2 class="text-base font-semibold text-gray-900 mb-1">{{ $t('userForm.generalInfo') }}</h2>
        <p class="text-sm text-gray-500 mb-6">{{ $t('userForm.generalInfoSubtitle') }}</p>
        <div class="space-y-5 max-w-2xl">
          <UFormField :label="$t('userForm.username')" required>
            <UInput v-model="user.username" :placeholder="$t('userForm.enterUsername')" variant="outline" class="w-full" />
          </UFormField>
          <UFormField :label="$t('userForm.email')" required>
            <UInput v-model="user.email" type="email" :placeholder="$t('userForm.enterEmail')" variant="outline" class="w-full" />
          </UFormField>
          <UFormField :label="$t('userForm.firstName')">
            <UInput v-model="user.firstName" :placeholder="$t('userForm.enterFirstName')" variant="outline" class="w-full" />
          </UFormField>
          <UFormField :label="$t('userForm.lastName')">
            <UInput v-model="user.lastName" :placeholder="$t('userForm.enterLastName')" variant="outline" class="w-full" />
          </UFormField>
          <div class="flex items-center justify-between py-3 border-y border-gray-100">
            <div>
              <span class="text-sm font-medium text-gray-900">{{ $t('userForm.userEnabled') }}</span>
              <p class="text-xs text-gray-500 mt-0.5">{{ $t('userForm.userEnabledDesc') }}</p>
            </div>
            <USwitch v-model="user.status" :model-value="user.status === 'active'" @update:modelValue="v => user.status = v ? 'active' : 'inactive'" />
          </div>
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <span class="text-sm font-medium text-gray-900">{{ $t('userForm.emailVerified') }}</span>
              <p class="text-xs text-gray-500 mt-0.5">{{ $t('userForm.emailVerifiedDesc') }}</p>
            </div>
            <USwitch v-model="user.emailVerified" />
          </div>
        </div>

        <div class="flex gap-4 pt-6">
          <UButton color="primary" variant="solid" style="background-color: #0066cc;" :loading="saving" @click="saveUser">{{ $t('userForm.save') }}</UButton>
          <UButton variant="ghost" style="color: #0066cc;" @click="goBack">{{ $t('userForm.cancel') }}</UButton>
        </div>
      </UCard>

      <!-- TAB 2: ROLE MAPPING (Keycloak Style) -->
      <UCard v-if="activeTab === 'roles'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 class="text-base font-semibold text-gray-900 mb-1">Rôles attribués à l'utilisateur</h2>
            <p class="text-sm text-gray-500">Gérez les rôles Keycloak / Realm associés au compte de cet utilisateur.</p>
          </div>
          <UButton color="primary" variant="solid" style="background-color: #0066cc;" @click="openAssignRolesModal">
            + Assigner des rôles
          </UButton>
        </div>

        <!-- Assigned Roles Table -->
        <UTable v-if="assignedRolesList.length > 0" :columns="roleColumns" :data="assignedRolesList" class="border border-gray-200 rounded-lg">
          <template #name-cell="{ row }">
            <span class="font-medium text-gray-900">{{ row.original.name }}</span>
          </template>
          <template #isComposite-cell="{ row }">
            <UBadge :color="row.original.isComposite ? 'blue' : 'gray'" variant="soft" class="text-xs">
              {{ row.original.isComposite ? 'Vrai' : 'Faux' }}
            </UBadge>
          </template>
          <template #description-cell="{ row }">
            <span class="text-gray-500 text-xs">{{ row.original.description || '—' }}</span>
          </template>
          <template #actions-cell="{ row }">
            <div class="text-right">
              <UButton color="red" variant="ghost" size="xs" @click="handleUnassignRole(row.original.id)">
                Retirer
              </UButton>
            </div>
          </template>
        </UTable>

        <div v-else class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
          <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          <p class="text-sm font-medium text-gray-600">Aucun rôle n'est actuellement assigné à cet utilisateur.</p>
          <p class="text-xs text-gray-400 mt-1">Cliquez sur le bouton ci-dessus pour attribuer un ou plusieurs rôles.</p>
        </div>
      </UCard>

      <!-- TAB 3: CREDENTIALS -->
      <UCard v-if="activeTab === 'credentials'" class="space-y-6 max-w-3xl">
        <div>
          <h2 class="text-base font-semibold text-gray-900 mb-1">Réinitialisation du mot de passe</h2>
          <p class="text-sm text-gray-500">Définissez un nouveau mot de passe pour le compte utilisateur.</p>
        </div>

        <div class="space-y-5">
          <UFormField label="Nouveau mot de passe">
            <UInput v-model="passwordForm.newPassword" type="password" placeholder="Saisir le nouveau mot de passe" variant="outline" class="w-full" />
          </UFormField>
          <UFormField label="Confirmer le mot de passe">
            <UInput v-model="passwordForm.confirmPassword" type="password" placeholder="Confirmer le mot de passe" variant="outline" class="w-full" />
          </UFormField>
          <div class="flex items-center justify-between py-3 border-y border-gray-100">
            <div>
              <span class="text-sm font-medium text-gray-900">Mot de passe temporaire</span>
              <p class="text-xs text-gray-500 mt-0.5">Exige de l'utilisateur qu'il modifie son mot de passe lors de sa prochaine connexion.</p>
            </div>
            <USwitch v-model="passwordForm.temporary" />
          </div>

          <div class="pt-2">
            <UButton color="primary" variant="solid" style="background-color: #0066cc;" :loading="resettingPassword" @click="handleResetPassword">
              Réinitialiser le mot de passe
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- TAB 4: GROUPS -->
      <UCard v-if="activeTab === 'groups'" class="space-y-6">
        <div>
          <h2 class="text-base font-semibold text-gray-900 mb-1">Appartenance aux groupes</h2>
          <p class="text-sm text-gray-500">Gérez les groupes Keycloak auxquels cet utilisateur appartient.</p>
        </div>

        <div class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
          <p class="text-sm font-medium text-gray-600">Aucun groupe associé pour le moment.</p>
        </div>
      </UCard>
    </div>

    <!-- Modal Assigner des Rôles -->
    <UModal v-model:open="roleModalOpen" title="Assigner des rôles à l'utilisateur">
      <template #body>
        <div class="space-y-4 max-h-80 overflow-y-auto pr-1">
          <p class="text-xs text-gray-500">Cochez les rôles que vous souhaitez attribuer à cet utilisateur :</p>
          
          <div v-if="unassignedRolesList.length > 0" class="space-y-2">
            <label 
              v-for="role in unassignedRolesList" 
              :key="role.id" 
              class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  :value="role.id" 
                  v-model="selectedRoleIdsToAssign"
                  class="w-4 h-4 text-[#0066cc] rounded border-gray-300 focus:ring-[#0066cc]"
                />
                <div>
                  <span class="text-sm font-semibold text-gray-900 block">{{ role.name }}</span>
                  <span class="text-xs text-gray-500 block" v-if="role.description">{{ role.description }}</span>
                </div>
              </div>
              <UBadge :color="role.isComposite ? 'blue' : 'gray'" variant="soft" class="text-xs">
                {{ role.isComposite ? 'Composite' : 'Standard' }}
              </UBadge>
            </label>
          </div>

          <div v-else class="text-center py-6 text-sm text-gray-500">
            Tous les rôles disponibles sont déjà assignés à cet utilisateur.
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3 pt-2">
          <UButton variant="ghost" style="color: #0066cc;" @click="roleModalOpen = false">Annuler</UButton>
          <UButton color="primary" variant="solid" style="background-color: #0066cc;" :disabled="selectedRoleIdsToAssign.length === 0" :loading="assigningRoles" @click="handleAssignRoles">
            Assigner les rôles sélectionnés
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model:open="deleteModalOpen" :title="$t('userList.confirmDeleteTitle')">
      <template #body>
        <UAlert color="red" variant="subtle" :title="$t('userList.confirmDeleteTitle')"
          :description="user ? `Êtes-vous sûr de vouloir supprimer l'utilisateur &quot;${user.username}&quot; ?` : $t('userList.confirmDeleteMessage')"
          class="bg-red-50" />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3 pt-2">
          <UButton variant="ghost" style="color: #0066cc;" :disabled="deleting" @click="deleteModalOpen = false">{{ $t('userForm.cancel') }}</UButton>
          <UButton color="red" variant="solid" :loading="deleting" @click="deleteUser">{{ $t('userList.deleteUser') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

