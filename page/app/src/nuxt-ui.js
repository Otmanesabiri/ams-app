/**
 * nuxt-ui.js
 * 
 * Module de compatibilité Nuxt UI pour le runtime PayOS (No-Build).
 * Exporte les composants Nuxt UI sous forme de composants Vue 3 compatibles ESM
 * pour satisfaire les instructions `import { UButton, UBadge, ... } from '@nuxt/ui'`
 * dans les SFC .vue compilés par vue3-sfc-loader.
 */
import * as Vue from "../vendor/vue.js";

export const UButton = {
  name: "UButton",
  props: ["color", "variant", "icon", "size", "type", "loading", "block"],
  emits: ["click"],
  template: `
    <button 
      :type="type || 'button'" 
      :class="[
        'px-3.5 py-2 text-xs font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap',
        block ? 'w-full' : '',
        color === 'primary' || !color ? 'bg-[#0066cc] text-white hover:bg-[#0055b3]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      ]" 
      @click="$emit('click', $event)"
    >
      <span v-if="loading" class="animate-spin inline-block mr-1">⏳</span>
      <slot />
    </button>
  `
};

export const UBadge = {
  name: "UBadge",
  props: ["color", "variant"],
  template: `
    <span :class="[
      'px-2.5 py-0.5 text-xs font-bold rounded-full inline-block',
      color === 'green' || color === 'emerald' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
      color === 'red' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
    ]">
      <slot />
    </span>
  `
};

export const UIcon = {
  name: "UIcon",
  props: ["name"],
  template: `<span class="inline-block text-current">✨</span>`
};

export const UAlert = {
  name: "UAlert",
  props: ["title", "description", "color", "variant", "icon"],
  template: `
    <div class="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm">
      <h4 class="font-bold" v-if="title">{{ title }}</h4>
      <p v-if="description">{{ description }}</p>
    </div>
  `
};

export const UInput = {
  name: "UInput",
  props: ["modelValue", "type", "placeholder", "autocomplete", "disabled"],
  emits: ["update:modelValue", "input"],
  template: `
    <input 
      :type="type || 'text'" 
      :placeholder="placeholder" 
      :value="modelValue" 
      :autocomplete="autocomplete"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc]" 
      :style="{ backgroundColor: disabled ? '#f9fafb' : '#ffffff', color: disabled ? '#6b7280' : '#111827' }"
      @input="$emit('update:modelValue', $event.target.value); $emit('input', $event)" 
    />
  `
};


export const USwitch = {
  name: "USwitch",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template: `
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      @click="$emit('update:modelValue', !modelValue)"
      :style="{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '44px',
        height: '24px',
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        backgroundColor: modelValue ? '#0066cc' : '#d1d5db',
        flexShrink: '0',
        padding: '0',
        outline: 'none',
      }"
    >
      <span
        :style="{
          display: 'inline-block',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease',
          transform: modelValue ? 'translateX(22px)' : 'translateX(3px)',
          pointerEvents: 'none',
        }"
      ></span>
    </button>
  `
};

export const UTable = {
  name: "UTable",
  props: ["data", "rows", "columns", "loading"],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-gray-700">
        <thead class="bg-gray-50 text-xs font-bold text-gray-900 border-b border-gray-200">
          <tr>
            <th v-for="col in columns" :key="col.accessorKey || col.id" class="px-6 py-3.5">
              {{ col.header || col.accessorKey || '' }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(row, idx) in (data || rows || [])" :key="idx" class="hover:bg-gray-50/80 transition-colors">
            <td v-for="col in columns" :key="col.accessorKey || col.id" class="px-6 py-4">
              <slot :name="(col.accessorKey || col.id) + '-cell'" :row="{ original: row, id: row.id }">
                {{ row[col.accessorKey] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
};

export const UDropdownMenu = {
  name: "UDropdownMenu",
  props: ["items"],
  data() {
    return { open: false };
  },
  template: `
    <div class="relative inline-block text-left">
      <div @click="open = !open">
        <slot />
      </div>
      <div v-if="open" @mouseleave="open = false" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100">
        <div v-for="(group, gIdx) in (items || [])" :key="gIdx" class="py-1">
          <button 
            v-for="(item, iIdx) in group" 
            :key="iIdx"
            class="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
            @click="if (item.onSelect) item.onSelect(); open = false;"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>
  `
};

export const UCheckbox = {
  name: "UCheckbox",
  props: ["modelValue", "label", "disabled"],
  emits: ["update:modelValue"],
  template: `
    <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-900 select-none">
      <input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit('update:modelValue', $event.target.checked)" class="w-4 h-4 text-[#0066cc] rounded border-gray-300 focus:ring-[#0066cc]" />
      <span v-if="label">{{ label }}</span>
    </label>
  `
};

export const UBreadcrumb = {
  name: "UBreadcrumb",
  props: ["items"],
  template: `
    <nav class="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
      <template v-for="(item, idx) in (items || [])" :key="idx">
        <button v-if="item.click || item.onSelect" type="button" @click="item.click ? item.click() : item.onSelect()" class="hover:underline text-[#0066cc] font-medium">
          {{ item.label }}
        </button>
        <span v-else class="font-medium text-gray-900">{{ item.label }}</span>
        <span v-if="idx < (items.length - 1)" class="text-gray-400">›</span>
      </template>
    </nav>
  `
};

export default {
  UButton,
  UBadge,
  UIcon,
  UAlert,
  UInput,
  USwitch,
  UTable,
  UDropdownMenu,
  UCheckbox,
  UBreadcrumb
};

