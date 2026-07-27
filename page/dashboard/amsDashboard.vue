<script setup>
import { computed } from 'vue'
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

const eventColumns = computed(() => [
  { accessorKey: 'realm', header: t('dashboard.colRealm') },
  { accessorKey: 'event', header: t('dashboard.colEvent') },
  { accessorKey: 'user', header: t('dashboard.colUser') },
  { accessorKey: 'date', header: t('dashboard.colDate') },
  { accessorKey: 'status', header: t('dashboard.colStatus') }
])
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
      <UCard 
        v-for="kpi in kpis" 
        :key="kpi.key" 
        class="border-l-4"
        :style="{ borderLeftColor: kpi.accent }"
      >
        <div class="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
          <span class="w-3 h-3 rounded-full inline-block" :style="{ background: kpi.accent }"></span>
          <span>{{ $t(`dashboard.${kpi.key}`) }}</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ kpi.value }}</div>
      </UCard>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activity Line Chart -->
      <UCard class="lg:col-span-2 flex flex-col justify-between">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div class="flex items-center gap-2 text-gray-900 font-medium text-base">
            <span class="w-4 h-4 rounded" style="background:#0066cc;opacity:.8;"></span>
            <span>{{ $t('dashboard.realmActivity') }}</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <UButton v-for="m in metricOptions" :key="m.key" type="button"
                :variant="selectedMetric === m.key ? 'solid' : 'ghost'"
                :color="selectedMetric === m.key ? 'primary' : 'gray'"
                style="border-radius: 0;"
                class="text-xs"
                @click="selectedMetric = m.key">{{ m.label }}</UButton>
            </div>
            <div class="flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <UButton v-for="r in rangeOptions" :key="r.key" type="button"
                :variant="selectedRange === r.key ? 'solid' : 'ghost'"
                :color="selectedRange === r.key ? 'primary' : 'gray'"
                style="border-radius: 0;"
                class="text-xs"
                @click="selectedRange = r.key">{{ r.label }}</UButton>
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
      </UCard>

      <!-- Provider Status Donut Chart -->
      <UCard class="flex flex-col justify-between">
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
      </UCard>
    </div>

    <!-- Recent Events Table Section -->
    <UCard class="p-0 overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-gray-900 font-medium text-base">
            <span style="font-size:16px;">🕐</span>
            <span>{{ $t('dashboard.recentEvents') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <UButton variant="outline" color="gray" size="sm" @click="exportEvents">{{ $t('dashboard.export') }}</UButton>
            <UButton size="sm" color="primary" variant="solid" style="background-color: #0066cc;">{{ $t('dashboard.viewAll') }}</UButton>
          </div>
        </div>
      </template>

      <UTable :columns="eventColumns" :data="recentEvents">
        <template #realm-cell="{ row }">
          <span class="font-medium text-gray-900">{{ row.original.realm }}</span>
        </template>
        <template #event-cell="{ row }">
          <span class="font-mono text-xs text-gray-800">{{ row.original.event }}</span>
        </template>
        <template #user-cell="{ row }">
          <span class="text-[#0066cc] font-medium">{{ row.original.user }}</span>
        </template>
        <template #date-cell="{ row }">
          <span class="text-gray-500 text-xs">{{ row.original.date }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'success' ? 'green' : 'red'" variant="subtle">
            {{ row.original.status === 'success' ? 'Success' : 'Error' }}
          </UBadge>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

