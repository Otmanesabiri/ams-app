<!--
  AppMenu.vue

  Portage de components/AppMenu.vue (Nuxt) en véritable SFC .vue — chargé
  à l'exécution par vue3-sfc-loader (voir ../main.js), sans étape de build.

  Différences avec la version Nuxt d'origine :
   - useNuxtApp().$runtime      → inject('runtime')
   - useRuntimeConfig().public  → import { config } from '../config.js'
   - <script setup>             → export default { setup(props) {...} }
     (choix volontaire : vue3-sfc-loader supporte aussi <script setup>, mais
     la forme explicite est gardée pour rester strictement identique à la
     version testée en JS pur — voir ARCHITECTURE.md)
   - <style scoped>              → <style> global (les classes sont déjà en
     BEM, donc pas de risque de collision ; le vrai attribut "scoped" du
     compilateur fonctionne aussi ici si vous préférez, il suffit de l'ajouter)

  Toute la logique (arbre de menu, rôles, dropdowns, icônes) est identique
  à l'original.
-->
<template>
  <div class="app-menu" :class="{ 'app-menu--vertical': orientation === 'vertical' }">
    <nav class="app-menu__nav">
      <template v-for="item in menuTree" :key="item.id || item.label">
        <!-- Item avec enfants : déclencheur de dropdown -->
        <div v-if="isVisible(item) && item.children.length" class="app-menu__dropdown" @mouseleave="closeMenu(item.id)">
          <button
            class="app-menu__nav-item app-menu__nav-item--parent"
            @click="toggleMenu(item.id)"
          >
            <img v-if="item.icon && isIconUrl(item.icon)" :src="item.icon" class="app-menu__icon" alt="" aria-hidden="true" />
            <i   v-else-if="item.icon" :class="item.icon" class="app-menu__icon" aria-hidden="true"></i>
            {{ item.label }} <span class="app-menu__caret">&#9662;</span>
          </button>
          <div v-if="openMenus.has(item.id)" class="app-menu__dropdown-panel">
            <template v-for="child in item.children" :key="child.id || child.label">
              <button
                v-if="isVisible(child)"
                class="app-menu__dropdown-item"
                @click="navigate(child); closeAll()"
              >
                <img v-if="child.icon && isIconUrl(child.icon)" :src="child.icon" class="app-menu__icon" alt="" aria-hidden="true" />
                <i   v-else-if="child.icon" :class="child.icon" class="app-menu__icon" aria-hidden="true"></i>
                {{ child.label }}
              </button>
            </template>
          </div>
        </div>
        <!-- Item feuille -->
        <button
          v-else-if="isVisible(item)"
          class="app-menu__nav-item"
          @click="navigate(item)"
        >
          <img v-if="item.icon && isIconUrl(item.icon)" :src="item.icon" class="app-menu__icon" alt="" aria-hidden="true" />
          <i   v-else-if="item.icon" :class="item.icon" class="app-menu__icon" aria-hidden="true"></i>
          {{ item.label }}
        </button>
      </template>
      <button class="app-menu__nav-item app-menu__nav-item--secondary" @click="goBack()">
        &larr; Précédent
      </button>
    </nav>

    <div v-if="isAuthenticated" class="app-menu__user">
      <span class="app-menu__username">{{ principalName }}</span>
      <span v-if="principal?.roles?.length" class="app-menu__roles">
        {{ principal.roles.join(', ') }}
      </span>
      <span v-if="hasRole('admin')" class="app-menu__admin-badge">Admin</span>
      <button class="app-menu__btn-ghost" @click="refreshPrincipal()" title="Rafraîchir la session">
        &#8635;
      </button>
      <button class="app-menu__btn-logout" @click="logout()">Déconnexion</button>
    </div>
  </div>
</template>

<script>
import { computed, inject, onMounted, ref } from "vue";
import { createRuntime } from "app-runtime";

export default {
  name: "AppMenu",
  props: {
    menuItems: {
      type: Array,
      default: null,
    },
    orientation: {
      type: String,
      default: "horizontal",
      validator: (val) => ["horizontal", "vertical"].includes(val),
    },
  },
  setup(props) {
    // Équivalent de : const { $runtime } = useNuxtApp(); const runtime = $runtime || useRuntimeLoader();
    const runtime = inject("runtime", null) || createRuntime();
    const {
      getPrincipal,
      refreshPrincipal,
      hasRole,
      loadPage,
      setPage,
      goBack,
      principal,
      buildRequestHeaders,
      buildBackendUrl,
      buildAppUrl,
    } = runtime;

    const staticDefaults = [{ id: "unreachable", label: "Menu unreachable" }];

    const resolvedItems = ref(props.menuItems ?? staticDefaults);

    async function fetchMenu() {
      try {
        const res = await fetch(buildAppUrl("/menu"), {
          headers: buildRequestHeaders(),
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          resolvedItems.value = data;
        }
      } catch (_err) {
        // backend injoignable ou pas encore configuré — on garde les items actuels silencieusement
      }
    }

    onMounted(() => {
      if (!props.menuItems) {
        fetchMenu();
      }
      refreshPrincipal().catch(() => {
        // pas de session authentifiée — la zone utilisateur reste masquée
      });
    });

    const isAuthenticated = computed(() => Boolean(getPrincipal()));

    const principalName = computed(() => {
      const user = getPrincipal();
      if (!user) return "anonymous";
      return user.username || user.preferred_username || user.name || user.email || user.sub || "anonymous";
    });

    function isVisible(item) {
      if (!item.roles || !item.roles.length) return true;
      return item.roles.some((role) => hasRole(role));
    }

    function navigate(item) {
      if (item.component) {
        setPage(item.component);
      } else if (item.page) {
        loadPage(item.page);
      } else if (item.href) {
        const target = item.target || "_self";
        window.open(item.href, target);
      }
    }

    // Construit un arbre à partir de la liste plate via id / parentId.
    const menuTree = computed(() => {
      const items = resolvedItems.value;
      const byId = new Map(items.map((item) => [item.id, { ...item, children: [] }]));
      const roots = [];
      for (const item of items) {
        const node = byId.get(item.id);
        if (!node) continue;
        if (item.parentId && byId.has(item.parentId)) {
          byId.get(item.parentId).children.push(node);
        } else {
          roots.push(node);
        }
      }
      return roots;
    });

    const openMenus = ref(new Set());

    function toggleMenu(id) {
      const next = new Set(openMenus.value);
      next.has(id) ? next.delete(id) : next.add(id);
      openMenus.value = next;
    }

    function closeAll() {
      openMenus.value = new Set();
    }

    function closeMenu(id) {
      const next = new Set(openMenus.value);
      next.delete(id);
      openMenus.value = next;
    }

    function logout() {
      window.location.href = buildBackendUrl("/logout");
    }

    function isIconUrl(icon) {
      if (!icon) return false;
      return /^(https?:\/\/|\/|data:image|\.\/|\.\.\/)|\.(png|svg|jpg|jpeg|gif|webp|ico)$/i.test(icon);
    }

    return {
      menuTree,
      isVisible,
      navigate,
      openMenus,
      toggleMenu,
      closeAll,
      closeMenu,
      isAuthenticated,
      principalName,
      principal,
      hasRole,
      refreshPrincipal,
      logout,
      goBack,
      isIconUrl,
    };
  },
};
</script>

<style>
.app-menu {
  /* Layout */
  --app-menu-gap:            8px;
  --app-menu-padding:        10px 16px;
  --app-menu-radius:         8px;
  --app-menu-margin-bottom:  20px;
  --app-menu-shadow:         0 1px 4px rgba(0, 0, 0, 0.08);
  --app-menu-font-size:      0.9rem;
  --app-menu-item-radius:    6px;
  --app-menu-item-padding:   6px 14px;

  /* Colors — container */
  --app-menu-bg:             #fff;

  /* Colors — primary nav items */
  --app-menu-primary:          #1a73e8;
  --app-menu-primary-bg:       #e8f0fe;
  --app-menu-primary-bg-hover: #d2e3fc;

  /* Colors — secondary nav item (← Précédent) */
  --app-menu-secondary-bg:       #f1f3f4;
  --app-menu-secondary-color:    #444;
  --app-menu-secondary-bg-hover: #e2e4e6;

  /* Colors — dropdown panel */
  --app-menu-dropdown-bg:           #fff;
  --app-menu-dropdown-border:       #e0e0e0;
  --app-menu-dropdown-shadow:       0 4px 12px rgba(0, 0, 0, 0.12);
  --app-menu-dropdown-item-color:   #202124;
  --app-menu-dropdown-item-font-size: 0.88rem;
  --app-menu-dropdown-item-hover-bg: #f1f3f4;
  --app-menu-dropdown-min-width:    160px;

  /* Colors — user section */
  --app-menu-username-color:  #202124;
  --app-menu-roles-color:     #5f6368;
  --app-menu-roles-font-size: 0.8rem;

  /* Colors — admin badge */
  --app-menu-admin-bg:    #0a7a33;
  --app-menu-admin-color: #fff;

  /* Colors — ghost refresh button */
  --app-menu-ghost-color:    #1a73e8;
  --app-menu-ghost-bg-hover: #e8f0fe;

  /* Colors — logout button */
  --app-menu-logout-color:      #d93025;
  --app-menu-logout-font-size:  0.85rem;

  /* Icon size */
  --app-menu-icon-size: 1em;

  /* --- Computed styles (use the variables above) --- */
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--app-menu-gap);
  background: var(--app-menu-bg);
  padding: var(--app-menu-padding);
  border-radius: var(--app-menu-radius);
  margin-bottom: var(--app-menu-margin-bottom);
  box-shadow: var(--app-menu-shadow);
}

.app-menu__nav {
  display: flex;
  align-items: center;
  gap: var(--app-menu-gap);
  flex-wrap: wrap;
}

.app-menu__nav-item {
  padding: var(--app-menu-item-padding);
  border: none;
  border-radius: var(--app-menu-item-radius);
  background: var(--app-menu-primary-bg);
  color: var(--app-menu-primary);
  font-size: var(--app-menu-font-size);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.app-menu__nav-item:hover {
  background: var(--app-menu-primary-bg-hover);
}

.app-menu__nav-item--secondary {
  background: var(--app-menu-secondary-bg);
  color: var(--app-menu-secondary-color);
}

.app-menu__nav-item--secondary:hover {
  background: var(--app-menu-secondary-bg-hover);
}

.app-menu__nav-item--parent {
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-menu__caret {
  font-size: 0.7rem;
  opacity: 0.7;
}

.app-menu__icon {
  display: inline-block;
  width: var(--app-menu-icon-size);
  height: var(--app-menu-icon-size);
  vertical-align: middle;
  flex-shrink: 0;
  object-fit: contain;
}

.app-menu__dropdown {
  position: relative;
}

.app-menu__dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  background: var(--app-menu-dropdown-bg);
  border: 1px solid var(--app-menu-dropdown-border);
  border-radius: var(--app-menu-item-radius);
  box-shadow: var(--app-menu-dropdown-shadow);
  min-width: var(--app-menu-dropdown-min-width);
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.app-menu__dropdown-panel::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 0;
  right: 0;
  height: 4px;
}

.app-menu__dropdown-item {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--app-menu-dropdown-item-color);
  font-size: var(--app-menu-dropdown-item-font-size);
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
}

.app-menu__dropdown-item:hover {
  background: var(--app-menu-dropdown-item-hover-bg);
}

.app-menu__user {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.app-menu__username {
  font-weight: 600;
  color: var(--app-menu-username-color);
  font-size: var(--app-menu-font-size);
}

.app-menu__roles {
  font-size: var(--app-menu-roles-font-size);
  color: var(--app-menu-roles-color);
}

.app-menu__admin-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--app-menu-admin-color);
  background: var(--app-menu-admin-bg);
  border-radius: 4px;
  padding: 2px 7px;
}

