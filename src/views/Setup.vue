<script setup lang="ts">
import { useFocus, useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomSheet from '../components/BottomSheet.vue'
import Stepper from '../components/Stepper.vue'
import Toggle from '../components/Toggle.vue'
import { createId, startTournament } from '../store'

const PointsOptions = [16, 21, 24, 32]

const router = useRouter()

const players = useStorage<{ id: string; name: string; isLate: boolean }[]>(
  'padel-setup-players',
  [],
)
const name = ref('')
const courts = useStorage('padel-setup-courts', 4)
const pointsPerMatch = useStorage('padel-setup-points', 16)
const showSettings = ref(false)
const nameInput = ref<HTMLInputElement>()

const { focused: isTyping } = useFocus(nameInput)

const lateCount = computed(() => players.value.filter(player => player.isLate).length)
const courtsInUse = computed(() => Math.min(courts.value, Math.floor(players.value.length / 4)))
const canStart = computed(() => players.value.length - lateCount.value >= 4)

const summary = computed(() => {
  if (players.value.length < 4) return
  if (!canStart.value) return 'Minst 4 må være med i første runde'
  const resting = players.value.length - courtsInUse.value * 4
  return [
    `${players.value.length} spillere`,
    courtsInUse.value === 1 ? '1 bane' : `${courtsInUse.value} baner`,
    resting ? `${resting} hviler per runde` : 'ingen hviler',
    lateCount.value ? `${lateCount.value} kommer sent` : null,
  ]
    .filter(Boolean)
    .join(' · ')
})

const onAdd = () => {
  players.value.unshift({ id: createId(), name: name.value.trim(), isLate: false })
  name.value = ''
}

const onPaste = (event: ClipboardEvent) => {
  const lines = event.clipboardData
    .getData('text')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return
  event.preventDefault()
  players.value.unshift(...lines.map(line => ({ id: createId(), name: line, isLate: false })))
}

const onStart = () => {
  const tournament = startTournament({
    players: players.value,
    courts: courts.value,
    pointsPerMatch: pointsPerMatch.value,
  })
  players.value = []
  router.replace(`/turnering/${tournament.id}`)
}
</script>

<template>
  <div class="setup page">
    <header class="setup__header">
      <RouterLink to="/" class="icon-button" aria-label="Tilbake">‹</RouterLink>
      <h1 class="setup__title">Ny turnering</h1>
      <button class="icon-button" aria-label="Innstillinger" @click="showSettings = true">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        >
          <path d="M4 7h9M19 7h1M4 17h3M13 17h7" />
          <circle cx="16" cy="7" r="2.5" />
          <circle cx="10" cy="17" r="2.5" />
        </svg>
      </button>
    </header>

    <section class="setup__section card">
      <h2 class="setup__heading">
        Spillere
        <span v-if="players.length" class="setup__count">{{ players.length }}</span>
      </h2>
      <form class="setup__add" @submit.prevent="onAdd">
        <input
          ref="nameInput"
          v-model="name"
          class="input"
          placeholder="Skriv et navn"
          autocapitalize="words"
          @paste="onPaste"
        />
        <button class="button button--primary" :disabled="!name.trim()" @pointerdown.prevent>
          Legg til
        </button>
      </form>
      <div v-if="players.length" class="setup__players">
        <div class="setup__players-header">
          <span class="setup__late-label">Kommer sent</span>
        </div>
        <ul class="setup__list">
          <li
            v-for="(player, index) in players"
            :key="player.id"
            class="setup__player"
            :class="{ 'setup__player--late': player.isLate }"
          >
            <span class="setup__player-name">{{ player.name }}</span>
            <Toggle v-model="player.isLate" :label="`${player.name} kommer sent`" />
            <button
              class="setup__remove"
              :aria-label="`Fjern ${player.name}`"
              @click="players.splice(index, 1)"
            >
              ×
            </button>
          </li>
        </ul>
        <p class="setup__hint">De som kommer sent, hviler første runde.</p>
      </div>
      <p v-else class="setup__hint">Tips: lim inn en liste med ett navn per linje.</p>
    </section>

    <BottomSheet v-model="showSettings" title="Innstillinger">
      <div class="setup__settings">
        <section class="setup__setting">
          <h2 class="setup__heading">Format</h2>
          <div class="setup__formats">
            <span class="option option--active">Mexicano</span>
          </div>
          <p class="setup__hint">
            Første runde trekkes tilfeldig. Deretter settes lagene etter tabellen, så du spiller med
            og mot folk på ditt nivå.
          </p>
        </section>
        <section class="setup__setting">
          <h2 class="setup__heading">Baner</h2>
          <Stepper v-model="courts" :min="1" :max="12" />
        </section>
        <section class="setup__setting">
          <h2 class="setup__heading">Poeng per kamp</h2>
          <div class="options">
            <button
              v-for="option in PointsOptions"
              :key="option"
              class="option"
              :class="{ 'option--active': pointsPerMatch === option }"
              @click="pointsPerMatch = option"
            >
              {{ option }}
            </button>
          </div>
        </section>
        <button class="button button--primary button--block" @click="showSettings = false">
          Ferdig
        </button>
      </div>
    </BottomSheet>

    <Transition name="setup__footer">
      <div v-if="!isTyping" class="setup__footer">
        <p v-if="summary" class="setup__summary">{{ summary }}</p>
        <button class="button button--primary button--block" :disabled="!canStart" @click="onStart">
          Start turneringen
        </button>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
.setup {
  padding-bottom: calc(160px + env(safe-area-inset-bottom));

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__title {
    flex: 1;
    font-size: 28px;
    font-weight: 900;
  }

  &__section,
  &__setting {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__settings {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 900;
  }

  &__count {
    display: inline-grid;
    place-items: center;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    border-radius: var(--radius-pill);
    background: var(--color-primary);
    color: var(--color-on-primary);
    font-size: 14px;
    animation: pop-in 0.3s var(--ease-bounce);
  }

  &__add {
    display: flex;
    gap: 8px;
  }

  &__hint {
    color: var(--color-muted);
    font-size: 14px;
  }

  &__players-header,
  &__player {
    display: grid;
    grid-template-columns: 1fr 96px 36px;
    align-items: center;
    justify-items: center;
  }

  &__late-label {
    grid-column: 2;
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 800;
  }

  &__list {
    margin: 4px 0 12px;
    padding: 0;
    list-style: none;
  }

  &__player {
    min-height: 56px;
    animation: setup-row-in 0.3s var(--ease-out);

    & + & {
      border-top: 1px solid var(--color-line);
    }
  }

  &__player-name {
    justify-self: stretch;
    overflow: hidden;
    padding-left: 4px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s;
  }

  &__player--late &__player-name {
    color: var(--color-muted);
  }

  &__remove {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-bg);
    font-size: 18px;
    font-weight: 800;
    line-height: 1;
    transition: transform 0.2s var(--ease-bounce);

    &:active {
      transform: scale(0.88);
    }
  }

  &__formats {
    display: flex;

    .option {
      padding: 0 28px;
    }
  }

  &__footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 560px;
    margin: 0 auto;
    padding: 24px 16px calc(16px + env(safe-area-inset-bottom));
    background: linear-gradient(transparent, var(--color-bg-bottom) 24px);
  }

  &__footer-enter-active {
    transition:
      opacity 0.25s 0.2s,
      transform 0.3s 0.2s var(--ease-out);
  }

  &__footer-enter-from {
    opacity: 0;
    transform: translateY(16px);
  }

  &__summary {
    color: var(--color-muted);
    font-size: 15px;
    font-weight: 700;
    text-align: center;
  }
}

@keyframes setup-row-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}
</style>
