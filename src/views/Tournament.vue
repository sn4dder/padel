<script setup lang="ts">
import { computed, ref } from 'vue'
import CourtCard from '../components/CourtCard.vue'
import PlayersSheet from '../components/PlayersSheet.vue'
import ShareSheet from '../components/ShareSheet.vue'
import StandingsTable from '../components/StandingsTable.vue'
import { finishTournament, nextRound } from '../store'
import type { Tournament } from '../types'

const Tabs = [
  { value: 'matches', label: 'Kamper' },
  { value: 'standings', label: 'Tabell' },
]

const props = defineProps<{ tournament: Tournament }>()

const isFinished = computed(() => Boolean(props.tournament.finishedAt))

const tab = ref(isFinished.value ? 'standings' : 'matches')
const viewedIndex = ref(props.tournament.rounds.length - 1)
const showPlayers = ref(false)
const showShare = ref(false)

const round = computed(() => props.tournament.rounds[viewedIndex.value])
const isLatest = computed(() => viewedIndex.value === props.tournament.rounds.length - 1)

const title = new Date(props.tournament.createdAt).toLocaleDateString('nb', {
  day: 'numeric',
  month: 'long',
})

const activeCount = computed(
  () =>
    props.tournament.players.filter(player => !player.leftRound && !player.skipsNextRound).length,
)
const scoredCount = computed(() => round.value.matches.filter(match => match.score).length)
const canStartNextRound = computed(
  () => activeCount.value >= 4 && scoredCount.value === round.value.matches.length,
)

const nextRoundLabel = computed(() => {
  if (activeCount.value < 4) return 'Trenger minst 4 spillere'
  if (scoredCount.value < round.value.matches.length)
    return `${scoredCount.value} av ${round.value.matches.length} baner ferdig`
  return 'Neste runde'
})

const getName = (id: string) => props.tournament.players.find(player => player.id === id).name

const onNextRound = () => {
  nextRound(props.tournament)
  viewedIndex.value = props.tournament.rounds.length - 1
  tab.value = 'matches'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onFinish = () => {
  if (!confirm('Avslutte turneringen? Den flyttes til tidligere turneringer.')) return
  finishTournament(props.tournament)
}
</script>

<template>
  <div class="tournament page">
    <header class="tournament__header">
      <RouterLink to="/" class="icon-button" aria-label="Tilbake">‹</RouterLink>
      <h1 class="tournament__title">{{ title }}</h1>
      <button v-if="!isFinished" class="button button--small" @click="showPlayers = true">
        Spillere
      </button>
    </header>

    <div class="tournament__tabs">
      <button
        v-for="option in Tabs"
        :key="option.value"
        class="tournament__tab"
        :class="{ 'tournament__tab--active': tab === option.value }"
        @click="tab = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <template v-if="tab === 'matches'">
      <div class="tournament__round-nav">
        <button
          class="icon-button"
          :disabled="!viewedIndex"
          aria-label="Forrige runde"
          @click="viewedIndex--"
        >
          ‹
        </button>
        <span class="tournament__round-label">Runde {{ viewedIndex + 1 }}</span>
        <button
          class="icon-button"
          :disabled="isLatest"
          aria-label="Neste runde"
          @click="viewedIndex++"
        >
          ›
        </button>
      </div>
      <Transition name="tournament__round" mode="out-in">
        <div :key="viewedIndex" class="tournament__round">
          <CourtCard
            v-for="match in round.matches"
            :key="match.court"
            v-model:score="match.score"
            :court="match.court"
            :teams="match.teams.map(team => team.map(getName))"
            :pointsPerMatch="tournament.pointsPerMatch"
            :disabled="isFinished"
          />
          <div v-if="round.resting.length" class="tournament__resting">
            <h2 class="tournament__resting-title">Hviler</h2>
            <ul class="tournament__chips">
              <li v-for="id in round.resting" :key="id" class="tournament__chip">
                {{ getName(id) }}
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </template>

    <template v-else>
      <StandingsTable :tournament="tournament" />
      <button class="button button--block" @click="showShare = true">Del tabell</button>
      <button
        v-if="!isFinished"
        class="button button--ghost button--danger button--block"
        @click="onFinish"
      >
        Avslutt turneringen
      </button>
    </template>

    <div v-if="!isFinished && isLatest" class="tournament__footer">
      <button
        class="button button--primary button--block"
        :disabled="!canStartNextRound"
        @click="onNextRound"
      >
        {{ nextRoundLabel }}
      </button>
    </div>

    <PlayersSheet v-model="showPlayers" :tournament="tournament" />
    <ShareSheet v-model="showShare" :tournament="tournament" />
  </div>
</template>

<style lang="scss">
.tournament {
  &__header {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    align-items: center;
    gap: 12px;
  }

  &__title {
    font-size: 26px;
    font-weight: 900;
  }

  &__tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 5px;
    border-radius: var(--radius-pill);
    background: var(--color-surface-soft);
  }

  &__tab {
    height: 46px;
    border-radius: var(--radius-pill);
    color: var(--color-muted);
    font-weight: 800;
    transition:
      background-color 0.25s,
      color 0.25s,
      box-shadow 0.25s;

    &--active {
      background: var(--color-surface);
      box-shadow: var(--shadow-sm);
      color: var(--color-ink);
    }
  }

  &__round-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  &__round-label {
    min-width: 110px;
    font-size: 20px;
    font-weight: 900;
    text-align: center;
  }

  &__round {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__round-enter-active,
  &__round-leave-active {
    transition:
      opacity 0.2s,
      transform 0.3s var(--ease-out);
  }

  &__round-enter-from {
    opacity: 0;
    transform: translateX(24px);
  }

  &__round-leave-to {
    opacity: 0;
    transform: translateX(-24px);
  }

  &__resting {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-radius: var(--radius-lg);
    background: var(--color-surface-soft);
  }

  &__resting-title {
    padding-left: 4px;
    color: var(--color-muted);
    font-size: 15px;
    font-weight: 800;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 16px;
    border-radius: var(--radius-pill);
    background: var(--color-team-1);
    font-weight: 700;
    animation: pop-in 0.35s var(--ease-bounce);
  }

  &__footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    max-width: 560px;
    margin: 0 auto;
    padding: 24px 16px calc(16px + env(safe-area-inset-bottom));
    background: linear-gradient(transparent, var(--color-bg-bottom) 40%);
  }
}
</style>
