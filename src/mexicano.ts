import type { Match, Player, Round, Tournament } from './types'

function shuffle<T>(items: T[]) {
  return items
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item)
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function isComplete(round: Round) {
  return round.matches.every(match => match.score)
}

export function isPlaying(round: Round, player: Player) {
  return round.matches.some(match => match.teams.flat().includes(player.id))
}

function getStreak(outcomes: number[]) {
  const last = outcomes.at(-1)
  if (!last) return 0
  const length = outcomes.toReversed().findIndex(outcome => outcome !== last)
  return last * (length === -1 ? outcomes.length : length)
}

function getRoundsWithoutMatch(tournament: Tournament, player: Player) {
  return tournament.rounds
    .slice(0, player.leftRound)
    .filter(round => isComplete(round) && !isPlaying(round, player)).length
}

function getResults(tournament: Tournament, player: Player) {
  return tournament.rounds.flatMap(round =>
    round.matches.flatMap(({ teams, score }) => {
      const team = teams.findIndex(team => team.includes(player.id))
      if (!score || team === -1) return []
      return [{ scored: score[team], conceded: score[1 - team] }]
    }),
  )
}

export function getStandings(tournament: Tournament) {
  const standings = tournament.players
    .map(player => {
      const results = getResults(tournament, player)
      const scored = sum(results.map(result => result.scored))
      const conceded = sum(results.map(result => result.conceded))
      const outcomes = results.map(result => Math.sign(result.scored - result.conceded))
      return {
        player,
        points:
          scored + (getRoundsWithoutMatch(tournament, player) * tournament.pointsPerMatch) / 2,
        diff: scored - conceded,
        wins: outcomes.filter(outcome => outcome > 0).length,
        losses: outcomes.filter(outcome => outcome < 0).length,
        streak: getStreak(outcomes),
      }
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.diff - a.diff ||
        b.wins - a.wins ||
        a.player.name.localeCompare(b.player.name, 'nb'),
    )
  return [
    ...standings.filter(standing => !standing.player.leftRound),
    ...standings.filter(standing => standing.player.leftRound),
  ]
}

function getResting(tournament: Tournament, ranked: Player[], count: number) {
  if (!count) return []
  const rests = ranked.map(player => getRoundsWithoutMatch(tournament, player))
  const threshold = rests.toSorted((a, b) => a - b)[count - 1]
  const mustRest = ranked.filter((_, index) => rests[index] < threshold)
  const due = ranked.filter((_, index) => rests[index] === threshold)
  const size = count - mustRest.length
  const start =
    due.length % size
      ? Math.floor(Math.random() * due.length)
      : size * Math.floor((Math.random() * due.length) / size)
  const group = Array.from({ length: size }, (_, index) => due[(start + index) % due.length])
  return [...mustRest, ...group]
}

export function createRound(tournament: Tournament) {
  const available = tournament.players.filter(player => !player.leftRound)
  const active = available.filter(player => !player.skipsNextRound)
  const skipping = available.filter(player => player.skipsNextRound)
  const courts = Math.min(tournament.courts, Math.floor(active.length / 4))
  const ranked = tournament.rounds.length
    ? getStandings(tournament)
        .map(standing => standing.player)
        .filter(player => active.includes(player))
    : shuffle(active)
  const resting = getResting(tournament, ranked, active.length - courts * 4)
  const playing = ranked.filter(player => !resting.includes(player))
  const matches: Match[] = Array.from({ length: courts }, (_, index) => {
    const [first, second, third, fourth] = playing.slice(index * 4, index * 4 + 4)
    return {
      court: index + 1,
      teams: [
        [first.id, fourth.id],
        [second.id, third.id],
      ],
    }
  })
  return { matches, resting: [...resting, ...skipping].map(player => player.id) }
}
