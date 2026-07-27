/**
 * useDashboard.js — Composable dashboard KPIs, charts, events
 * Copie fidèle de vue-app/src/composables/useDashboard.ts (sans types TypeScript)
 */
import { computed, reactive, ref } from '../../vendor/vue.js'
import { useToast } from './useToast.js'

export function useDashboard() {
  const toast = useToast()

  const realm = reactive({
    name: 'ams',
    displayName: 'AMS Monitoring Platform',
    enabled: true,
    baseUrl: 'https://ams.example.com',
  })

  const kpis = computed(() => [
    { key: 'activeRealms', value: '4', icon: 'i-heroicons-arrow-trending-up', accent: '#0066cc' },
    { key: 'availabilityRate', value: '99.98 %', icon: 'i-heroicons-check-circle', accent: '#16a34a' },
    { key: 'activeSessions', value: '128', icon: 'i-heroicons-user-group', accent: '#7c3aed' },
  ])

  const selectedMetric = ref('connections')
  const selectedRange = ref('day')

  const chartPoints = [
    { x: 0, y: 10 }, { x: 20, y: 15 }, { x: 40, y: 35 },
    { x: 60, y: 28 }, { x: 80, y: 55 }, { x: 100, y: 48 },
  ]

  const chartPath = computed(() =>
    chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`).join(' ')
  )

  const providerStatus = [
    { key: 'active', value: 82, color: '#0066cc' },
    { key: 'error', value: 6, color: '#f97316' },
    { key: 'disabled', value: 12, color: '#94a3b8' },
  ]

  const donutGradient = computed(() => {
    let acc = 0
    const stops = providerStatus.map((s) => {
      const start = acc
      acc += s.value
      return `${s.color} ${start}% ${acc}%`
    })
    return `conic-gradient(${stops.join(', ')})`
  })

  const recentEvents = ref([
    { realm: 'ams', event: 'LOGIN', user: 'chaimaa.b', date: '22/07/2026 10:58', status: 'success' },
    { realm: 'ams', event: 'UPDATE_PROFILE', user: 'othmane.k', date: '22/07/2026 10:41', status: 'success' },
    { realm: 'ams', event: 'LOGIN_ERROR', user: 'unknown', date: '22/07/2026 10:22', status: 'error' },
    { realm: 'ams', event: 'REGISTER', user: 'nizar.m', date: '22/07/2026 09:57', status: 'success' },
  ])

  function exportEvents() {
    const headers = ['Realm', 'Event', 'User', 'Date', 'Status']
    const rows = recentEvents.value.map((e) => [e.realm, e.event, e.user, e.date, e.status])
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `events-${realm.name}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.add({ title: 'Success', description: 'Events exported to CSV successfully.', color: 'green' })
  }

  return { realm, kpis, selectedMetric, selectedRange, chartPath, providerStatus, donutGradient, recentEvents, exportEvents }
}