.app-menu__btn-ghost {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--app-menu-ghost-color);
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
}

.app-menu__btn-ghost:hover {
  background: var(--app-menu-ghost-bg-hover);
}

.app-menu__btn-logout {
  padding: var(--app-menu-item-padding);
  border: 1px solid var(--app-menu-logout-color);
  border-radius: var(--app-menu-item-radius);
  background: transparent;
  color: var(--app-menu-logout-color);
  font-size: var(--app-menu-logout-font-size);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.app-menu__btn-logout:hover {
  background: var(--app-menu-logout-color);
  color: #fff;
}

.app-menu--vertical {
  flex-direction: column;
  align-items: stretch;
}

.app-menu--vertical .app-menu__nav {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
}

.app-menu--vertical .app-menu__nav-item,
.app-menu--vertical .app-menu__nav-item--parent {
  width: 100%;
  text-align: left;
  justify-content: flex-start;
}

.app-menu--vertical .app-menu__dropdown-panel {
  top: 0;
  left: calc(100% + 4px);
}

.app-menu--vertical .app-menu__dropdown-panel::before {
  top: 0;
  left: -4px;
  bottom: 0;
  right: auto;
  width: 4px;
  height: auto;
}

.app-menu--vertical .app-menu__caret {
  transform: rotate(-90deg);
  margin-left: auto;
}

.app-menu--vertical .app-menu__user {
  border-top: 1px solid var(--app-menu-dropdown-border);
  padding-top: var(--app-menu-gap);
  flex-wrap: wrap;
}
</style>
