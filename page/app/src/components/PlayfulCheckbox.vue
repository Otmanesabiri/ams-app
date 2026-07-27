<!--
  PlayfulCheckbox.vue

  Case à cocher personnalisée avec une petite animation ludique (coche qui se
  dessine, boîte qui "rebondit", étincelles qui explosent autour) au lieu du
  rendu natif austère d'un <input type="checkbox">. Suit le même pattern que
  CustomLink.vue : véritable SFC .vue, enregistré globalement dans main.js
  (app.component), donc utilisable dans n'importe quel template — y compris
  ceux assemblés côté backend (Home.vue, Dashboard.vue, ...) sans rien
  déclarer dans leur `components: {}` local, exactement comme <custom-link>.

  Utilisation :
    <playful-checkbox v-model="agree" label="J'accepte" />
-->
<template>
  <label
    class="playful-checkbox"
    :class="{ 'playful-checkbox--checked': isChecked, 'playful-checkbox--disabled': disabled }"
  >
    <input
      type="checkbox"
      class="playful-checkbox__input"
      :checked="isChecked"
      :disabled="disabled"
      @change="toggle"
    />
    <span class="playful-checkbox__box" aria-hidden="true">
      <svg class="playful-checkbox__check" viewBox="0 0 24 24">
        <path d="M4 12l5 5L20 6" />
      </svg>
      <span class="playful-checkbox__sparkle" v-for="n in 6" :key="n"></span>
    </span>
    <span v-if="label" class="playful-checkbox__label">{{ label }}</span>
  </label>
</template>

<script>
import { computed } from "vue";

export default {
  name: "PlayfulCheckbox",
  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isChecked = computed(() => props.modelValue);

    function toggle() {
      if (props.disabled) return;
      emit("update:modelValue", !props.modelValue);
    }

    return { isChecked, toggle };
  },
};
</script>

<style>
.playful-checkbox {
  --playful-checkbox-size:        24px;
  --playful-checkbox-border:      #c6cbd4;
  --playful-checkbox-bg:          #fff;
  --playful-checkbox-checked-a:   #8e2de2;
  --playful-checkbox-checked-b:   #f857a6;
  --playful-checkbox-label-color: #2c3e50;

  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.playful-checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.playful-checkbox__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.playful-checkbox__box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--playful-checkbox-size);
  height: var(--playful-checkbox-size);
  border-radius: 8px;
  border: 2px solid var(--playful-checkbox-border);
  background: var(--playful-checkbox-bg);
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}

.playful-checkbox:not(.playful-checkbox--disabled):hover .playful-checkbox__box {
  border-color: var(--playful-checkbox-checked-a);
  transform: scale(1.05);
}

.playful-checkbox:not(.playful-checkbox--disabled) .playful-checkbox__input:active + .playful-checkbox__box {
  transform: scale(0.9);
}

.playful-checkbox--checked .playful-checkbox__box {
  border-color: transparent;
  background: linear-gradient(135deg, var(--playful-checkbox-checked-a), var(--playful-checkbox-checked-b));
  animation: playful-checkbox-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.playful-checkbox__check {
  width: 60%;
  height: 60%;
  fill: none;
  stroke: #fff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
}

.playful-checkbox--checked .playful-checkbox__check {
  animation: playful-checkbox-draw 0.3s ease-out 0.05s forwards;
}

.playful-checkbox__label {
  color: var(--playful-checkbox-label-color);
  font-size: 0.95em;
}

/* Étincelles : 6 points répartis en étoile autour de la boîte, invisibles au
   repos, qui jaillissent puis s'estompent uniquement au moment où la case
   passe à "coché" (l'animation se relance à chaque ajout de la classe
   --checked, donc à chaque clic). */
.playful-checkbox__sparkle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--playful-checkbox-checked-b);
  opacity: 0;
  pointer-events: none;
}

.playful-checkbox--checked .playful-checkbox__sparkle {
  animation: playful-checkbox-sparkle 0.5s ease-out forwards;
}

.playful-checkbox__sparkle:nth-child(1) { --sparkle-angle: 0deg; }
.playful-checkbox__sparkle:nth-child(2) { --sparkle-angle: 60deg; }
.playful-checkbox__sparkle:nth-child(3) { --sparkle-angle: 120deg; }
.playful-checkbox__sparkle:nth-child(4) { --sparkle-angle: 180deg; }
.playful-checkbox__sparkle:nth-child(5) { --sparkle-angle: 240deg; }
.playful-checkbox__sparkle:nth-child(6) { --sparkle-angle: 300deg; }

@keyframes playful-checkbox-bounce {
  0%   { transform: scale(0.7); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes playful-checkbox-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes playful-checkbox-sparkle {
  0%   { opacity: 1; transform: rotate(var(--sparkle-angle, 0deg)) translateY(0) scale(1); }
  100% { opacity: 0; transform: rotate(var(--sparkle-angle, 0deg)) translateY(-18px) scale(0); }
}
</style>
