/**
 * click-outside.js
 *
 * Portage direct de plugins/directives.client.ts. Cette directive ne
 * dépendait d'aucune API Nuxt — le portage est donc littéral.
 */
export const clickOutside = {
  mounted(el, binding) {
    el._clickOutsideHandler = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el._clickOutsideHandler, true);
  },
  unmounted(el) {
    if (el._clickOutsideHandler) {
      document.removeEventListener("click", el._clickOutsideHandler, true);
      delete el._clickOutsideHandler;
    }
  },
};
