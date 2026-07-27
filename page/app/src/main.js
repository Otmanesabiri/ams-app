/**
 * main.js
 *
 * Bootstrap de l'application. Remplace ce que Nuxt faisait automatiquement :
 *  - plugins/runtime.client.ts     → createRuntime() + app.provide('runtime', …)
 *  - plugins/custom-link.client.ts → app.component('CustomLink', …)
 *  - plugins/directives.client.ts  → app.directive('click-outside', …)
 *  - .nuxt (bootstrap Nuxt + Vite)  → createApp(...).mount('#app') classique
 *
 * Depuis la conversion d'AppMenu/AppRoot/CustomLink en véritables fichiers
 * .vue, ce fichier est aussi responsable de leur chargement à la volée via
 * vue3-sfc-loader — la seule pièce qui fait ici office de "compilateur SFC",
 * mais entièrement côté navigateur, sans étape de build ni node.js.
 *
 * Aucune étape de build : ce fichier est chargé tel quel par le navigateur
 * via <script type="module" src="./app/src/main.js"> dans page/index.html.
 */
import * as Vue from "../vendor/vue.js";
import { loadModule } from "../vendor/vue3-sfc-loader.esm.js";
import * as RuntimeModule from "./runtime.js";
import * as ConfigModule from "./config.js";
import * as NuxtUIModule from "./nuxt-ui.js";
import * as I18nModule from "./i18n.js";
import * as UseToastModule from "./composables/useToast.js";
import * as UseDashboardModule from "./composables/useDashboard.js";
import * as UseUserModule from "./composables/useUser.js";
import * as UseRolesModule from "./composables/useRoles.js";
import * as UseProfileModule from "./composables/useProfile.js";
import * as UseParametersModule from "./composables/useParameters.js";
import { createRuntime } from "./runtime.js";
import { clickOutside } from "./directives/click-outside.js";

