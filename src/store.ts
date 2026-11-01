import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import { createRound, isPlaying } from './mexicano'
import type { Player, Tournament } from './types'

export const tournaments = useStorage<Tournament[]>('padel-tournaments', [])

export const current = computed(() => tournaments.value.find(tournament => !tournament.finishedAt))

export const history = computed(() =>
  tournaments.value.filter(tournament => tournament.finishedAt).toReversed(),
)

export const createId = () => Math.random().toString(36).slice(2, 10)

export function startTournament(options: {
  players: { id: string; name: string; isLate: boolean }[]
  courts: number
  pointsPerMatch: number
}) {
  const { players, courts, pointsPerMatch } = options
  const tournament: Tournament = {
    id: createId(),
    createdAt: new Date().toISOString(),
    courts,
    pointsPerMatch,
    players: players.map(({ id, name, isLate }) => ({ id, name, skipsNextRound: isLate })),
    rounds: [],
  }
  nextRound(tournament)
  tournaments.value.push(tournament)
  return tournament
}

export function nextRound(tournament: Tournament) {
  tournament.rounds.push(createRound(tournament))
  tournament.players.forEach(player => delete player.skipsNextRound)
}

export function addPlayer(tournament: Tournament, name: string) {
  tournament.players.push({ id: createId(), name })
}

export function removePlayer(tournament: Tournament, player: Player) {
  const isDrawn = tournament.rounds.some(
    round => round.resting.includes(player.id) || isPlaying(round, player),
  )
  if (!isDrawn) return tournament.players.splice(tournament.players.indexOf(player), 1)
  player.leftRound = tournament.rounds.length
}

export function restorePlayer(player: Player) {
  delete player.leftRound
}

export function finishTournament(tournament: Tournament) {
  tournament.finishedAt = new Date().toISOString()
}
