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
      return {
        player,
        points:
          scored + (getRoundsWithoutMatch(tournament, player) * tournament.pointsPerMatch) / 2,
        diff: scored - conceded,
        wins: results.filter(result => result.scored > result.conceded).length,
        played: results.length,
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

export function createRound(tournament: Tournament) {
  const available = tournament.players.filter(player => !player.leftRound)
  const active = available.filter(player => !player.skipsNextRound)
  const skipping = available.filter(player => player.skipsNextRound)
  const courts = Math.min(tournament.courts, Math.floor(active.length / 4))
  const resting = shuffle(active)
    .sort((a, b) => getRoundsWithoutMatch(tournament, a) - getRoundsWithoutMatch(tournament, b))
    .slice(0, active.length - courts * 4)
  const ranked = tournament.rounds.length
    ? getStandings(tournament).map(standing => standing.player)
    : shuffle(active)
  const playing = ranked.filter(player => active.includes(player) && !resting.includes(player))
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
