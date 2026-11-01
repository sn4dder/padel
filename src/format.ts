export function formatStreak(streak: number) {
  if (streak >= 3) return `🔥 ${streak}`
  if (streak <= -3) return `🧊 ${-streak}`
  return ''
}

export function formatDiff(diff: number) {
  return diff > 0 ? `+${diff}` : `${diff}`
}
