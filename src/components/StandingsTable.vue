<script setup lang="ts">
import { computed } from 'vue'
import { getStandings } from '../mexicano'
import type { Tournament } from '../types'

const props = defineProps<{ tournament: Tournament }>()

const standings = computed(() => getStandings(props.tournament))

const getStreakLabel = (streak: number) => {
  if (streak > 0) return `🔥 ${streak}`
  if (streak < 0) return `🧊 ${-streak}`
  return '–'
}
</script>

<template>
  <div class="standings-table">
    <table class="standings-table__table">
      <thead>
        <tr>
          <th>#</th>
          <th class="standings-table__name">Navn</th>
          <th>V</th>
          <th>T</th>
          <th>Rekke</th>
          <th>+/-</th>
          <th>Poeng</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(standing, index) in standings"
          :key="standing.player.id"
          :class="{ 'standings-table__row--left': standing.player.leftRound }"
        >
          <td>
            <span class="standings-table__rank" :class="`standings-table__rank--${index + 1}`">
              {{ standing.player.leftRound ? '–' : index + 1 }}
            </span>
          </td>
          <td class="standings-table__name">
            {{ standing.player.name }}
            <span v-if="standing.player.leftRound" class="standings-table__tag">gått hjem</span>
          </td>
          <td>{{ standing.wins }}</td>
          <td>{{ standing.losses }}</td>
          <td class="standings-table__streak">{{ getStreakLabel(standing.streak) }}</td>
          <td>{{ standing.diff > 0 ? `+${standing.diff}` : standing.diff }}</td>
          <td class="standings-table__points">{{ standing.points.toLocaleString('nb') }}</td>
        </tr>
      </tbody>
    </table>
    <p class="standings-table__hint">
      V = seiere · T = tap · 🔥 seiere på rad · 🧊 tap på rad · De som hviler får
      {{ (tournament.pointsPerMatch / 2).toLocaleString('nb') }} poeng per runde
    </p>
  </div>
</template>

<style lang="scss">
.standings-table {
  padding: 8px 10px 16px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th {
    padding: 10px 6px;
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 800;
    text-align: right;
  }

  td {
    padding: 8px 6px;
    font-weight: 700;
    text-align: right;
  }

  tbody tr + tr td {
    border-top: 1px solid var(--color-line);
  }

  th:first-child,
  td:first-child {
    width: 44px;
    text-align: left;
  }

  &__name {
    width: 100%;
    max-width: 0;
    overflow: hidden;
    text-align: left !important;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__rank {
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-bg);
    font-size: 14px;
    font-weight: 900;

    &--1 {
      background: var(--color-primary);
    }

    &--2 {
      background: var(--color-team-1);
    }

    &--3 {
      background: var(--color-team-2);
    }
  }

  &__points {
    font-size: 18px;
    font-weight: 900 !important;
  }

  &__streak {
    white-space: nowrap;
  }

  &__tag {
    margin-left: 6px;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--color-bg);
    color: var(--color-muted);
    font-size: 12px;
    font-weight: 800;
  }

  &__row--left {
    opacity: 0.4;
  }

  &__hint {
    margin-top: 12px;
    padding: 0 6px;
    color: var(--color-muted);
    font-size: 13px;
    text-align: center;
  }
}
</style>
