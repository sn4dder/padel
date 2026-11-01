<script setup lang="ts">
import { ref } from 'vue'
import BottomSheet from '../components/BottomSheet.vue'
import { getStandings } from '../mexicano'
import { current, history } from '../store'
import { theme } from '../theme'
import type { Tournament } from '../types'

const ThemeOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Lys' },
  { value: 'dark', label: 'Mørk' },
] as const

const showSettings = ref(false)

const getDate = (tournament: Tournament) =>
  new Date(tournament.createdAt).toLocaleDateString('nb', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

const getWinner = (tournament: Tournament) => getStandings(tournament)[0].player.name

const getActiveCount = (tournament: Tournament) =>
  tournament.players.filter(player => !player.leftRound).length
</script>

<template>
  <div class="home page">
    <button
      class="icon-button home__settings-button"
      aria-label="Innstillinger"
      @click="showSettings = true"
    >
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

    <header class="home__hero">
      <img src="/logo.svg" alt="" class="home__logo" />
      <h1 class="home__title">Padel</h1>
    </header>

    <RouterLink v-if="current" :to="`/turnering/${current.id}`" class="home__current card">
      <span class="home__badge">Pågår</span>
      <span class="home__round">Runde {{ current.rounds.length }}</span>
      <span class="home__meta">
        {{ getActiveCount(current) }} spillere · {{ current.courts }} baner
      </span>
      <span class="button button--primary button--block">Fortsett</span>
    </RouterLink>
    <RouterLink v-else to="/ny" class="button button--primary button--block home__new">
      Ny turnering
    </RouterLink>

    <section v-if="history.length" class="home__history">
      <h2 class="home__heading">Tidligere turneringer</h2>
      <RouterLink
        v-for="tournament in history"
        :key="tournament.id"
        :to="`/turnering/${tournament.id}`"
        class="home__past card"
      >
        <span class="home__past-info">
          <span class="home__date">{{ getDate(tournament) }}</span>
          <span class="home__meta">
            {{ tournament.players.length }} spillere · {{ tournament.rounds.length }} runder
          </span>
        </span>
        <span class="home__winner">🏆 {{ getWinner(tournament) }}</span>
      </RouterLink>
    </section>

    <BottomSheet v-model="showSettings" title="Innstillinger">
      <div class="home__settings">
        <h2 class="home__heading">Utseende</h2>
        <div class="options">
          <button
            v-for="option in ThemeOptions"
            :key="option.value"
            class="option"
            :class="{ 'option--active': theme === option.value }"
            @click="theme = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <button class="button button--primary button--block" @click="showSettings = false">
          Ferdig
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

<style lang="scss">
.home {
  position: relative;
  gap: 20px;

  &__settings-button {
    position: absolute;
    top: calc(20px + env(safe-area-inset-top));
    right: 16px;
  }

  &__settings {
    display: flex;
    flex-direction: column;
    gap: 14px;

    .button {
      margin-top: 14px;
    }
  }

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0 12px;
    text-align: center;
  }

  &__logo {
    width: 112px;
    height: 112px;
    margin-bottom: 14px;
    animation: home-float 4s ease-in-out infinite;
  }

  &__title {
    font-size: 44px;
    font-weight: 900;
    line-height: 1.1;
  }

  &__current {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    background: var(--color-mint);
    font-size: 13px;
    font-weight: 800;

    &::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2fbf71;
      animation: home-pulse 1.6s ease-in-out infinite;
    }
  }

  &__round {
    margin-top: 6px;
    font-size: 26px;
    font-weight: 900;
  }

  &__meta {
    color: var(--color-muted);
    font-size: 15px;
    font-weight: 700;
  }

  &__current .button {
    margin-top: 14px;
  }

  &__new {
    min-height: 64px;
    font-size: 19px;
  }

  &__history {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }

  &__heading {
    padding: 0 8px;
    font-size: 18px;
    font-weight: 900;
  }

  &__past {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 20px;
    transition: transform 0.2s var(--ease-bounce);

    &:active {
      transform: scale(0.98);
    }
  }

  &__past-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__date {
    font-weight: 800;
  }

  &__winner {
    flex-shrink: 0;
    max-width: 50%;
    overflow: hidden;
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    background: var(--color-lemon);
    font-size: 15px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@keyframes home-float {
  50% {
    transform: translateY(-6px) rotate(-4deg);
  }
}

@keyframes home-pulse {
  50% {
    opacity: 0.35;
  }
}
</style>
