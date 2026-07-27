/**
 * useUser.js — Service utilisateurs (CRUD mock)
 * Copie fidèle de vue-app/src/composables/useUser.ts (sans types TypeScript)
 */

const delay = (duration = 150) => new Promise(resolve => setTimeout(resolve, duration))

const users = [
  { id: '1', username: 'admin', email: 'admin@ams.com', firstName: 'AMS', lastName: 'Administrator', status: 'active', emailVerified: true, createdAt: '2026-07-01' },
  { id: '2', username: 'nizar.afraoui', email: 'nizar.afraoui@ams.com', firstName: 'Nizar', lastName: 'Afraoui', status: 'active', emailVerified: true, createdAt: '2026-07-05' },
  { id: '3', username: 'demo.user', email: 'demo.user@ams.com', firstName: 'Demo', lastName: 'User', status: 'inactive', emailVerified: false, createdAt: '2026-07-08' },
  { id: '4', username: 'chaimaa.b', email: 'chaimaa.b@ams.com', firstName: 'Chaimaa', lastName: 'Benali', status: 'active', emailVerified: true, createdAt: '2026-07-10' },
  { id: '5', username: 'othmane.k', email: 'othmane.k@ams.com', firstName: 'Othmane', lastName: 'Kabbaj', status: 'active', emailVerified: false, createdAt: '2026-07-12' },
]

// Map for user -> roleIds array
const userRolesMap = new Map([
  ['1', ['1', '2']], // admin has default-roles-client01, offline_access
  ['2', ['2']],
])

export const userService = {
  async getUsers() {
    await delay()
    return users.map(u => ({ ...u }))
  },

  async getUserById(id) {
    await delay()
    const user = users.find(u => u.id === id)
    if (!user) throw new Error('User not found')
    return { ...user }
  },

  async createUser(payload) {
    await delay()
    const exists = users.some(u => u.username.toLowerCase() === payload.username.toLowerCase())
    if (exists) throw new Error('This username already exists.')
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      username: payload.username.trim(),
      email: payload.email.trim(),
      firstName: (payload.firstName || '').trim(),
      lastName: (payload.lastName || '').trim(),
      status: payload.enabled ? 'active' : 'inactive',
      emailVerified: payload.emailVerified || false,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    users.unshift(newUser)
    return { ...newUser }
  },

  async updateUser(id, payload) {
    await delay()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    const updated = {
      ...users[index],
      username: payload.username.trim(),
      email: payload.email.trim(),
      firstName: (payload.firstName || '').trim(),
      lastName: (payload.lastName || '').trim(),
      status: payload.enabled ? 'active' : 'inactive',
      emailVerified: payload.emailVerified || false,
    }
    users[index] = updated
    return { ...updated }
  },

  async deleteUser(id) {
    await delay()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('User not found')
    users.splice(index, 1)
  },

  async getUserRoleIds(userId) {
    await delay()
    return [...(userRolesMap.get(userId) || [])]
  },

  async assignRolesToUser(userId, roleIds) {
    await delay()
    const current = userRolesMap.get(userId) || []
    const updated = Array.from(new Set([...current, ...roleIds]))
    userRolesMap.set(userId, updated)
    return [...updated]
  },

  async unassignRoleFromUser(userId, roleId) {
    await delay()
    const current = userRolesMap.get(userId) || []
    const updated = current.filter(id => id !== roleId)
    userRolesMap.set(userId, updated)
    return [...updated]
  },

  async resetPassword(userId, passwordData) {
    await delay()
    return true
  },
}
