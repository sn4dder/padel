<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BottomSheet from './BottomSheet.vue'

const open = defineModel<boolean>({ required: true })

const props = defineProps<{
  teams: string[][]
  team: number
  pointsPerMatch: number
  hasDecidingPoint?: boolean
  score?: [number, number]
}>()

const emit = defineEmits<{ (e: 'select', score: [number, number]): void }>()

const isDeciding = ref(false)

const half = computed(() => props.pointsPerMatch / 2)
const values = computed(() => Array.from({ length: props.pointsPerMatch + 1 }, (_, value) => value))

const selected = computed(() => {
  if (!props.score) return
  if (props.score[0] + props.score[1] > props.pointsPerMatch) return half.value
  return props.score[props.team]
})

const title = computed(() =>
  isDeciding.value ? 'Avgjørende poeng' : props.teams[props.team].join(' og '),
)

const subtitle = computed(() => {
  if (isDeciding.value) return `Det står ${half.value}–${half.value}. Hvem vant siste poeng?`
  return `Motstanderne får resten av ${props.pointsPerMatch}`
})

watch(open, isOpen => {
  if (isOpen) isDeciding.value = false
})

const onSelect = (value: number) => {
  if (props.hasDecidingPoint && value === half.value) {
    isDeciding.value = true
    return
  }
  const rest = props.pointsPerMatch - value
  emit('select', props.team ? [rest, value] : [value, rest])
}

const onDecide = (winner: number) => {
  emit('select', winner ? [half.value, half.value + 1] : [half.value + 1, half.value])
}
</script>

<template>
  <BottomSheet v-model="open" :title="title" :subtitle="subtitle">
    <div v-if="isDeciding" class="score-sheet__teams">
      <button
        v-for="(names, index) in teams"
        :key="index"
        class="score-sheet__team"
        :class="`score-sheet__team--${index + 1}`"
        @click="onDecide(index)"
      >
        <span v-for="name in names" :key="name">{{ name }}</span>
      </button>
    </div>
    <div v-else class="score-sheet__values">
      <button
        v-for="value in values"
        :key="value"
        class="score-sheet__value"
        :class="{ 'score-sheet__value--selected': value === selected }"
        @click="onSelect(value)"
      >
        {{ value }}
      </button>
    </div>
  </BottomSheet>
</template>

<style lang="scss">
.score-sheet {
  &__values {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 10px;
  }

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
      color: var(--color-on-primary);
    }
  }

  &__teams {
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: pop-in 0.35s var(--ease-bounce);
  }

  &__team {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 18px 20px;
    border-radius: var(--radius-md);
    font-size: 18px;
    font-weight: 800;
    line-height: 1.3;
    text-align: left;
    transition: transform 0.2s var(--ease-bounce);

    &:active {
      transform: scale(0.98);
    }

    &--1 {
      background: var(--color-team-1);
    }

    &--2 {
      background: var(--color-team-2);
    }
  }
}
</style>
