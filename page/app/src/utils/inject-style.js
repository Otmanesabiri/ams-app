/**
 * inject-style.js
 *
 * Petit utilitaire partagé : injecte une feuille de style <style> dans le
 * <head> une seule fois (identifiée par un id unique). Repris tel quel du
 * pattern déjà utilisé côté Nuxt dans :
 *   - plugins/custom-link.client.ts (STYLE_ID + injectStyles())
 *   - composables/useRuntimeLoader.ts (injectStyles(css, componentName))
 *
 * Comme il n'y a plus de build (pas de <style scoped> compilé), tous les
 * styles "statiques" de l'application (AppMenu, CustomLink, layout racine)
 * passent désormais par ce même mécanisme d'injection globale — exactement
 * comme le faisaient déjà les composants venant du backend Java.
 */
export function injectStyleOnce(id, css) {
  if (typeof document === "undefined" || !css) return;
  if (document.getElementById(id)) return; // déjà injecté (hot-reload, double montage, etc.)

  const styleTag = document.createElement("style");
  styleTag.id = id;
  styleTag.textContent = css;
  document.head.appendChild(styleTag);
}
