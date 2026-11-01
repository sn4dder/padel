<script setup lang="ts">
const value = defineModel<boolean>({ default: false })

defineProps<{ label: string }>()
</script>

<template>
  <button
    class="toggle"
    :class="{ 'toggle--on': value }"
    role="switch"
    :aria-checked="value"
    :aria-label="label"
    @click="value = !value"
  >
    <span class="toggle__thumb" />
  </button>
</template>

<style lang="scss">
.toggle {
  position: relative;
  width: 52px;
  height: 32px;
  border-radius: var(--radius-pill);
  background: #dde3ec;
  transition: background-color 0.25s;

  &::before {
    content: '';
    position: absolute;
    inset: -8px;
  }

  &__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    transition: transform 0.3s var(--ease-bounce);
  }

  &--on {
    background: var(--color-primary);
  }

  &--on &__thumb {
    transform: translateX(20px);
  }
}
</style>
