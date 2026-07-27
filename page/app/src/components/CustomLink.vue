<!--
  CustomLink.vue

  Portage de plugins/custom-link.client.ts en véritable SFC .vue.

  L'original utilisait une fonction de rendu h() (déjà "non précompilée" par
  nature). En SFC réel, on peut revenir à un vrai <template>, plus proche de
  l'esprit "authoring .vue" : <slot> avec contenu de repli reproduit
  exactement `slots.default ? slots.default() : props.to`, et le class
  statique "custom-link" se fusionne automatiquement avec un class éventuel
  reçu via $attrs (comportement natif de Vue, même avec inheritAttrs: false).
-->
<template>
  <a :href="to" @click="handleClick" class="custom-link" v-bind="$attrs">
    <slot>{{ to }}</slot>
  </a>
</template>

<script>
import { inject } from "vue";

export default {
  name: "CustomLink",
  inheritAttrs: false,
  props: {
    to: { type: String, required: true },
  },
  setup(props) {
    // Équivalent de : const { $runtime } = useNuxtApp();
    // Pas de fallback ici (comme dans l'original) : si le runtime n'est pas
    // fourni, le clic ne fait simplement rien (optional chaining).
    const runtime = inject("runtime", null);

    function handleClick(event) {
      event.preventDefault();
      runtime?.loadPage?.(props.to);
    }

    return { handleClick };
  },
};
</script>

<style>
.custom-link {
  --custom-link-color:            #1a73e8;
  --custom-link-font-weight:      500;
  --custom-link-font-size:        inherit;
  --custom-link-font-family:      inherit;
  --custom-link-decoration:       none;
  --custom-link-hover-color:      #1558b0;
  --custom-link-hover-decoration: underline;

  color:           var(--custom-link-color);
  font-weight:     var(--custom-link-font-weight);
  font-size:       var(--custom-link-font-size);
  font-family:     var(--custom-link-font-family);
  text-decoration: var(--custom-link-decoration);
  cursor:          pointer;
  transition:      color 0.15s;
}
.custom-link:hover {
  color:           var(--custom-link-hover-color);
  text-decoration: var(--custom-link-hover-decoration);
}
</style>
