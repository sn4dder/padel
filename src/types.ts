export type Player = { id: string; name: string; leftRound?: number; skipsNextRound?: boolean }

export type Match = {
  court: number
  teams: [[string, string], [string, string]]
  score?: [number, number]
}

export type Round = { matches: Match[]; resting: string[] }

export type Tournament = {
  id: string
  createdAt: string
  finishedAt?: string
  courts: number
  pointsPerMatch: number
  players: Player[]
  rounds: Round[]
}
