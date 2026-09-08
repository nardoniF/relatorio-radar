import type { TripMode, TripReport, RadarPassage, PositionSample } from './types'
import { formatClock, formatDuration, formatKmh } from './geo'

export function buildReport(input: {
  mode: Exclude<TripMode, 'idle'>
  startedAt: number
  endedAt: number
  samples: PositionSample[]
  passages: RadarPassage[]
}): TripReport {
  const maxSpeedKmh = input.samples.reduce(
    (m, s) => Math.max(m, s.speedKmh),
    0,
  )
  const overs = input.passages.filter((p) => p.overLimit)
  return {
    mode: input.mode,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    durationMs: Math.max(0, input.endedAt - input.startedAt),
    maxSpeedKmh,
    samples: input.samples.length,
    passages: input.passages,
    overs,
  }
}

export function reportToText(report: TripReport): string {
  const lines: string[] = [
    'Relatório Radar',
    `Modo: ${report.mode === 'sim' ? 'Simulação' : 'GPS real'}`,
    `Início: ${formatClock(report.startedAt)}`,
    `Fim: ${formatClock(report.endedAt)}`,
    `Duração: ${formatDuration(report.durationMs)}`,
    `Vel. máx: ${formatKmh(report.maxSpeedKmh)} km/h`,
    `Radares passados: ${report.passages.length}`,
    `Acima do limite: ${report.overs.length}`,
    '',
  ]

  if (report.passages.length === 0) {
    lines.push('Nenhuma passagem por radar registrada.')
  } else {
    for (const p of report.passages) {
      const flag = p.overLimit ? '⚠️ ACIMA' : 'OK'
      lines.push(
        `${flag} · ${p.radar.name} · limite ${p.radar.limitKmh} · passou a ${formatKmh(p.speedKmh)} km/h` +
          (p.overLimit ? ` (+${formatKmh(p.excessKmh)})` : '') +
          ` · ${formatClock(p.passedAt)}`,
      )
    }
  }

  return lines.join('\n')
}
