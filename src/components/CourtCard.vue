<script setup lang="ts">
import { ref } from 'vue'
import ScoreSheet from './ScoreSheet.vue'

const props = defineProps<{
  court: number
  teams: string[][]
  pointsPerMatch: number
  disabled?: boolean
}>()

const score = defineModel<[number, number]>('score')

const pickedTeam = ref(0)
const showScoreSheet = ref(false)

const isWinner = (team: number) => score.value && score.value[team] > score.value[1 - team]

const onPick = (team: number) => {
  pickedTeam.value = team
  showScoreSheet.value = true
}

const onSelect = (value: number) => {
  const rest = props.pointsPerMatch - value
  score.value = pickedTeam.value ? [rest, value] : [value, rest]
  showScoreSheet.value = false
}
</script>

<template>
  <div class="court-card">
    <div class="court-card__header">
      <span class="court-card__court">Bane {{ court }}</span>
      <span v-if="score" class="court-card__done">Ferdig</span>
    </div>
    <template v-for="(names, team) in teams" :key="team">
      <div v-if="team" class="court-card__versus">mot</div>
      <button
        class="court-card__team"
        :class="[`court-card__team--${team + 1}`, { 'court-card__team--winner': isWinner(team) }]"
        :disabled="disabled"
        @click="onPick(team)"
      >
        <span class="court-card__names">
          <span v-for="(name, index) in names" :key="index">{{ name }}</span>
        </span>
        <Transition name="court-card__pop" mode="out-in">
          <span :key="score?.[team]" class="court-card__score">{{ score?.[team] ?? '–' }}</span>
        </Transition>
      </button>
    </template>
    <ScoreSheet
      v-model="showScoreSheet"
      :title="teams[pickedTeam].join(' og ')"
      :max="pointsPerMatch"
      :selected="score?.[pickedTeam]"
      @select="onSelect"
    />
  </div>
</template>

<style lang="scss">
.court-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 28px;
    padding: 0 8px 2px;
  }

  &__court {
    color: var(--color-muted);
    font-size: 15px;
    font-weight: 800;
  }

  &__done {
    padding: 3px 12px;
    border-radius: var(--radius-pill);
    background: var(--color-primary);
    color: var(--color-on-primary);
    font-size: 13px;
    font-weight: 800;
    animation: pop-in 0.35s var(--ease-bounce);
  }

  &__team {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 12px 12px 12px 20px;
    border-radius: var(--radius-md);
    text-align: left;
    transition: transform 0.2s var(--ease-bounce);

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &--1 {
      background: var(--color-team-1);
    }

    &--2 {
      background: var(--color-team-2);
    }
  }

  &__names {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.3;
  }

  &__score {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    font-size: 23px;
    font-weight: 900;
    transition: background-color 0.2s;
  }

  &__team--winner &__score {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  &__versus {
    align-self: center;
    margin: -2px 0;
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 800;
  }

  &__pop-enter-active {
    transition:
      transform 0.4s var(--ease-bounce),
      opacity 0.2s;
  }

  &__pop-leave-active {
    transition: opacity 0.1s;
  }

  &__pop-enter-from {
    opacity: 0;
    transform: scale(0.5);
  }

  &__pop-leave-to {
    opacity: 0;
  }
}
</style>
