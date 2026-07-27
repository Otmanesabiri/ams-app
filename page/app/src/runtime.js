/**
 * runtime.js
 *
 * Portage fidèle de composables/useRuntimeLoader.ts (Nuxt) en JavaScript pur.
 *
 * Rôle inchangé : c'est le moteur qui va chercher les pages/composants
 * (template + script + style + props) auprès du backend Java PayOS et les
 * transforme en véritables composants Vue, compilés à la volée dans le
 * navigateur (aucune étape de build, ni ici ni côté backend).
 *
 * Différences avec la version Nuxt :
 *   - useRuntimeConfig() → import { config } depuis ./config.js
 *   - useNuxtApp() / defineNuxtPlugin → un simple `provide('runtime', ...)`
 *     fait dans main.js (voir plus bas createRuntime()).
 *   - Les types TypeScript ont été retirés, la logique est identique.
 *
 * Le reste (cache de version, extraction des erreurs backend, normalisation
 * du principal OIDC, évaluation du script via new Function(), etc.) est
 * repris à l'identique.
 */
import { defineAsyncComponent, markRaw, onMounted, ref, shallowRef } from "../vendor/vue.js";
import { config } from "./config.js";

const componentCache = new Map(); // name -> { component, version }

function parseJsonObject(value) {
  // Conservé tel quel depuis l'original (utilitaire actuellement inutilisé
  // dans le fichier source Nuxt, mais gardé pour fidélité du portage).
  if (!value || !value.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_err) {
    return null;
  }
}

function normalizePrincipal(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const principal = { ...candidate };
  if (!principal.username) {
    principal.username =
      principal.preferred_username || principal.name || principal.email || principal.sub || "";
  }

  if (!Array.isArray(principal.roles)) {
    const directRoles = Array.isArray(principal.realm_access?.roles)
      ? principal.realm_access.roles
      : [];
    principal.roles = directRoles;
  }

  return principal;
}

function collectRoles(principal) {
  if (!principal) {
    return [];
  }

  const roles = new Set();
  if (Array.isArray(principal.roles)) {
    principal.roles.forEach((role) => {
      if (typeof role === "string" && role.trim()) {
        roles.add(role.trim());
      }
    });
  }

  const realmRoles = principal.realm_access?.roles;
  if (Array.isArray(realmRoles)) {
    realmRoles.forEach((role) => {
      if (typeof role === "string" && role.trim()) {
        roles.add(role.trim());
      }
    });
  }

  const resourceAccess = principal.resource_access;
  if (resourceAccess && typeof resourceAccess === "object") {
    Object.values(resourceAccess).forEach((resource) => {
      const resourceRoles = resource?.roles;
      if (Array.isArray(resourceRoles)) {
        resourceRoles.forEach((role) => {
          if (typeof role === "string" && role.trim()) {
            roles.add(role.trim());
          }
        });
      }
    });
  }

  return Array.from(roles);
}

async function parseJsonIfPossible(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const raw = await response.text();
    if (!raw || !raw.trim()) {
      return { isJson: true, data: {} };
    }
    try {
      return { isJson: true, data: JSON.parse(raw) };
    } catch (_err) {
      return { isJson: false, text: raw };
    }
  }
  const text = await response.text();
  return { isJson: false, text };
}

function extractBackendErrorMessage(response, payload) {
  if (response.status === 403) {
    if (!payload?.isJson && typeof payload?.text === "string" && payload.text.trim()) {
      return `Access denied : insufficient rights. ${payload.text.trim()}`;
    }
    return "Access denied : the user's rights are insufficient to access this resource.";
  }

  if (payload?.isJson) {
    const data = payload.data;
    if (typeof data === "string" && data.trim()) {
      return data.trim();
    }
    if (data && typeof data === "object") {
      const message =
        data.message ||
        data.error ||
        data.details ||
        data.title ||
        data.description;
      if (typeof message === "string" && message.trim()) {
        return message.trim();
      }
    }
  }

  if (!payload?.isJson && typeof payload?.text === "string" && payload.text.trim()) {
    return payload.text.trim();
  }

  return `HTTP ${response.status}`;
}

