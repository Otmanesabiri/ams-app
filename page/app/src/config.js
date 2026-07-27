/**
 * config.js
 *
 * Remplace `runtimeConfig.public` défini dans nuxt.config.ts :
 *
 *   runtimeConfig: {
 *     public: {
 *       appBase: "nuxt-app",
 *       basePath: "http://127.0.0.1:8081",
 *       componentDirectory: "component",
 *       tenantId: process.env.NUXT_PUBLIC_TENANT_ID || "default"
 *     }
 *   }
 *
 * Il n'y a plus d'étape de build ici, donc plus de variables d'environnement
 * injectées à la compilation. Deux façons de surcharger ces valeurs par
 * environnement (dev / test / prod) sans toucher au code :
 *
 *   1. Éditer directement les valeurs par défaut ci-dessous.
 *   2. Définir `window.__APP_CONFIG__` dans un <script> classique (non-module)
 *      AVANT le <script type="module" src="./src/main.js">, dans index.html.
 *      Utile pour un déploiement Docker où la même image sert plusieurs
 *      environnements (un config.js généré/monté par environnement).
 *
 * Exemple dans index.html :
 *   <script>
 *     window.__APP_CONFIG__ = {
 *       basePath: "https://api.mon-domaine.example.com"
 *     };
 *   </script>
 */

const DEFAULTS = {
  // Nom d'application enregistré côté backend PayOS (segment d'URL sous
  // lequel ce frontend est servi, ex. /vue-app/page/...).
  appBase: "ams-app",
  // Vide = même origine que la page (recommandé : évite tout CORS/preflight
  // inutile). Ne renseigner une valeur absolue que si le frontend est servi
  // depuis une origine différente du backend PayOS.
  basePath: "",
  componentDirectory: "component",
  tenantId: "default",
  // Page chargée par AppRoot.vue au démarrage (nom passé à loadPage()).
  defaultPage: "dashboard/amsDashboard",
};

const overrides =
  (typeof window !== "undefined" && window.__APP_CONFIG__) || {};

export const config = {
  ...DEFAULTS,
  ...overrides,
};
