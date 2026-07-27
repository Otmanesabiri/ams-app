<template>
  <div class="min-h-screen flex flex-col font-sans" :class="isAuthPage ? 'bg-gray-100 justify-center items-center p-4' : 'bg-gray-50'">
    <!-- Top Header -->
    <header v-if="!isAuthPage" class="bg-gray-900 text-white h-16 flex items-center justify-between px-6 sticky top-0 z-20 shadow-md">
      <div class="flex items-center gap-4">
        <!-- Mobile hamburger menu button -->
        <UButton 
          icon="i-heroicons-bars-3-20-solid"
          color="gray"
          variant="ghost"
          @click="mobileMenuOpen = !mobileMenuOpen" 
          class="lg:hidden text-gray-300 hover:text-white"
          title="Menu Navigation"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </UButton>

        <!-- Logo -->
        <a href="#" @click.prevent="loadPage('dashboard/amsDashboard'); mobileMenuOpen = false;" class="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-90">
          <div class="w-7 h-7 bg-[#0066cc] rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">K</div>
          <span>AMS S2M</span>
        </a>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-4">
        <!-- Language button -->
        <UButton 
          variant="ghost" 
          color="gray"
          size="xs"
          class="text-gray-300 hover:text-white border border-gray-700 rounded-full px-3 py-1"
          @click="toggleLanguage"
        >
          <template #default>
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
              </svg>
              <span>{{ currentLang }}</span>
            </span>
          </template>
        </UButton>

        <!-- User profile dropdown menu -->
        <UDropdownMenu :items="userMenuItems">
          <button class="flex items-center gap-2 text-sm font-medium text-gray-200 cursor-pointer hover:text-white">
            <span class="text-xs text-gray-400">admin</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            <div class="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
            </div>
          </button>
        </UDropdownMenu>
      </div>
    </header>

    <!-- Mobile Backdrop Overlay -->
    <div 
      v-if="!isAuthPage && mobileMenuOpen" 
      @click="mobileMenuOpen = false" 
      class="fixed inset-0 bg-black/40 z-20 lg:hidden"
    ></div>

    <div class="flex flex-1 overflow-hidden w-full relative">
      <!-- Sidebar -->
      <aside 
        v-if="!isAuthPage" 
        class="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 overflow-y-auto transition-all duration-200 z-30"
        :class="mobileMenuOpen ? 'fixed inset-y-0 left-0 top-16 shadow-xl block' : 'hidden lg:block'"
      >
        <div class="p-5 space-y-6">
          <!-- MANAGE section -->
          <div>
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{{ $t('admin.manage') }}</div>
            <nav class="space-y-1">
              <button @click="loadPage('dashboard/amsDashboard'); mobileMenuOpen = false;" 
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage === 'dashboard/amsDashboard' ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                {{ $t('admin.dashboard') }}
              </button>
              <button @click="loadPage('roles/RoleList'); mobileMenuOpen = false;"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage.startsWith('roles') ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                {{ $t('admin.roleManagement') }}
              </button>
              <button @click="loadPage('userManagement/UsersPage'); mobileMenuOpen = false;"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage.startsWith('userManagement') ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                {{ $t('admin.users') }}
              </button>
              <button @click="loadPage('paramettre/amsParamettre'); mobileMenuOpen = false;"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage.startsWith('paramettre') ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                {{ $t('admin.parameters') }}
              </button>
            </nav>
          </div>

          <!-- AUTHENTICATION section -->
          <div>
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{{ $t('admin.authentication') }}</div>
            <nav class="space-y-1">
              <button @click="loadPage('profile/MyProfile'); mobileMenuOpen = false;"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage.startsWith('profile') ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                Mon Profil
              </button>
              <button @click="loadPage('userManagement/LoginPage'); mobileMenuOpen = false;"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage.includes('LoginPage') ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                {{ $t('admin.login') }}
              </button>
              <button @click="loadPage('userManagement/RegisterPage'); mobileMenuOpen = false;"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage.includes('RegisterPage') ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                {{ $t('admin.register') }}
              </button>
              <button @click="loadPage('forgotPassword/ForgotPasswordPage'); mobileMenuOpen = false;"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left transition-colors"
                :class="activePage.startsWith('forgotPassword') ? 'bg-blue-50 text-[#0066cc] font-semibold' : 'text-gray-700 hover:bg-gray-100'">
                {{ $t('admin.forgotPassword') }}
              </button>
            </nav>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main :class="isAuthPage ? 'w-full max-w-md m-auto' : 'flex-1 overflow-y-auto p-6 bg-white min-h-[calc(100vh-4rem)]'">
        <div v-if="loading" class="flex justify-center items-center py-20 text-gray-500 text-sm">
          <div style="display:inline-block;animation:spin 1s linear infinite;width:2rem;height:2rem;border:3px solid #e5e7eb;border-top-color:#0066cc;border-radius:50%;" class="mr-3"></div>
          Chargement de la page...
        </div>
        <UAlert v-else-if="errorMessage" title="Erreur de chargement" :description="errorMessage" color="red" variant="subtle" class="mb-4" />
        <component :is="currentPage" v-else />
      </main>
    </div>

    <!-- Global Toast Container -->
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
      <div 
        v-for="t in toasts" 
        :key="t.id"
        class="pointer-events-auto"
      >
        <UAlert 
          :title="t.title" 
          :description="t.description" 
          :color="t.color || 'gray'" 
          variant="subtle"
          class="shadow-xl"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, inject, onMounted, ref } from "vue";