// Options partagées par tous les .vue chargés à la volée (AppRoot, AppMenu -
// importé depuis AppRoot -, CustomLink). Doivent être partagées entre tous
// les appels à loadModule() pour garantir une seule instance de Vue et un
// cache de modules cohérent (cf. FAQ de vue3-sfc-loader).
const sfcOptions = {
  // Garantit que `import ... from 'vue'` dans le <script> d'un .vue résout
  // vers CETTE instance de Vue (celle utilisée par createApp ci-dessous) —
  // indispensable : deux instances de Vue distinctes ne peuvent pas
  // partager la même réactivité / le même arbre de composants.
  //
  // "app-runtime" / "app-config" : vue3-sfc-loader (embarque babel/postcss)
  // ne sait pas parser un .js externe qui utilise `import`/`export` — c'est
  // une limitation connue de la bibliothèque (voir
  // github.com/FranckFreiburger/vue3-sfc-loader/issues/14). runtime.js et
  // config.js sont donc importés ici normalement (ES module natif, comme
  // avant), puis exposés aux .vue via moduleCache sous un nom stable —
  // exactement le même principe que pour 'vue'.
  moduleCache: {
    vue: Vue,
    "app-runtime": RuntimeModule,
    "app-config": ConfigModule,
    "@nuxt/ui": NuxtUIModule,
    "vue-i18n": I18nModule,
    "zod": { z: { object: () => ({ safeParse: (v) => ({ success: true, data: v }), shape: {} }), string: () => ({ trim: () => ({ min: (n, msg) => ({ safeParse: (v) => ({ success: v && v.trim().length >= n, error: { issues: [{ path: ['field'], message: msg }] } }) }), regex: () => ({ safeParse: (v) => ({ success: !!v, error: { issues: [] } }) }) }) }), boolean: () => ({ optional: () => ({}) }), optional: () => ({}) } },
    "@/composables/useToast": UseToastModule,
    "@/composables/useDashboard": UseDashboardModule,
    "@/composables/useUser": UseUserModule,
    "@/composables/useRoles": UseRolesModule,
    "@/composables/useProfile": UseProfileModule,
    "@/composables/useParameters": UseParametersModule,
  },

  // Résout un import relatif ("./components/AppMenu.vue", "../runtime.js", …)
  // depuis un .vue déjà chargé. Le résolveur par défaut de vue3-sfc-loader
  // traite refPath/relPath comme de simples chemins POSIX (path.join +
  // normalize) : il ne comprend pas le "://" d'une URL absolue et le
  // réduit à un simple "/", ce qui corrompt "http://host/…" en
  // "http:/host/…". fetch() (via `new URL(str, documentBaseURL)`) réinterprète
  // alors ce "http:/host/…" comme relatif à la page courante et duplique le
  // host dans le path (ex. ".../localhost:8081/vue-app/page/..."), provoquant
  // un 500 "Bad resource type" côté backend. On utilise ici l'API URL native
  // du navigateur — correcte vis-à-vis du spec — exactement comme le fait déjà
  // ce fichier plus bas pour AppRoot.vue/CustomLink.vue.
  pathResolve({ refPath, relPath }) {
    // Si c'est un composable enregistré dans le cache, on retourne le nom exact
    // pour que vue3-sfc-loader utilise le moduleCache au lieu de faire un fetch
    if (relPath.startsWith('@/composables/')) {
      return relPath;
    }
    // Handle @/ alias → resolve to the app/src base directory
    if (relPath.startsWith('@/')) {
      const base = new URL('./app/src/', window.location.origin + '/ams-app/page/').href;
      return base + relPath.slice(2);
    }
    if (refPath === undefined || relPath.charAt(0) !== ".") {
      return relPath;
    }
    return new URL(relPath, new URL(refPath, window.location.origin)).href;
  },

  // Récupère le contenu brut d'un fichier (.vue, mais aussi les .js locaux
  // importés depuis le <script> d'un .vue, ex. "../runtime.js").
  async getFile(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} : ${url}`);
    }
    return {
      getContentData: (asBinary) => (asBinary ? res.arrayBuffer() : res.text()),
      type: url.endsWith('.vue') ? '.vue' : '.mjs',
    };
  },

  // Injecte les blocs <style> compilés. Appelé une fois par composant chargé
  // (vue3-sfc-loader met lui-même en cache les modules déjà résolus).
  addStyle(textContent) {
    const style = document.createElement("style");
    style.textContent = textContent;
    document.head.appendChild(style);
  },
};

// Rendre sfcOptions et loadModule disponibles globalement pour runtime.js
window.sfcOptions = sfcOptions;
window['vue3-sfc-loader'] = { loadModule };
// Exposer les modules partagés pour les composables qui ne peuvent pas importer via ES modules
window.__APP_MODULES__ = {
  useToast: UseToastModule,
};

// loadModule() attend un chemin résolu de façon fiable : on construit une URL
// absolue à partir de import.meta.url (l'URL de CE fichier), plutôt que de
// laisser fetch() la résoudre relativement à index.html (qui vivrait alors
// dans le mauvais dossier, cf. ARCHITECTURE.md §1 sur l'emplacement de
// page/index.html vs page/app/src/).
const appRootUrl = new URL("./AppRoot.vue", import.meta.url).href;
const customLinkUrl = new URL("./components/CustomLink.vue", import.meta.url).href;
const playfulCheckboxUrl = new URL("./components/PlayfulCheckbox.vue", import.meta.url).href;

// AppMenu.vue n'a pas besoin d'un loadModule() séparé : il est résolu
// automatiquement par vue3-sfc-loader via l'import relatif fait dans le
// <script> d'AppRoot.vue ("./components/AppMenu.vue").
const AppRootAsync = Vue.defineAsyncComponent(() => loadModule(appRootUrl, sfcOptions));
const CustomLinkAsync = Vue.defineAsyncComponent(() => loadModule(customLinkUrl, sfcOptions));
const PlayfulCheckboxAsync = Vue.defineAsyncComponent(() => loadModule(playfulCheckboxUrl, sfcOptions));

const runtime = createRuntime();

const app = Vue.createApp(AppRootAsync);

// Rend le runtime disponible à tous les composants descendants via inject('runtime'),
// exactement comme $runtime était disponible partout via useNuxtApp() côté Nuxt.
// Fonctionne aussi à travers les composants chargés par vue3-sfc-loader : provide/inject
// s'appuie sur l'arbre réel des instances de composants, pas sur l'identité des modules JS.
app.provide("runtime", runtime);

// Alias sur les globalProperties : permet aux composants Options API renvoyés
// par le backend (this.xxx dans Home.vue / Dashboard.vue) d'accéder au runtime
// via this.$runtime si besoin, en plus des fonctions déjà injectées dans le
// scope d'évaluation par runtime.js (loadPage, goBack, createDynamicComponent...).
app.config.globalProperties.$runtime = runtime;

app.directive("click-outside", clickOutside);
app.component("CustomLink", CustomLinkAsync);
app.component("PlayfulCheckbox", PlayfulCheckboxAsync);

// ── Install i18n plugin ──────────────────────────────────────────────────────
I18nModule.i18nPlugin.install(app);

// ── Nuxt UI Global Components ────────────────────────────────────────────────

app.component("UButton", {
  props: ["color", "variant", "icon", "size", "to", "loading", "block", "disabled", "type"],
  emits: ["click"],
  template: `
    <button 
      :type="type || 'button'" 
      :disabled="disabled || loading"
      :class="[
        'px-3.5 py-2 text-xs font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap',
        block ? 'w-full' : '',
        disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
        color === 'primary' ? 'bg-[#0066cc] text-white hover:bg-[#0055b3]' :
        color === 'red' ? 'bg-red-600 text-white hover:bg-red-700' :
        variant === 'ghost' ? 'bg-transparent text-gray-700 hover:bg-gray-100 shadow-none border-0' :
        variant === 'outline' ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' :
        variant === 'soft' ? 'bg-red-50 text-red-700 hover:bg-red-100 shadow-none' :
        'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      ]" 
      @click="!disabled && !loading && $emit('click', $event)"
    >
      <span v-if="loading" style="display:inline-block;animation:spin 1s linear infinite;width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;"></span>
      <slot />
    </button>
  `
});

app.component("UBadge", {
  props: ["color", "variant"],
  template: `
    <span :class="[
      'px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block border',
      color === 'green' || color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
      color === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
      color === 'gray' ? 'bg-gray-100 text-gray-600 border-gray-200' :
      'bg-gray-100 text-gray-600 border-gray-200'
    ]">
      <slot />
    </span>
  `
});

app.component("UIcon", {
  props: ["name", "class"],
  template: `<span class="inline-block w-4 h-4 shrink-0" style="font-size:14px;line-height:1;">●</span>`
});

app.component("UAlert", {
  props: ["title", "description", "color", "variant", "icon", "ui"],
  template: `
    <div :class="[
      'p-4 rounded-lg text-sm border flex gap-3',
      color === 'red' ? 'bg-red-50 border-red-200 text-red-800' :
      color === 'green' ? 'bg-green-50 border-green-200 text-green-800' :
      'bg-blue-50 border-blue-200 text-blue-800'
    ]">
      <div>
        <h4 class="font-semibold" v-if="title">{{ title }}</h4>
        <p v-if="description" class="text-xs mt-0.5 opacity-90">{{ description }}</p>
      </div>
    </div>
  `
});

app.component("UInput", {
  props: ["modelValue", "type", "placeholder", "autocomplete", "disabled", "variant"],
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
});

app.component("UTextarea", {
  props: ["modelValue", "placeholder", "rows", "variant", "disabled"],
  emits: ["update:modelValue"],
  template: `
    <textarea
      :placeholder="placeholder"
      :rows="rows || 4"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] resize-y"
      :style="{ backgroundColor: disabled ? '#f9fafb' : '#ffffff', color: disabled ? '#6b7280' : '#111827' }"
      @input="$emit('update:modelValue', $event.target.value)"
    >{{ modelValue }}</textarea>
  `
});

app.component("USwitch", {
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
        boxShadow: modelValue ? '0 0 0 2px rgba(0,102,204,0.2)' : 'none',
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
});

app.component("USelect", {
  props: ["modelValue", "items", "valueKey", "variant", "disabled"],
  emits: ["update:modelValue"],
  template: `
    <select
      :value="modelValue"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
      :style="{ backgroundColor: disabled ? '#f9fafb' : '#ffffff', color: disabled ? '#6b7280' : '#111827' }"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="item in (items || [])" :key="item[valueKey || 'value'] || item" :value="item[valueKey || 'value'] || item" style="background-color: #ffffff; color: #111827;">
        {{ item.label || item }}
      </option>
    </select>
  `
});


app.component("UTable", {
  props: ["data", "rows", "columns", "loading"],
  template: `
    <div class="overflow-x-auto w-full">
      <div v-if="loading" class="flex items-center justify-center py-12 text-gray-400 text-sm">Chargement...</div>
      <table v-else class="w-full text-left text-sm text-gray-700">
        <thead class="bg-gray-50 text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
          <tr>
            <th v-for="col in (columns || [])" :key="col.accessorKey || col.id" class="px-6 py-3.5">
              {{ col.header || '' }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="!(data || rows || []).length">
            <td :colspan="(columns || []).length" class="px-6 py-12 text-center">
              <slot name="empty">
                <span class="text-gray-400 text-sm">Aucun résultat</span>
              </slot>
            </td>
          </tr>
          <tr v-for="(row, idx) in (data || rows || [])" :key="row.id || idx" class="hover:bg-gray-50/80 transition-colors">
            <td v-for="col in (columns || [])" :key="col.accessorKey || col.id" class="px-6 py-4">
              <slot :name="(col.accessorKey || col.id) + '-cell'" :row="{ original: row, id: row.id }">
                {{ row[col.accessorKey] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
});

app.component("UDropdownMenu", {
  props: ["items", "ui"],
  data() { return { open: false }; },
  template: `
    <div class="relative inline-block text-left" v-click-outside="() => open = false">
      <div @click="open = !open"><slot /></div>
      <div v-if="open" class="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg ring-1 ring-gray-200 z-50 divide-y divide-gray-100 overflow-hidden">
        <div v-for="(group, gi) in (items || [])" :key="gi">
          <button v-for="(item, ii) in (Array.isArray(group) ? group : [group])" :key="ii"
            class="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            @click="if(item.onSelect) item.onSelect(); open = false;">
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>
  `
});

app.component("UModal", {
  props: ["open", "title"],
  emits: ["update:open"],
  template: `
    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="$emit('update:open', false)"></div>
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
            <button @click="$emit('update:open', false)" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="px-6 py-4"><slot name="body" /></div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100"><slot name="footer" /></div>
        </div>
      </div>
    </Teleport>
  `
});

app.component("UPagination", {
  props: ["page", "total", "itemsPerPage"],
  emits: ["update:page"],
  computed: {
    totalPages() { return Math.max(1, Math.ceil(this.total / (this.itemsPerPage || 10))); }
  },
  template: `
    <div class="flex items-center gap-1 text-xs">
      <button @click="$emit('update:page', Math.max(1, page - 1))" :disabled="page <= 1" class="px-2.5 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40">‹</button>
      <button v-for="p in totalPages" :key="p" @click="$emit('update:page', p)"
        :class="['px-2.5 py-1.5 border rounded-md text-xs', page === p ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'border-gray-300 bg-white hover:bg-gray-50']">
        {{ p }}
      </button>
      <button @click="$emit('update:page', Math.min(totalPages, page + 1))" :disabled="page >= totalPages" class="px-2.5 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40">›</button>
    </div>
  `
});

app.component("UForm", {
  props: ["schema", "state"],
  emits: ["submit"],
  template: `<form @submit.prevent="$emit('submit')"><slot /></form>`
});

app.component("UFormField", {
  props: ["label", "required", "error", "description"],
  template: `
    <div class="space-y-1">
      <label v-if="label" class="block text-sm font-medium text-gray-700">
        {{ label }} <span v-if="required" class="text-red-500">*</span>
      </label>
      <slot />
      <p v-if="description" class="text-xs text-gray-500">{{ description }}</p>
      <p v-if="error" class="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">{{ error }}</p>
    </div>
  `
});

app.component("UCheckbox", {
  props: ["modelValue", "label", "disabled"],
  emits: ["update:modelValue"],
  template: `
    <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-900 select-none">
      <input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit('update:modelValue', $event.target.checked)" class="w-4 h-4 text-[#0066cc] rounded border-gray-300 focus:ring-[#0066cc]" />
      <span v-if="label">{{ label }}</span>
    </label>
  `
});

app.component("UBreadcrumb", {
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
});

app.component("UCard", {
  template: `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-100"><slot name="header" /></div>
      <div class="p-6"><slot /></div>
      <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 border-t border-gray-100"><slot name="footer" /></div>
    </div>
  `
});

app.component("UApp", {
  template: `<div class="isolate min-h-screen bg-gray-50"><slot /></div>`
});



// Global spin animation
const spinStyle = document.createElement("style");
spinStyle.textContent = "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
document.head.appendChild(spinStyle);

app.mount("#app");