function isBackendUnauthenticated(response, payload) {
  if (response.status === 401) {
    return true;
  }

  if (response.status !== 403) {
    return false;
  }

  const message = extractBackendErrorMessage(response, payload).toLowerCase();
  return message.includes("not authenticated") || message.includes("unauthenticated");
}

function lastSegment(path) {
  if (!path) return "";
  const parts = path.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

function tryWrapSetupScript(script) {
  const match = script.match(/(?:const|let|var)\s*{\s*([^}]+)\s*}\s*=\s*useRuntimeLoader\(\)/);
  if (!match || !match[1]) return null;
  const returnNames = match[1]
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => name.split(":").pop() || "")
    .map((name) => (name.split("=")[0] ?? "").trim())
    .filter(Boolean);

  if (!returnNames.length) return null;

  return `return { setup() { ${script}; return { ${returnNames.join(", ")} }; } }`;
}

function evaluateComponentScript(script, scope = {}) {
  const trimmed = script.trim();
  const scopeKeys = Object.keys(scope);
  const scopeValues = Object.values(scope);

  const run = (body) => new Function(...scopeKeys, body)(...scopeValues);
  const setupWrapped = tryWrapSetupScript(trimmed);
  if (setupWrapped) {
    try {
      return run(setupWrapped);
    } catch (_err) {
      // Fall through to other strategies.
    }
  }

  try {
    return run(`return (${trimmed})`);
  } catch (_err) {
    const normalized = trimmed.replace(/export\s+default\s+/, "return ");
    try {
      return run(normalized);
    } catch (_err2) {
      return run(
        `const module = { exports: {} }; const exports = module.exports; ${normalized}; return module.exports?.default ?? module.exports ?? exports.default ?? exports ?? (typeof component !== "undefined" ? component : {});`
      );
    }
  }
}

/**
 * createRuntime()
 *
 * Équivalent direct de useRuntimeLoader() côté Nuxt. Un seul appel est fait
 * dans main.js et le résultat est fourni (provide) à toute l'application —
 * exactement comme le faisait plugins/runtime.client.ts avec `$runtime`.
 */
