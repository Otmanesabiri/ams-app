<script setup>
import { useI18n } from 'vue-i18n'
import { useDashboard } from '@/composables/useDashboard'

const { t } = useI18n()
const {
  realm,
  kpis,
  selectedMetric,
  selectedRange,
  chartPath,
  providerStatus,
  donutGradient,
  recentEvents,
  exportEvents,
} = useDashboard()

const metricOptions = [
  { key: 'connections', label: t('dashboard.connections') },
  { key: 'errors', label: t('dashboard.errors') },
]

const rangeOptions = [
  { key: 'day', label: t('dashboard.day') },
  { key: 'week', label: t('dashboard.week') },
  { key: 'month', label: t('dashboard.month') },
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-2 space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-[28px] text-gray-900 font-medium mb-1">{{ $t('dashboard.title') }}</h1>
        <p class="text-[15px] text-gray-600">
          {{ realm.displayName }} · realm <span class="font-semibold text-gray-800">{{ realm.name }}</span>
        </p>
      </div>
      <UBadge :color="realm.enabled ? 'green' : 'red'" variant="subtle">
        {{ realm.enabled ? $t('dashboard.enabled') : 'Disabled' }}
      </UBadge>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div 
        v-for="kpi in kpis" 
        :key="kpi.key" 
        class="bg-white rounded-lg border border-gray-200 p-5 shadow-sm border-l-4"
        :style="{ borderLeftColor: kpi.accent }"
      >
        <div class="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
          <span class="w-3 h-3 rounded-full inline-block" :style="{ background: kpi.accent }"></span>
          <span>{{ $t(`dashboard.${kpi.key}`) }}</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ kpi.value }}</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activity Line Chart -->
      <div class="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div class="flex items-center gap-2 text-gray-900 font-medium text-base">
            <span class="w-4 h-4 rounded" style="background:#0066cc;opacity:.8;"></span>
            <span>{{ $t('dashboard.realmActivity') }}</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <button v-for="m in metricOptions" :key="m.key" type="button"
                class="px-3 py-1 text-xs font-medium transition-colors"
                :class="selectedMetric === m.key ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                @click="selectedMetric = m.key">{{ m.label }}</button>
            </div>
            <div class="flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <button v-for="r in rangeOptions" :key="r.key" type="button"
                class="px-3 py-1 text-xs font-medium transition-colors"
                :class="selectedRange === r.key ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                @click="selectedRange = r.key">{{ r.label }}</button>
            </div>
          </div>
        </div>
        <div class="relative w-full h-48 py-2">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-full">
            <path :d="chartPath" fill="none" stroke="#0066cc" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span class="w-2.5 h-2.5 rounded-full bg-[#0066cc] inline-block"></span>
          <span>{{ selectedMetric === 'connections' ? $t('dashboard.connections') : $t('dashboard.errors') }}</span>
        </div>
      </div>

      <!-- Provider Status Donut Chart -->
      <div class="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-2 text-gray-900 font-medium text-base mb-4 pb-3 border-b border-gray-100">
          <span class="w-4 h-4 rounded-full" style="background:#0066cc;opacity:.7;"></span>
          <span>{{ $t('dashboard.providerStatus') }}</span>
        </div>
        <div class="flex flex-col items-center justify-center my-2 gap-4">
          <div class="w-36 h-36 rounded-full" :style="{ background: donutGradient, mask: 'radial-gradient(farthest-side, transparent calc(100% - 22px), #000 calc(100% - 22px))', WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 22px), #000 calc(100% - 22px))' }" />
          <div class="w-full space-y-2 pt-2">
            <div v-for="s in providerStatus" :key="s.key" class="flex items-center justify-between text-xs text-gray-600">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ background: s.color }" />
                <span>{{ $t(`dashboard.${s.key}`) }}</span>
              </div>
              <span class="font-semibold text-gray-900">{{ s.value }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Events Table Section -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div class="flex items-center gap-2 text-gray-900 font-medium text-base">
          <span style="font-size:16px;">🕐</span>
          <span>{{ $t('dashboard.recentEvents') }}</span>
        </div>
        <div class="flex items-center gap-3">
          <UButton variant="outline" color="gray" size="sm" @click="exportEvents">{{ $t('dashboard.export') }}</UButton>
          <UButton size="sm" color="primary" variant="solid" style="background-color: #0066cc;">{{ $t('dashboard.viewAll') }}</UButton>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-700">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th class="px-6 py-3">{{ $t('dashboard.colRealm') }}</th>
              <th class="px-6 py-3">{{ $t('dashboard.colEvent') }}</th>
              <th class="px-6 py-3">{{ $t('dashboard.colUser') }}</th>
              <th class="px-6 py-3">{{ $t('dashboard.colDate') }}</th>
              <th class="px-6 py-3">{{ $t('dashboard.colStatus') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(e, i) in recentEvents" :key="i" class="hover:bg-gray-50/80 transition-colors">
              <td class="px-6 py-3.5 font-medium text-gray-900">{{ e.realm }}</td>
              <td class="px-6 py-3.5 font-mono text-xs text-gray-800">{{ e.event }}</td>
              <td class="px-6 py-3.5 text-[#0066cc] font-medium">{{ e.user }}</td>
              <td class="px-6 py-3.5 text-gray-500 text-xs">{{ e.date }}</td>
              <td class="px-6 py-3.5">
                <UBadge :color="e.status === 'success' ? 'green' : 'red'" variant="subtle">
                  {{ e.status === 'success' ? 'Success' : 'Error' }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
