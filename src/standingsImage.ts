import { formatDiff, formatStreak } from './format'
import { getStandings } from './mexicano'
import type { Tournament } from './types'

type Standing = ReturnType<typeof getStandings>[number]

const Layout = {
  width: 540,
  scale: 2,
  padding: 16,
  headerHeight: 44,
  rowHeight: 52,
  rankX: 36,
  nameX: 68,
  streakX: 316,
}

const Columns: {
  label: string
  x: number
  weight: number
  getValue: (standing: Standing) => string
}[] = [
  { label: 'V', x: 346, weight: 700, getValue: standing => `${standing.wins}` },
  { label: 'T', x: 380, weight: 700, getValue: standing => `${standing.losses}` },
  { label: '+/-', x: 450, weight: 700, getValue: standing => formatDiff(standing.diff) },
  {
    label: 'Poeng',
    x: 524,
    weight: 900,
    getValue: standing => standing.points.toLocaleString('nb'),
  },
]

const RankColors = ['primary', 'team-1', 'team-2']

const getColor = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()

function setFont(context: CanvasRenderingContext2D, weight: number, size: number, color: string) {
  context.font = `${weight} ${size}px "Nunito Variable", sans-serif`
  context.fillStyle = color
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text
  let fitted = text
  while (fitted && context.measureText(`${fitted}…`).width > maxWidth) fitted = fitted.slice(0, -1)
  return `${fitted}…`
}

export async function createStandingsImage(tournament: Tournament) {
  const standings = getStandings(tournament)
  const { width, scale, padding, headerHeight, rowHeight, rankX, nameX, streakX } = Layout
  const height = headerHeight + standings.length * rowHeight + padding

  await document.fonts.load('900 16px "Nunito Variable"')

  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const context = canvas.getContext('2d')
  context.scale(scale, scale)

  context.fillStyle = getColor('surface')
  context.fillRect(0, 0, width, height)

  context.textBaseline = 'middle'
  const headerY = headerHeight / 2 + 4
  setFont(context, 800, 13, getColor('muted'))
  context.textAlign = 'center'
  context.fillText('#', rankX, headerY)
  context.textAlign = 'left'
  context.fillText('Navn', nameX, headerY)
  context.textAlign = 'right'
  Columns.forEach(column => context.fillText(column.label, column.x, headerY))

  standings.forEach((standing, index) => {
    const top = headerHeight + index * rowHeight
    const centerY = top + rowHeight / 2
    const isLeft = Boolean(standing.player.leftRound)
    context.globalAlpha = isLeft ? 0.4 : 1

    if (index) {
      context.fillStyle = getColor('line')
      context.fillRect(padding, top, width - padding * 2, 1)
    }

    context.fillStyle = getColor(isLeft ? 'bg' : RankColors[index] || 'bg')
    context.beginPath()
    context.arc(rankX, centerY, 16, 0, Math.PI * 2)
    context.fill()
    setFont(context, 900, 14, getColor('ink'))
    context.textAlign = 'center'
    context.fillText(isLeft ? '–' : `${index + 1}`, rankX, centerY + 1)

    const streak = formatStreak(standing.streak)
    setFont(context, 700, 17, getColor('ink'))
    context.textAlign = 'right'
    context.fillText(streak, streakX, centerY + 1)
    const nameEnd = streak ? streakX - context.measureText(streak).width - 12 : Columns[0].x - 28

    setFont(context, 700, 18, getColor('ink'))
    context.textAlign = 'left'
    const name = isLeft ? `${standing.player.name} (gått hjem)` : standing.player.name
    context.fillText(fitText(context, name, nameEnd - nameX), nameX, centerY + 1)

    context.textAlign = 'right'
    Columns.forEach(column => {
      setFont(context, column.weight, column.weight === 900 ? 19 : 17, getColor('ink'))
      context.fillText(column.getValue(standing), column.x, centerY + 1)
    })
  })

  const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve, 'image/png'))
  return new File([blob], `padel-${tournament.createdAt.slice(0, 10)}.png`, { type: 'image/png' })
}
