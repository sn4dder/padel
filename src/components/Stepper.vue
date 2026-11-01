<script setup lang="ts">
const value = defineModel<number>({ required: true })

defineProps<{ min: number; max: number }>()
</script>

<template>
  <div class="stepper">
    <button class="stepper__button" :disabled="value <= min" aria-label="Færre" @click="value--">
      −
    </button>
    <Transition name="stepper__value" mode="out-in">
      <span :key="value" class="stepper__value">{{ value }}</span>
    </Transition>
    <button class="stepper__button" :disabled="value >= max" aria-label="Flere" @click="value++">
      +
    </button>
  </div>
</template>

<style lang="scss">
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  border-radius: var(--radius-pill);
  background: var(--color-bg);

  &__button {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    transition: transform 0.2s var(--ease-bounce);

    &:active:not(:disabled) {
      transform: scale(0.88);
    }

    &:disabled {
      opacity: 0.4;
    }
  }

  &__value {
    font-size: 30px;
    font-weight: 900;
  }

  &__value-enter-active {
    transition:
      transform 0.3s var(--ease-bounce),
      opacity 0.15s;
  }

  &__value-leave-active {
    transition: opacity 0.08s;
  }

  &__value-enter-from {
    opacity: 0;
    transform: scale(0.6);
  }

  &__value-leave-to {
    opacity: 0;
  }
}
</style>