import { createRuntime } from "app-runtime";
import { config } from "app-config";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";

export default {
  name: "AppRoot",
  setup() {
    const runtime = inject("runtime", null) || createRuntime();
    const { loading, errorMessage, currentPage, refreshPrincipal, loadPage, currentPageName } = runtime;

    const currentLang = ref(localStorage.getItem('ams_locale') === 'fr' ? 'FR' : 'EN');
    const userMenuOpen = ref(false);
    const mobileMenuOpen = ref(false);
    const { toasts, remove: removeToast } = useToast();
    const { setLocale } = useI18n();

    function toggleLanguage() {
      const newLang = currentLang.value === 'EN' ? 'fr' : 'en';
      currentLang.value = newLang === 'fr' ? 'FR' : 'EN';
      setLocale(newLang);
    }

    // Function to extract page name from window.location.hash
    function getPageFromHash() {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      return hash || config.defaultPage || 'dashboard/amsDashboard';
    }

    // Enveloppe loadPage pour mettre à jour le hash de l'URL (permet le F5 refresh)
    function navigate(pageName) {
      if (window.location.hash !== '#/' + pageName) {
        window.location.hash = '/' + pageName;
      }
      loadPage(pageName);
    }

    const userMenuItems = computed(() => [
      [{ label: 'Mon Profil', onSelect: () => { navigate('profile/MyProfile'); mobileMenuOpen.value = false; } }],
      [{ label: 'Se déconnecter', onSelect: () => {} }]
    ]);

    onMounted(() => {
      (async () => {
        try {
          await refreshPrincipal();
        } catch (error) {
          console.error("Unable to refresh principal", error);
        }
        
        // Lire la page depuis le hash de l'URL (ex: #/roles/RoleList)
        const initialPage = getPageFromHash();
        await loadPage(initialPage);
        
        // Synchroniser le hash initial si vide
        if (!window.location.hash) {
          window.location.hash = '/' + initialPage;
        }
      })();

      // Écouter les navigations internes
      window.addEventListener('ams:navigate', (e) => {
        if (e.detail && e.detail.page) {
          navigate(e.detail.page);
        }
      });

      // Écouter les changements de hash (boutons Précédent/Suivant du navigateur + saisie directe)
      window.addEventListener('hashchange', () => {
        const page = getPageFromHash();
        loadPage(page);
      });
    });

    const activePage = computed(() => {
      const name = currentPageName ? currentPageName.value : "dashboard/amsDashboard";
      return name;
    });

    const isAuthPage = computed(() => {
      const page = activePage.value || '';
      return page.includes('Login') || page.includes('Register') || page.includes('ForgotPassword');
    });

    return {
      loading,
      errorMessage,
      currentPage,
      loadPage: navigate,
      activePage,
      isAuthPage,
      currentLang,
      toggleLanguage,
      userMenuOpen,
      mobileMenuOpen,
      userMenuItems,
      toasts,
      removeToast,
    };
  },
};
</script>

