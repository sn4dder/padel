<script setup lang="ts">
import { computed } from 'vue'
import BottomSheet from './BottomSheet.vue'

const open = defineModel<boolean>({ required: true })

const props = defineProps<{ title: string; max: number; selected?: number }>()

const emit = defineEmits<{ (e: 'select', value: number): void }>()

const values = computed(() => Array.from({ length: props.max + 1 }, (_, value) => value))
</script>

<template>
  <BottomSheet v-model="open" :title="title" :subtitle="`Motstanderne får resten av ${max}`">
    <div class="score-sheet">
      <button
        v-for="value in values"
        :key="value"
        class="score-sheet__value"
        :class="{ 'score-sheet__value--selected': value === selected }"
        @click="emit('select', value)"
      >
        {{ value }}
      </button>
    </div>
  </BottomSheet>
</template>

<style lang="scss">
.score-sheet {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 10px;

  &__value {
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--color-bg);
    font-size: 21px;
    font-weight: 800;
    transition:
      transform 0.2s var(--ease-bounce),
      background-color 0.2s;

    &:active {
      transform: scale(0.88);
    }

    &--selected {
      background: var(--color-primary);
    }
  }
}
</style>
