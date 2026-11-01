<script setup lang="ts">
import { computed, ref } from 'vue'
import { addPlayer, removePlayer, restorePlayer } from '../store'
import type { Tournament } from '../types'
import BottomSheet from './BottomSheet.vue'
import Toggle from './Toggle.vue'

const open = defineModel<boolean>({ required: true })

const props = defineProps<{ tournament: Tournament }>()

const name = ref('')

const activePlayers = computed(() => props.tournament.players.filter(player => !player.leftRound))
const restSlots = computed(() => {
  const count = activePlayers.value.length
  return count - Math.min(props.tournament.courts, Math.floor(count / 4)) * 4
})
const skipCount = computed(() => activePlayers.value.filter(player => player.skipsNextRound).length)

const restLabel = computed(() => {
  if (!restSlots.value) return 'Ingen kan hvile neste runde, alle trengs på banene.'
  return `Plass til ${restSlots.value} som hviler neste runde · ${skipCount.value} valgt`
})

const onAdd = () => {
  addPlayer(props.tournament, name.value.trim())
  name.value = ''
}
</script>

<template>
  <BottomSheet v-model="open" title="Spillere" subtitle="Endringer gjelder fra neste runde">
    <div class="players-sheet">
      <form class="players-sheet__add" @submit.prevent="onAdd">
        <input v-model="name" class="input" placeholder="Ny spiller" autocapitalize="words" />
        <button class="button button--primary" :disabled="!name.trim()" @pointerdown.prevent>
          Legg til
        </button>
      </form>
      <p class="players-sheet__hint">
        De som hviler, og nye spillere får
        {{ (tournament.pointsPerMatch / 2).toLocaleString('nb') }} poeng for hver runde de står
        over.
      </p>
      <p class="players-sheet__hint">{{ restLabel }}</p>
      <div class="players-sheet__header">
        <span class="players-sheet__toggle-label">Hviler neste runde</span>
      </div>
      <ul class="players-sheet__list">
        <li
          v-for="player in tournament.players"
          :key="player.id"
          class="players-sheet__player"
          :class="{ 'players-sheet__player--left': player.leftRound }"
        >
          <span class="players-sheet__name">{{ player.name }}</span>
          <button
            v-if="player.leftRound"
            class="button button--small players-sheet__restore"
            @click="restorePlayer(player)"
          >
            Tilbake
          </button>
          <template v-else>
            <Toggle
              v-model="player.skipsNextRound"
              :label="`${player.name} hviler neste runde`"
              :disabled="!player.skipsNextRound && skipCount >= restSlots"
            />
            <button
              class="button button--small button--ghost button--danger players-sheet__remove"
              @click="removePlayer(tournament, player)"
            >
              Gått hjem
            </button>
          </template>
        </li>
      </ul>
    </div>
  </BottomSheet>
</template>

<style lang="scss">
.players-sheet {
  &__add {
    display: flex;
    gap: 8px;
  }

  &__hint {
    margin: 10px 8px 8px;
    color: var(--color-muted);
    font-size: 14px;
  }

  &__header,
  &__player {
    display: grid;
    grid-template-columns: 1fr 96px 112px;
    align-items: center;
    justify-items: center;
  }

  &__header {
    margin-top: 8px;
  }

  &__toggle-label {
    grid-column: 2;
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 800;
    line-height: 1.2;
    text-align: center;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__player {
    min-height: 56px;

    & + & {
      border-top: 1px solid var(--color-line);
    }
  }

  &__name {
    justify-self: stretch;
    overflow: hidden;
    padding-left: 8px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__player--left &__name {
    color: var(--color-muted);
    text-decoration: line-through;
  }

  &__remove {
    justify-self: end;
  }

  &__restore {
    grid-column: 2 / 4;
    justify-self: end;
  }
}
</style>