export function createRuntime() {
  const loading = ref(false);
  const errorMessage = ref("");
  const currentPage = shallowRef(null);
  const previousPage = shallowRef(null);
  const currentPageName = ref("");
  const principal = ref(null);

  const { appBase, basePath, componentDirectory, tenantId: configuredTenantId } = config;

  function buildBackendUrl(path) {
    const normalizedBasePath = (basePath || "").replace(/\/+$/, "");
    return `${normalizedBasePath}${path.startsWith("/") ? path : `/${path}`}`;
  }

  // Same as buildBackendUrl(), but scoped under the app segment (appBase).
  // Every app-scoped endpoint (page/component/menu) must go through this
  // instead of raw `${basePath}/${appBase}/...` interpolation: a trailing
  // slash on a configured basePath (or a leading slash on appBase) would
  // otherwise produce a "//..." URL that the backend's routing rejects.
  function buildAppUrl(path) {
    const normalizedAppBase = (appBase || "").replace(/^\/+|\/+$/g, "");
    return buildBackendUrl(`/${normalizedAppBase}${path.startsWith("/") ? path : `/${path}`}`);
  }

  function resolveTenantId() {
    const configured = typeof configuredTenantId === "string" ? configuredTenantId.trim() : "";
    if (configured) {
      return configured;
    }

    if (typeof window === "undefined") {
      return "";
    }

    const fromQuery = new URLSearchParams(window.location.search).get("tenantId")?.trim();
    if (fromQuery) {
      return fromQuery;
    }

    const fromSession = window.sessionStorage.getItem("tenantId")?.trim();
    if (fromSession) {
      return fromSession;
    }

    const fromLocal = window.localStorage.getItem("tenantId")?.trim();
    if (fromLocal) {
      return fromLocal;
    }

    return "";
  }

  function buildRequestHeaders() {
    const headers = {
      "X-Requested-With": "XMLHttpRequest",
    };

    const tenantId = resolveTenantId();
    if (tenantId) {
      headers["X-Tenant-Id"] = tenantId;
    }

    return headers;
  }

  async function refreshPrincipal() {
    if (typeof document === "undefined") {
      principal.value = null;
      return principal.value;
    }

    const response = await fetch(buildBackendUrl("/me"), {
      headers: buildRequestHeaders(),
      credentials: "include",
    });
    const payload = await parseJsonIfPossible(response);

    if (isBackendUnauthenticated(response, payload)) {
      principal.value = null;
      return principal.value;
    }

    if (!response.ok) {
      throw new Error(extractBackendErrorMessage(response, payload));
    }

    principal.value = payload?.isJson ? normalizePrincipal(payload.data) : null;
    return principal.value;
  }

  function getPrincipal() {
    return principal.value;
  }

  function hasRole(roleName) {
    const normalizedRole = (roleName || "").trim().toLowerCase();
    if (!normalizedRole) {
      return false;
    }

    return collectRoles(getPrincipal()).some((role) => role.toLowerCase() === normalizedRole);
  }

  const createDynamicComponent = (name) =>
    defineAsyncComponent(async () => {
      try {
        const requestHeaders = buildRequestHeaders();
        const vRes = await fetch(buildAppUrl(`/${componentDirectory}/${name}?version=true`), {
          headers: requestHeaders,
          credentials: "include",
        });
        if (!vRes.ok) {
          const versionPayload = await parseJsonIfPossible(vRes);
          if (isBackendUnauthenticated(vRes, versionPayload)) {
            principal.value = null;
          }
          throw new Error(extractBackendErrorMessage(vRes, versionPayload));
        }
        const currentVersion = await vRes.text();

        const cached = componentCache.get(name);
        if (cached && cached.version === currentVersion) {
          return cached.component;
        }

        const res = await fetch(buildAppUrl(`/${componentDirectory}/${name}`), {
          headers: requestHeaders,
          credentials: "include",
        });
        const payload = await parseJsonIfPossible(res);
        if (isBackendUnauthenticated(res, payload)) {
          principal.value = null;
        }
        if (payload.isJson) {
          const data = payload.data;

          if (data?.redirect) {
            window.location.href = data.redirect;
            return {};
          }
        }

        if (!res.ok) {
          throw new Error(extractBackendErrorMessage(res, payload));
        }

        if (!payload.isJson) {
          console.error("Reponse non JSON (component):", payload.text);
          return {};
        }
        const componentUrl = buildAppUrl(`/page/${name}.vue`);
        const { loadModule } = window['vue3-sfc-loader'];
        const newComponent = await loadModule(componentUrl, window.sfcOptions);
        
        componentCache.set(name, { component: newComponent, version: '1.0' });
        return newComponent;
      } catch (err) {
        console.error("Erreur lors du chargement du component dynamique :", err);
        return {};
      }
    });

  async function loadPage(pageName) {
    loading.value = true;
    errorMessage.value = "";
    currentPageName.value = pageName;

    try {
      // Nettoyage de l'erreur précédente
      const { loadModule } = window['vue3-sfc-loader'];
      if (!loadModule || !window.sfcOptions) {
        throw new Error("vue3-sfc-loader non initialisé");
      }

      const componentUrl = buildAppUrl(`/page/${pageName}.vue`);
      const newComponent = await loadModule(componentUrl, window.sfcOptions);

      previousPage.value = currentPage.value;
      currentPage.value = markRaw(newComponent);
    } catch (err) {
      console.error("Erreur loadPage :", err);
      errorMessage.value = "Erreur lors du chargement de la page : " + err.message;
    } finally {
      loading.value = false;
    }
  }

  function goBack() {
    if (previousPage.value) {
      const temp = currentPage.value;
      currentPage.value = previousPage.value;
      previousPage.value = temp;
    }
  }

  function setPage(component) {
    previousPage.value = currentPage.value;
    currentPage.value = markRaw(component);
    errorMessage.value = "";
  }

  return {
    loading,
    errorMessage,
    currentPage,
    currentPageName,
    principal,
    getPrincipal,
    buildRequestHeaders,
    buildBackendUrl,
    buildAppUrl,
    refreshPrincipal,
    hasRole,
    loadPage,
    setPage,
    goBack,
    createDynamicComponent,
  };
}
